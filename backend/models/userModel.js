const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      minlength: 2,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
      minlength: 2,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return this.password === value;
        },
        message: "Passwords do not match",
      },
    },
    userType: {
      type: String,
      required: true,
      enum: ["Doctor", "Pharmacy", "Patient", "Admin"],
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: function () {
          return this.userType === "Doctor" || this.userType === "Pharmacy";
        },
      },
      coordinates: {
        type: [Number],
        required: function () {
          return this.userType === "Doctor" || this.userType === "Pharmacy";
        },
      },
    },
    specialization: {
      type: String,
      required: function () {
        return this.userType === "Doctor";
      },
      enum: [
        "General Practice",
        "Cardiology",
        "Dermatology",
        "Pediatrics",
        "General Surgery",
        "Anesthesiology",
        "Radiology",
        "Psychiatry",
        "Obstetrics/Gynecology",
        "ENT",
      ],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: function () {
        return this.profileCompleted === true;
      },
    },
    age: {
      type: Number,
      min: 0,
      required: function () {
        return this.profileCompleted === true;
      },
    },
    avatar: {
      type: String,
      default: "default.jpg", // Default avatar
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordChangedAt: Date,
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },
    passwordResetOTP: {
      type: String,
      select: false, // This field needs to be explicitly selected
    },
    passwordResetOTPExpires: {
      type: Date,
      select: false, // This field needs to be explicitly selected
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for location-based queries
userSchema.index({ location: "2dsphere" });

// Virtual for user's full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
  // Only run this fun if password is modified
  // password "field"
  if (!this.isModified("password")) return next();
  // Hash the password with cost 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  this.passwordChangedAt = this.passwordChangedAt;
  next();
});

// Password change middleware
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }); // Find all documents where active is not equal to false
  next();
});

userSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusChangedAt = Date.now();
  }
  next();
});

// Instance methods
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimesTamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimesTamp);
    return JWTTimesTamp < changedTimestamp;
  }
  return false;
};

// In userSchema.methods:

userSchema.methods.createPasswordResetOTP = function () {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // console.log("Generated OTP before hashing:", otp); // Debug log

  // Hash OTP
  this.passwordResetOTP = crypto.createHash("sha256").update(otp).digest("hex");

  // console.log("Hashed OTP:", this.passwordResetOTP); // Debug log

  // Set expiry to 10 minutes
  this.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;

  return otp; // Return unhashed OTP for email
};

userSchema.methods.verifyOTP = function (candidateOTP) {
  if (!this.passwordResetOTP || !this.passwordResetOTPExpires) {
    // console.log("No OTP or expiry found"); // Debug log
    return false;
  }

  if (this.passwordResetOTPExpires < Date.now()) {
    // console.log("OTP expired"); // Debug log
    return false;
  }

  const hashedCandidateOTP = crypto
    .createHash("sha256")
    .update(candidateOTP.toString())
    .digest("hex");

  // console.log("Verification comparison:", {
  //   stored: this.passwordResetOTP,
  //   received: hashedCandidateOTP,
  // }); // Debug log

  return this.passwordResetOTP === hashedCandidateOTP;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Set expiration to 10 minutes
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

  return verificationToken;
};

userSchema.methods.isOnline = function () {
  return (
    // First condition: check if status is set to 'online'
    this.status === "online" &&
    // Second condition: check if user was active in last 5 minutes
    Date.now() - this.statusChangedAt < 5 * 60 * 1000
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;

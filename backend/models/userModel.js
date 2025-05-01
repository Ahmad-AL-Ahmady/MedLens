const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const slugify = require("slugify");

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
    slug: {
      type: String,
      unique: true,
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
      select: false,
    },
    passwordResetOTPExpires: {
      type: Date,
      select: false,
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
userSchema.index({ userType: 1 }); // For filtering doctors/patients
userSchema.index({ firstName: 1, lastName: 1 }); // For name searches

// Virtual for user's full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.pre("save", function (next) {
  if (this.isModified("firstName") || this.isModified("lastName")) {
    this.slug = slugify(`${this.firstName} ${this.lastName} ${this._id}`, {
      lower: true,
      strict: true,
    });
  }
  next();
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

// Create a flag to track if this is a new document
userSchema.pre("save", function (next) {
  this._isNewDocument = this.isNew; // Store the "isNew" state before saving
  next();
});

// This will automatically create the appropriate profile when a new user is created
userSchema.post("save", async function (doc) {
  if (doc._isNewDocument) {
    console.log(
      `Post-save hook triggered for user: ${doc._id}, type: ${doc.userType}`
    );
    try {
      // Check if a profile already exists to prevent duplicates
      let profileExists = false;

      if (doc.userType === "Patient") {
        console.log("Creating PatientProfile...");
        try {
          const PatientProfile = mongoose.model("PatientProfile");
          profileExists = await PatientProfile.exists({ user: doc._id });
          console.log(`Profile exists check result: ${profileExists}`);

          if (!profileExists) {
            const patientProfile = await PatientProfile.create({
              user: doc._id,
            });
            console.log(
              `PatientProfile created successfully: ${patientProfile._id}`
            );
          } else {
            console.log(`PatientProfile already exists for user ${doc._id}`);
          }
        } catch (modelError) {
          console.error("Error with PatientProfile model:", modelError);
        }
      } else if (doc.userType === "Doctor") {
        console.log("Creating DoctorProfile...");
        try {
          // Require the model directly to ensure it's loaded
          const DoctorProfile = require("./doctorProfileModel");
          profileExists = await DoctorProfile.exists({ user: doc._id });

          if (!profileExists) {
            // Create with properly structured availability
            const defaultAvailability = {
              isAvailable: false,
            };

            const doctorProfile = await DoctorProfile.create({
              user: doc._id,
              availability: {
                monday: defaultAvailability,
                tuesday: defaultAvailability,
                wednesday: defaultAvailability,
                thursday: defaultAvailability,
                friday: defaultAvailability,
                saturday: defaultAvailability,
                sunday: defaultAvailability,
              },
            });
            console.log(
              `DoctorProfile created successfully: ${doctorProfile._id}`
            );
          } else {
            console.log(`DoctorProfile already exists for user ${doc._id}`);
          }
        } catch (modelError) {
          console.error("Error with DoctorProfile model:", modelError.message);
          // Throw the error to ensure we know if profile creation fails
          throw modelError;
        }
      } else if (doc.userType === "Pharmacy") {
        console.log("Creating PharmacyProfile...");
        try {
          const PharmacyProfile = mongoose.model("PharmacyProfile");
          profileExists = await PharmacyProfile.exists({ user: doc._id });

          if (!profileExists) {
            const pharmacyProfile = await PharmacyProfile.create({
              user: doc._id,
            });
            console.log(
              `PharmacyProfile created successfully: ${pharmacyProfile._id}`
            );
          } else {
            console.log(`PharmacyProfile already exists for user ${doc._id}`);
          }
        } catch (modelError) {
          console.error("Error with PharmacyProfile model:", modelError);
        }
      }
    } catch (error) {
      console.error("Error in profile creation post-save hook:", error.message);
      throw error; // Re-throw to ensure we know if profile creation fails
    }
  } else {
    console.log(`User ${doc._id} updated (not creating profile)`);
  }
});

// Add these virtual properties to the userSchema to help with populating related data
userSchema.virtual("patientProfile", {
  ref: "PatientProfile",
  foreignField: "user",
  localField: "_id",
  justOne: true, // This ensures it returns an object, not an array
});

userSchema.virtual("doctorProfile", {
  ref: "DoctorProfile",
  foreignField: "user",
  localField: "_id",
  justOne: true,
});

userSchema.virtual("pharmacyProfile", {
  ref: "PharmacyProfile",
  foreignField: "user",
  localField: "_id",
  justOne: true,
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

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
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
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordResetOTP: String,
  passwordResetOTPExpires: Date,
});

// Index for location-based queries
userSchema.index({ location: "2dsphere" });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Only find active users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Instance methods
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetOTP = function () {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP before saving to database
  this.passwordResetOTP = crypto.createHash("sha256").update(otp).digest("hex");

  // Set expiry to 10 minutes
  this.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;

  return otp;
};

userSchema.methods.verifyOTP = function (candidateOTP) {
  const hashedOTP = crypto
    .createHash("sha256")
    .update(candidateOTP)
    .digest("hex");

  return (
    this.passwordResetOTP === hashedOTP &&
    this.passwordResetOTPExpires > Date.now()
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;

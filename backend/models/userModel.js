const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide your username"],
    minlength: 5,
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
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  phone: {
    type: String,
    required: [true, "Please provide your phone number"],
    validate: {
      validator: function (v) {
        return /^\d{11}$/.test(v);
      },
      message: "Phone number must be 11 digits",
    },
  },
  userType: {
    type: String,
    required: true,
    enum: ["doctor", "pharmacy", "user"],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: function () {
        return this.userType === "doctor" || this.userType === "pharmacy";
      },
    },
    coordinates: {
      type: [Number],
      required: function () {
        return this.userType === "doctor" || this.userType === "pharmacy";
      },
    },
  },
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide your first name"],
    minlength: 2,
  },
  lastName: {
    type: String,
    required: [true, "Please provide your last name"],
    minlength: 2,
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
  userType: {
    type: String,
    required: true,
    enum: ["Doctor", "Pharmacy", "Patient", "Admin"],
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
  gender: {
    type: String,
    required: [true, "Please provide your gender"],
    enum: ["male", "female"],
  },
  age: {
    type: Number,
    required: [true, "Please provide your age"],
    min: 0,
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

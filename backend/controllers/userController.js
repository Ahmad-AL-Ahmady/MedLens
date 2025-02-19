const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs").promises;
const path = require("path");

// Add other user-related controller methods here
exports.updateMe = catchAsync(async (req, res, next) => {
  // Update user data except password
  // ... implementation
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // Deactivate user account
  // ... implementation
});

exports.getMe = catchAsync(async (req, res, next) => {
  // Get current user profile
  // ... implementation
});

// If you implement avatar upload functionality
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image file.", 400));
  }

  // If user already has an avatar, delete the old one
  if (req.user.avatar && req.user.avatar !== "default.jpg") {
    try {
      await fs.unlink(path.join("public/uploads/users", req.user.avatar));
    } catch (err) {
      console.error("Error deleting old avatar:", err);
    }
  }

  // Update user with new avatar filename
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: req.file.filename },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteAvatar = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.avatar !== "default.jpg") {
    // Delete avatar file
    try {
      await fs.unlink(path.join("public/uploads/users", user.avatar));
    } catch (err) {
      console.error("Error deleting avatar:", err);
    }

    // Reset to default avatar
    user.avatar = "default.jpg";
    await user.save();
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

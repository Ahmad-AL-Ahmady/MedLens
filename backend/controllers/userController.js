const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs").promises;
const path = require("path");

// Get current user profile
exports.getMe = catchAsync(async (req, res, next) => {
  // User is already available in req.user from the protect middleware
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if avatar exists and fallback to default if needed
  if (user.avatar && user.avatar !== "default.jpg") {
    const avatarPath = path.join(
      __dirname,
      "..",
      "public",
      "uploads",
      "users",
      user.avatar
    );
    try {
      await fs.access(avatarPath);
    } catch (err) {
      console.log(`Avatar not found: ${user.avatar}, falling back to default`);
      user.avatar = "default.jpg";
    }
  }

  // Populate different profile data based on user type
  let populatedUser;
  if (user.userType === "Patient") {
    populatedUser = await User.findById(user.id).populate("patientProfile");
  } else if (user.userType === "Doctor") {
    populatedUser = await User.findById(user.id).populate("doctorProfile");
  } else if (user.userType === "Pharmacy") {
    populatedUser = await User.findById(user.id).populate("pharmacyProfile");
  } else {
    populatedUser = user;
  }

  res.status(200).json({
    status: "success",
    data: {
      user: populatedUser,
    },
  });
});

// Update current user data (except password)
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Check if user is trying to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updatePassword.",
        400
      )
    );
  }

  // 2) Filter unwanted fields that should not be updated
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "gender",
    "age"
  );

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Deactivate current user account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Avatar upload functionality
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image file.", 400));
  }

  // Define absolute paths properly
  const uploadsDir = path.join(__dirname, "..", "public", "uploads", "users");
  const newAvatarPath = path.join(uploadsDir, req.file.filename);

  // Check if new avatar file exists
  try {
    await fs.access(newAvatarPath);
    console.log(`New avatar file exists at: ${newAvatarPath}`);
  } catch (err) {
    return next(new AppError("Error saving avatar file.", 500));
  }

  // Delete old avatar if it exists and isn't the default
  if (req.user.avatar && req.user.avatar !== "default.jpg") {
    const oldAvatarPath = path.join(uploadsDir, req.user.avatar);
    try {
      await fs.access(oldAvatarPath);
      await fs.unlink(oldAvatarPath);
      console.log(`Deleted old avatar: ${oldAvatarPath}`);
    } catch (err) {
      console.log(`Note: Could not delete old avatar: ${err.message}`);
      // Continue even if deletion fails
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

  // Add timestamp for cache busting
  const timestamp = Date.now();
  const avatarUrl = `/public/uploads/users/${req.file.filename}?t=${timestamp}`;

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
      avatarUrl,
    },
  });
});

// Delete avatar
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

// ADMIN CONTROLLERS

// Get all users - Admin only
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Add filtering options
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// Get specific user - Admin only
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  // Populate different profile data based on user type
  let populatedUser;
  if (user.userType === "Patient") {
    populatedUser = await User.findById(user.id).populate("patientProfile");
  } else if (user.userType === "Doctor") {
    populatedUser = await User.findById(user.id).populate("doctorProfile");
  } else if (user.userType === "Pharmacy") {
    populatedUser = await User.findById(user.id).populate("pharmacyProfile");
  } else {
    populatedUser = user;
  }

  res.status(200).json({
    status: "success",
    data: {
      user: populatedUser,
    },
  });
});

// Update user - Admin only
exports.updateUser = catchAsync(async (req, res, next) => {
  // NOTE: This route should NOT be used to update passwords
  const filteredBody = filterObj(
    req.body,
    "firstName",
    "lastName",
    "email",
    "userType",
    "gender",
    "age",
    "active"
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Delete user - Admin only
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Helper function to filter object properties
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

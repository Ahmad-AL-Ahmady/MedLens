/**
 * profileController.js
 *
 * This file handles profile management functionality for different user types in the HealthVision backend.
 * It provides endpoints for managing patient, doctor, and pharmacy profiles with their specific data.
 *
 * Features:
 * - Get user profiles with type-specific populated data
 * - Update profile information based on user type
 * - Automatic profile creation for new users
 * - Type-specific data validation and filtering
 * - Related data population (appointments, reviews, inventory)
 *
 * The controller handles three types of profiles:
 * - Patient profiles with medical history and appointments
 * - Doctor profiles with availability and specialization
 * - Pharmacy profiles with inventory and operating hours
 */

const User = require("../models/userModel");
const PatientProfile = require("../models/patientProfileModel");
const DoctorProfile = require("../models/doctorProfileModel");
const PharmacyProfile = require("../models/pharmacyProfileModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Get user profile with related data based on user type
exports.getProfile = catchAsync(async (req, res, next) => {
  // Get current user
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Find profile based on user type
  let profile;
  let populatedProfile;

  switch (user.userType) {
    case "Patient":
      // Find basic profile
      profile = await PatientProfile.findOne({ user: user._id });

      // If profile exists, get populated version with related data
      if (profile) {
        populatedProfile = await PatientProfile.findOne({ user: user._id })
          .populate({
            path: "medicalScans",
            options: { sort: { createdAt: -1 }, limit: 5 },
          })
          .populate({
            path: "appointments",
            options: { sort: { date: 1 }, limit: 5 },
            populate: {
              path: "doctor",
              select: "firstName lastName specialization avatar",
            },
          });
      }
      break;

    case "Doctor":
      // Find basic profile
      profile = await DoctorProfile.findOne({ user: user._id });

      // If profile exists, get populated version with related data
      if (profile) {
        populatedProfile = await DoctorProfile.findOne({ user: user._id })
          .populate({
            path: "appointments",
            options: { sort: { date: 1 }, limit: 10 },
            populate: {
              path: "patient",
              select: "firstName lastName age gender avatar",
            },
          })
          .populate({
            path: "reviews",
            options: { sort: { createdAt: -1 }, limit: 5 },
            populate: {
              path: "reviewer",
              select: "firstName lastName avatar",
            },
          });
      }
      break;

    case "Pharmacy":
      // Find basic profile
      profile = await PharmacyProfile.findOne({ user: user._id });

      // If profile exists, get populated version with related data
      if (profile) {
        populatedProfile = await PharmacyProfile.findOne({ user: user._id })
          .populate({
            path: "inventory",
            populate: {
              path: "medication",
            },
          })
          .populate({
            path: "reviews",
            options: { sort: { createdAt: -1 }, limit: 5 },
            populate: {
              path: "reviewer",
              select: "firstName lastName avatar",
            },
          });
      }
      break;

    default:
      return next(
        new AppError(`Profile type not supported for ${user.userType}`, 400)
      );
  }

  // If profile not found, create a basic one
  if (!profile) {
    switch (user.userType) {
      case "Patient":
        profile = await PatientProfile.create({ user: user._id });
        break;
      case "Doctor":
        profile = await DoctorProfile.create({ user: user._id });
        break;
      case "Pharmacy":
        profile = await PharmacyProfile.create({ user: user._id });
        break;
    }
    populatedProfile = profile;
  }

  // Prepare user object
  const userData = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userType: user.userType,
    profileCompleted: user.profileCompleted,
    avatar: user.avatar,
    gender: user.gender,
    age: user.age,
  };

  // Add location for Doctor and Pharmacy users
  if (user.userType === "Doctor" || user.userType === "Pharmacy") {
    userData.location = user.location;
  }

  // Add specialization for Doctors
  if (user.userType === "Doctor") {
    userData.specialization = user.specialization;
  }

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      user: userData,
      profile: populatedProfile,
    },
  });
});

// Update profile based on user type
exports.updateProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  let updatedProfile;
  let allowedFields = [];

  // Determine allowed fields based on user type
  switch (user.userType) {
    case "Patient":
      allowedFields = []; // Add fields as they're implemented
      break;
    case "Doctor":
      allowedFields = ["fees", "availability", "education", "experience"];
      break;
    case "Pharmacy":
      allowedFields = ["description", "openingHours"];
      break;
    default:
      return next(
        new AppError(`Profile type not supported for ${user.userType}`, 400)
      );
  }

  // Filter request body to only include allowed fields
  const filteredBody = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  // If no allowed fields were provided, throw error
  if (Object.keys(filteredBody).length === 0) {
    return next(new AppError("No valid fields provided for update", 400));
  }

  // Update profile based on user type
  switch (user.userType) {
    case "Patient":
      updatedProfile = await PatientProfile.findOneAndUpdate(
        { user: user._id },
        filteredBody,
        { new: true, runValidators: true }
      );
      break;
    case "Doctor":
      updatedProfile = await DoctorProfile.findOneAndUpdate(
        { user: user._id },
        filteredBody,
        { new: true, runValidators: true }
      );
      break;
    case "Pharmacy":
      updatedProfile = await PharmacyProfile.findOneAndUpdate(
        { user: user._id },
        filteredBody,
        { new: true, runValidators: true }
      );
      break;
  }

  // If profile doesn't exist, create it with the provided data
  if (!updatedProfile) {
    switch (user.userType) {
      case "Patient":
        updatedProfile = await PatientProfile.create({
          user: user._id,
          ...filteredBody,
        });
        break;
      case "Doctor":
        updatedProfile = await DoctorProfile.create({
          user: user._id,
          ...filteredBody,
        });
        break;
      case "Pharmacy":
        updatedProfile = await PharmacyProfile.create({
          user: user._id,
          ...filteredBody,
        });
        break;
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      profile: updatedProfile,
    },
  });
});

// Ensure profile exists - utility function
exports.ensureProfileExists = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  let profile;

  // Check if profile exists
  switch (user.userType) {
    case "Patient":
      profile = await PatientProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await PatientProfile.create({ user: user._id });
      }
      break;
    case "Doctor":
      profile = await DoctorProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await DoctorProfile.create({ user: user._id });
      }
      break;
    case "Pharmacy":
      profile = await PharmacyProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await PharmacyProfile.create({ user: user._id });
      }
      break;
    default:
      return next(
        new AppError(`Profile type not supported for ${user.userType}`, 400)
      );
  }

  // Add profile to request object
  req.profile = profile;
  next();
});

exports.testAllProfileTypes = catchAsync(async (req, res, next) => {
  // Get current user
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Test all profile types
  const results = {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
    },
    profiles: {},
  };

  // Check if PatientProfile model is registered and available
  try {
    const patientProfile = await PatientProfile.findOne({ user: user._id });
    results.profiles.patient = {
      exists: !!patientProfile,
      profileId: patientProfile ? patientProfile._id : null,
    };

    // If profile doesn't exist, create it
    if (!patientProfile) {
      const newProfile = await PatientProfile.create({ user: user._id });
      results.profiles.patient.created = true;
      results.profiles.patient.profileId = newProfile._id;
    }
  } catch (error) {
    results.profiles.patient = {
      error: error.message,
    };
  }

  // Check if DoctorProfile model is registered and available
  try {
    const doctorProfile = await DoctorProfile.findOne({ user: user._id });
    results.profiles.doctor = {
      exists: !!doctorProfile,
      profileId: doctorProfile ? doctorProfile._id : null,
    };

    // If profile doesn't exist, create it
    if (!doctorProfile) {
      const newProfile = await DoctorProfile.create({ user: user._id });
      results.profiles.doctor.created = true;
      results.profiles.doctor.profileId = newProfile._id;
    }
  } catch (error) {
    results.profiles.doctor = {
      error: error.message,
    };
  }

  // Check if PharmacyProfile model is registered and available
  try {
    const pharmacyProfile = await PharmacyProfile.findOne({ user: user._id });
    results.profiles.pharmacy = {
      exists: !!pharmacyProfile,
      profileId: pharmacyProfile ? pharmacyProfile._id : null,
    };

    // If profile doesn't exist, create it
    if (!pharmacyProfile) {
      const newProfile = await PharmacyProfile.create({ user: user._id });
      results.profiles.pharmacy.created = true;
      results.profiles.pharmacy.profileId = newProfile._id;
    }
  } catch (error) {
    results.profiles.pharmacy = {
      error: error.message,
    };
  }

  res.status(200).json({
    status: "success",
    data: results,
  });
});

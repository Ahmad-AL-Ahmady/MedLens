// File: routes/profileRoutes.js
const express = require("express");
const authController = require("../controllers/authController");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const PatientProfile = require("../models/patientProfileModel");

const router = express.Router();

// Protect all profile routes
router.use(authController.protect);

// Test route to check if profiles are being created
router.get(
  "/test-profile",
  catchAsync(async (req, res, next) => {
    // Get current user
    const user = await User.findById(req.user.id);

    // Find the profile based on user type
    let profile;
    let modelName;

    if (user.userType === "Patient") {
      profile = await PatientProfile.findOne({ user: user._id });
      modelName = "PatientProfile";
    } else if (user.userType === "Doctor") {
      // This will only work if DoctorProfile model is defined
      try {
        const DoctorProfile = require("../models/doctorProfileModel");
        profile = await DoctorProfile.findOne({ user: user._id });
        modelName = "DoctorProfile";
      } catch (error) {
        console.error("Error loading DoctorProfile model:", error);
      }
    } else if (user.userType === "Pharmacy") {
      // This will only work if PharmacyProfile model is defined
      try {
        const PharmacyProfile = require("../models/pharmacyProfileModel");
        profile = await PharmacyProfile.findOne({ user: user._id });
        modelName = "PharmacyProfile";
      } catch (error) {
        console.error("Error loading PharmacyProfile model:", error);
      }
    }

    // If profile doesn't exist, try creating it
    if (!profile && user.userType === "Patient") {
      profile = await PatientProfile.create({ user: user._id });
    }

    res.status(200).json({
      status: "success",
      data: {
        userType: user.userType,
        profileModel: modelName,
        profileExists: !!profile,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
        profile: profile,
      },
    });
  })
);

// Get my profile - returns different profile based on user type
router.get(
  "/my-profile",
  catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    let profile;
    if (user.userType === "Patient") {
      profile = await PatientProfile.findOne({ user: user._id });
    } else if (user.userType === "Doctor") {
      try {
        const DoctorProfile = require("../models/doctorProfileModel");
        profile = await DoctorProfile.findOne({ user: user._id });
      } catch (error) {
        console.error("Doctor profile model not available yet");
      }
    } else if (user.userType === "Pharmacy") {
      try {
        const PharmacyProfile = require("../models/pharmacyProfileModel");
        profile = await PharmacyProfile.findOne({ user: user._id });
      } catch (error) {
        console.error("Pharmacy profile model not available yet");
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        profile,
      },
    });
  })
);

// Update my profile
router.patch(
  "/update-profile",
  catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    // Filter allowed fields based on user type
    let allowedFields = [];
    let profile;

    if (user.userType === "Patient") {
      allowedFields = [
        "allergies",
        "chronicConditions",
        "bloodType",
        "emergencyContact",
      ];
      // Filter request body
      const filteredBody = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedFields.includes(key)) {
          filteredBody[key] = req.body[key];
        }
      });

      profile = await PatientProfile.findOneAndUpdate(
        { user: user._id },
        filteredBody,
        { new: true, runValidators: true }
      );
    }

    // Add other profile types here when available

    if (!profile) {
      return res.status(404).json({
        status: "fail",
        message: "Profile not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        profile,
      },
    });
  })
);

module.exports = router;

// models/index.js
// This file ensures proper model registration order
const mongoose = require("mongoose");

// First register all profile models
const PatientProfile = require("./patientProfileModel");

// Create placeholder models if they don't exist yet
try {
  // Only register if not already registered
  if (!mongoose.modelNames().includes("DoctorProfile")) {
    const mongoose = require("mongoose");
    const doctorProfileSchema = new mongoose.Schema(
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
          unique: true,
        },
      },
      {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
      }
    );
    mongoose.model("DoctorProfile", doctorProfileSchema);
    console.log("Placeholder DoctorProfile model registered");
  }

  if (!mongoose.modelNames().includes("PharmacyProfile")) {
    const mongoose = require("mongoose");
    const pharmacyProfileSchema = new mongoose.Schema(
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
          unique: true,
        },
      },
      {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
      }
    );
    mongoose.model("PharmacyProfile", pharmacyProfileSchema);
    console.log("Placeholder PharmacyProfile model registered");
  }
} catch (error) {
  console.error("Error registering placeholder models:", error);
}

// Then register the User model that depends on them
const User = require("./userModel");

// Export all models
module.exports = {
  User,
  PatientProfile,
  // Later you'll add:
  // DoctorProfile,
  // PharmacyProfile,
};

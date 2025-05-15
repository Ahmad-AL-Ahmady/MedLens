/**
 * patientProfileModel.js
 *
 * This file defines the Mongoose schema for the PatientProfile model in the HealthVision backend.
 * It includes fields for patient details such as user reference.
 */

const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Virtual populate for scans
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for scans
patientProfileSchema.virtual("medicalScans", {
  ref: "MedicalScan",
  foreignField: "patient",
  localField: "user",
});

// Virtual populate for appointments
patientProfileSchema.virtual("appointments", {
  ref: "Appointment",
  foreignField: "patient",
  localField: "user",
});

const PatientProfile = mongoose.model("PatientProfile", patientProfileSchema);

module.exports = PatientProfile;

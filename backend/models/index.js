/**
 * index.js
 *
 * This file serves as the central registry for all Mongoose models in the HealthVision backend.
 * It ensures proper model registration order to handle dependencies between models correctly.
 * The file exports all models as a single object for easy access throughout the application.
 *
 * Registration order:
 * 1. Profile models (Patient, Doctor, Pharmacy)
 * 2. User model (which depends on profile models)
 * 3. Other models (MedicalScan, Appointment, Medication, etc.)
 */

// This file ensures proper model registration order
const mongoose = require("mongoose");

// First, register all profile models
const PatientProfile = require("./patientProfileModel");
const DoctorProfile = require("./doctorProfileModel");
const PharmacyProfile = require("./pharmacyProfileModel");

// Register the User model that depends on them
const User = require("./userModel");

// Register other models
const MedicalScan = require("./medicalScanModel");
const Appointment = require("./appointmentModel");
const Medication = require("./medicationModel");
const PharmacyInventory = require("./pharmacyInventoryModel");
const Review = require("./reviewModel");

// Export all models
module.exports = {
  User,
  PatientProfile,
  DoctorProfile,
  PharmacyProfile,
  MedicalScan,
  Appointment,
  Medication,
  PharmacyInventory,
  Review,
};

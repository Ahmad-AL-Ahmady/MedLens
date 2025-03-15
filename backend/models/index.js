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

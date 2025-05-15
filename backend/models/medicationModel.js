/**
 * medicationModel.js
 *
 * This file defines the Mongoose schema for the Medication model in the HealthVision backend.
 * It includes fields for medication details such as name, description, strength, and inventory information.
 */

const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medication name is required"],
      trim: true,
    },
    // genericName: String,
    // manufacturer: String,
    description: String,
    strength: String, // e.g., "500mg"
  },
  {
    timestamps: true,
  }
);

const Medication = mongoose.model("Medication", medicationSchema);
module.exports = Medication;

const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

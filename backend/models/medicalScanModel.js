const mongoose = require("mongoose");

const medicalScanSchema = new mongoose.Schema(
  {
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    scanDate: {
      type: Date,
      default: Date.now,
    },
    images: [String], // Array of image URLs/paths
    bodyPart: {
      type: String,
      required: true,
    },
    description: String,
    aiAnalysis: {
      diagnosisConfidence: Number,
      findings: String,
      infectionDetected: Boolean,
      processingDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
medicalScanSchema.index({ uploadedBy: 1 });
medicalScanSchema.index({ scanDate: 1 });

const MedicalScan = mongoose.model("MedicalScan", medicalScanSchema);

module.exports = MedicalScan;

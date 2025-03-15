const mongoose = require("mongoose");

const medicalScanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    scanType: {
      type: String,
      enum: ["X-Ray", "CT", "MRI", "Ultrasound"],
      required: true,
    },
    scanDate: {
      type: Date,
      default: Date.now,
    },
    images: [String], // Array of image URLs/paths
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    description: String,
    bodyPart: String,
    aiAnalysis: {
      diagnosisConfidence: Number,
      findings: String,
      infectionDetected: Boolean,
      recommendations: String,
      processingDate: Date,
    },
    doctorNotes: {
      doctor: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      notes: String,
      date: Date,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalScan = mongoose.model("MedicalScan", medicalScanSchema);

module.exports = MedicalScan;

/**
 * medicalScanModel.js
 *
 * This file defines the Mongoose schema for the MedicalScan model in the HealthVision backend.
 * It includes fields for scan details such as patient reference, scan type, image URL, and results.
 */

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
      enum: [
        "Chest",
        "Eye",
        "Brain",
        "Bones",
        "Breast",
        "Lung",
        "Kidney",
        "Nail",
        "Skin",
      ],
    },
    description: String,
    aiAnalysis: {
      classification_result: String,
      confidence_score: Number,
      body_part: String,
      processingDate: {
        type: Date,
        default: Date.now,
      },
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

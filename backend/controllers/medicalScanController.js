const MedicalScan = require("../models/medicalScanModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs").promises;
const path = require("path");

/**
 * Get all scans created by the current user
 */
exports.getMyScans = catchAsync(async (req, res, next) => {
  // Users can only see their own scans
  const query = { uploadedBy: req.user.id };

  if (req.query.bodyPart) {
    query.bodyPart = { $regex: req.query.bodyPart, $options: "i" };
  }

  // Add optional date range filtering
  if (req.query.startDate && req.query.endDate) {
    query.scanDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  } else if (req.query.startDate) {
    query.scanDate = { $gte: new Date(req.query.startDate) };
  } else if (req.query.endDate) {
    query.scanDate = { $lte: new Date(req.query.endDate) };
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get all medical scans based on query
  const scans = await MedicalScan.find(query)
    .sort({ scanDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalScans = await MedicalScan.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: scans.length,
    pagination: {
      page,
      limit,
      totalScans,
      totalPages: Math.ceil(totalScans / limit),
    },
    data: {
      scans,
    },
  });
});

/**
 * Get a specific scan by ID
 */
exports.getScanById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the medical scan
  const scan = await MedicalScan.findById(id);

  if (!scan) {
    return next(new AppError("Medical scan not found", 404));
  }

  // Check if the user is the creator of this scan
  if (scan.uploadedBy.toString() !== req.user.id) {
    return next(new AppError("You are not authorized to view this scan", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      scan,
    },
  });
});

/**
 * Upload a new scan metadata
 */
exports.uploadScan = catchAsync(async (req, res, next) => {
  const { bodyPart, description } = req.body;

  // Validate required fields
  if (!bodyPart) {
    return next(new AppError("Body part is required", 400));
  }

  // Create new medical scan record
  const scan = await MedicalScan.create({
    uploadedBy: req.user.id,
    scanDate: new Date(),
    bodyPart,
    description,
    images: [], // Will be populated during image upload
  });

  // Return the created scan with a temporary URL for the front-end
  res.status(201).json({
    status: "success",
    data: {
      scan,
      uploadUrl: `/api/medical-scans/${scan._id}/upload-image`,
    },
  });
});

/**
 * Upload an image for a medical scan
 */
exports.uploadScanImage = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if scan exists
  const scan = await MedicalScan.findById(id);
  if (!scan) {
    return next(new AppError("Medical scan not found", 404));
  }

  // Check authorization - only the creator can upload images
  if (scan.uploadedBy.toString() !== req.user.id) {
    return next(
      new AppError("You are not authorized to modify this scan", 403)
    );
  }

  // Check if file was uploaded
  if (!req.file) {
    return next(new AppError("No image file provided", 400));
  }

  // Save file info to scan record
  const imageUrl = `/public/uploads/scans/${req.file.filename}`;

  // Update scan with image URL
  scan.images = scan.images || [];
  scan.images.push(imageUrl);

  // For our example, we'll simulate the AI analysis response
  // In a real implementation, this would call your Python service
  scan.aiAnalysis = {
    diagnosisConfidence: Math.random() * 0.3 + 0.7, // Random between 0.7 and 1.0
    findings: getSampleDiagnosis(),
    infectionDetected: Math.random() > 0.5, // Random true/false
    processingDate: new Date(),
  };

  await scan.save();

  res.status(200).json({
    status: "success",
    data: {
      scan,
    },
  });
});

/**
 * Delete a medical scan
 */
exports.deleteScan = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the medical scan
  const scan = await MedicalScan.findById(id);

  if (!scan) {
    return next(new AppError("Medical scan not found", 404));
  }

  // Check if the user is the creator of this scan
  if (scan.uploadedBy.toString() !== req.user.id) {
    return next(
      new AppError("You are not authorized to delete this scan", 403)
    );
  }

  // Delete any associated images
  if (scan.images && scan.images.length > 0) {
    for (const imageUrl of scan.images) {
      try {
        // Extract filename from URL
        const filename = imageUrl.split("/").pop();
        const imagePath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          "scans",
          filename
        );

        // Check if file exists before attempting to delete
        await fs.access(imagePath);
        await fs.unlink(imagePath);
      } catch (error) {
        console.error(`Error deleting scan image: ${error.message}`);
        // Continue with deletion even if an image fails to delete
      }
    }
  }

  // Delete the scan record
  await MedicalScan.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Medical scan deleted successfully",
    data: null,
  });
});

/**
 * Get common body parts (for dropdown menus)
 */
exports.getBodyParts = catchAsync(async (req, res, next) => {
  const bodyParts = [
    "Chest",
    "Abdomen",
    "Head",
    "Neck",
    "Spine",
    "Arm",
    "Leg",
    "Pelvis",
    "Hand",
    "Foot",
  ];

  res.status(200).json({
    status: "success",
    data: {
      bodyParts,
    },
  });
});

// Helper function to generate sample diagnoses
function getSampleDiagnosis() {
  const diagnoses = [
    "Pneumonia",
    "Fracture",
    "Normal findings",
    "Bronchitis",
    "Appendicitis",
    "Minor inflammation",
    "Early-stage cancer",
    "Disc herniation",
    "Ligament tear",
    "Inflammation",
    "Gallstones",
    "Cyst",
  ];

  return diagnoses[Math.floor(Math.random() * diagnoses.length)];
}

const User = require("../models/userModel");
const PatientProfile = require("../models/patientProfileModel");
const Appointment = require("../models/appointmentModel");
const MedicalScan = require("../models/medicalScanModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

/**
 * Get the current patient's profile
 * Includes basic profile information and references to related data
 */
exports.getMyProfile = catchAsync(async (req, res, next) => {
  // Get user details
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.userType !== "Patient") {
    return next(new AppError("This route is only for patients", 403));
  }

  // Get patient profile with populated data
  let patientProfile = await PatientProfile.findOne({ user: user._id })
    .populate({
      path: "medicalScans",
      options: { sort: { createdAt: -1 }, limit: 5 },
    })
    .populate({
      path: "appointments",
      options: { sort: { date: 1 }, limit: 5 },
      populate: {
        path: "doctor",
        select: "firstName lastName specialization avatar",
      },
    });

  // If profile doesn't exist, create it
  if (!patientProfile) {
    patientProfile = await PatientProfile.create({ user: user._id });
  }

  // Prepare the response
  const responseData = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    gender: user.gender,
    age: user.age,
    avatar: user.avatar,
    profile: patientProfile,
  };

  res.status(200).json({
    status: "success",
    data: responseData,
  });
});

/**
 * Update patient profile
 * Currently only updates basic information as the patient profile is minimal
 */
exports.updateProfile = catchAsync(async (req, res, next) => {
  // Get user
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.userType !== "Patient") {
    return next(new AppError("This route is only for patients", 403));
  }

  // Find patient profile
  let patientProfile = await PatientProfile.findOne({ user: user._id });

  // If profile doesn't exist, create it
  if (!patientProfile) {
    patientProfile = await PatientProfile.create({ user: user._id });
  }

  // Currently, we only update the user document fields (like name, email, etc.)
  // since the PatientProfile model doesn't have many fields yet
  // This could be expanded in the future to include more patient-specific fields

  // Update user's basic information if provided
  const allowedUserFields = ["firstName", "lastName", "gender", "age"];
  const filteredUserBody = {};
  
  Object.keys(req.body).forEach((key) => {
    if (allowedUserFields.includes(key)) {
      filteredUserBody[key] = req.body[key];
    }
  });

  if (Object.keys(filteredUserBody).length > 0) {
    await User.findByIdAndUpdate(user._id, filteredUserBody, {
      new: true,
      runValidators: true,
    });
  }

  // Get updated data
  const updatedUser = await User.findById(user._id);
  const updatedProfile = await PatientProfile.findOne({ user: user._id })
    .populate({
      path: "medicalScans",
      options: { sort: { createdAt: -1 }, limit: 5 },
    })
    .populate({
      path: "appointments",
      options: { sort: { date: 1 }, limit: 5 },
      populate: {
        path: "doctor",
        select: "firstName lastName specialization avatar",
      },
    });

  res.status(200).json({
    status: "success",
    data: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      gender: updatedUser.gender,
      age: updatedUser.age,
      avatar: updatedUser.avatar,
      profile: updatedProfile,
    },
  });
});

/**
 * Get patient dashboard data
 * Aggregates all relevant data for the patient dashboard in one request
 */
exports.getDashboardData = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Check if user is a patient
  const user = await User.findById(userId);
  if (!user || user.userType !== "Patient") {
    return next(new AppError("This route is only for patients", 403));
  }

  // Get upcoming appointments (next 30 days)
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  const upcomingAppointments = await Appointment.find({
    patient: userId,
    date: { $gte: today, $lte: nextMonth },
    status: { $nin: ["cancelled"] },
  })
    .sort({ date: 1, startTime: 1 })
    .limit(5)
    .populate({
      path: "doctor",
      select: "firstName lastName specialization avatar",
    });

  // Get recent medical scans
  const recentScans = await MedicalScan.find({
    patient: userId,
  })
    .sort({ createdAt: -1 })
    .limit(5);

  // Get total number of appointments
  const appointmentStats = {
    upcoming: await Appointment.countDocuments({
      patient: userId,
      date: { $gte: today },
      status: { $nin: ["cancelled"] },
    }),
    completed: await Appointment.countDocuments({
      patient: userId,
      status: "completed",
    }),
    cancelled: await Appointment.countDocuments({
      patient: userId,
      status: "cancelled",
    }),
    total: await Appointment.countDocuments({
      patient: userId,
    }),
  };

  // Get total number of medical scans
  const scanStats = {
    total: await MedicalScan.countDocuments({
      patient: userId,
    }),
    withDiagnosis: await MedicalScan.countDocuments({
      patient: userId,
      "aiAnalysis.diagnosisConfidence": { $exists: true, $ne: null },
    }),
  };

  // Assemble the dashboard data
  const dashboardData = {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
    },
    appointments: {
      upcoming: upcomingAppointments,
      stats: appointmentStats,
    },
    medicalScans: {
      recent: recentScans,
      stats: scanStats,
    },
  };

  res.status(200).json({
    status: "success",
    data: dashboardData,
  });
});

/**
 * Get all medical scans for the current patient
 */
exports.getMyMedicalScans = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Check if user is a patient
  const user = await User.findById(userId);
  if (!user || user.userType !== "Patient") {
    return next(new AppError("This route is only for patients", 403));
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get all medical scans for this patient
  const scans = await MedicalScan.find({
    patient: userId,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalScans = await MedicalScan.countDocuments({
    patient: userId,
  });

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
 * Get a specific medical scan by ID
 */
exports.getMedicalScanById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Find the medical scan
  const scan = await MedicalScan.findById(id)
    .populate({
      path: "uploadedBy",
      select: "firstName lastName userType",
    })
    .populate({
      path: "doctorNotes.doctor",
      select: "firstName lastName specialization",
    });

  if (!scan) {
    return next(new AppError("Medical scan not found", 404));
  }

  // Check if the user is authorized to view this scan
  const isAuthorized =
    scan.patient.toString() === userId || // The patient themselves
    req.user.userType === "Doctor" || // A doctor
    req.user.userType === "Admin"; // An admin

  if (!isAuthorized) {
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
 * Upload a new medical scan
 * Note: This handles just the metadata - the actual file upload and AI analysis
 * will be handled by a separate Python service
 */
exports.uploadMedicalScan = catchAsync(async (req, res, next) => {
  const { scanType, bodyPart, description } = req.body;
  const userId = req.user.id;

  // Validate required fields
  if (!scanType || !bodyPart) {
    return next(new AppError("Scan type and body part are required", 400));
  }

  // Create new medical scan record
  const scan = await MedicalScan.create({
    patient: userId,
    scanType,
    scanDate: new Date(),
    bodyPart,
    description,
    uploadedBy: userId,
  });

  // Return the created scan with a temporary URL for the front-end
  // The actual image upload will be handled separately
  res.status(201).json({
    status: "success",
    data: {
      scan,
      uploadUrl: `/api/medical-scans/${scan._id}/upload-image`,
    },
  });
});

/**
 * Delete a medical scan
 */
exports.deleteMedicalScan = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Find the medical scan
  const scan = await MedicalScan.findById(id);

  if (!scan) {
    return next(new AppError("Medical scan not found", 404));
  }

  // Check if the user is authorized to delete this scan
  const isAuthorized =
    scan.patient.toString() === userId || // The patient themselves
    req.user.userType === "Admin"; // An admin

  if (!isAuthorized) {
    return next(new AppError("You are not authorized to delete this scan", 403));
  }

  // Delete the scan
  await MedicalScan.findByIdAndDelete(id);

  // Note: In a real application, you would also delete any associated files

  res.status(200).json({
    status: "success",
    data: null,
  });
});
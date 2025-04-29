const User = require("../models/userModel");
const PatientProfile = require("../models/patientProfileModel");
const Appointment = require("../models/appointmentModel");
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
  let patientProfile = await PatientProfile.findOne({
    user: user._id,
  }).populate({
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
    totalAppointments: patientProfile.appointments
      ? patientProfile.appointments.length
      : 0,
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
  const updatedProfile = await PatientProfile.findOne({
    user: user._id,
  }).populate({
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
  };

  res.status(200).json({
    status: "success",
    data: dashboardData,
  });
});

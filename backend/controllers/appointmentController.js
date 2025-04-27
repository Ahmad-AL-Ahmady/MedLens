const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const DoctorProfile = require("../models/doctorProfileModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Helper function to check if a slot is available
const isTimeSlotAvailable = async (doctorId, date, startTime, endTime) => {
  // Format the date to YYYY-MM-DD for comparison
  const formattedDate = new Date(date).toISOString().split("T")[0];

  // Find any overlapping appointments
  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    date: {
      $gte: new Date(`${formattedDate}T00:00:00.000Z`),
      $lte: new Date(`${formattedDate}T23:59:59.999Z`),
    },
    status: { $nin: ["cancelled"] },
    $or: [
      // New appointment starts during an existing appointment
      {
        startTime: { $lte: startTime },
        endTime: { $gt: startTime },
      },
      // New appointment ends during an existing appointment
      {
        startTime: { $lt: endTime },
        endTime: { $gte: endTime },
      },
      // New appointment completely contains an existing appointment
      {
        startTime: { $gte: startTime },
        endTime: { $lte: endTime },
      },
    ],
  });

  return !existingAppointment;
};

// Helper function to convert 24h time to minutes for comparison
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Get available time slots for a specific doctor on a specific date
exports.getAvailableTimeSlots = catchAsync(async (req, res, next) => {
  const { doctorId, date } = req.params;

  // Validate doctor exists
  const doctor = await User.findOne({
    _id: doctorId,
    userType: "Doctor",
  });

  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  // Get doctor's availability
  const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
  if (!doctorProfile) {
    return next(new AppError("Doctor profile not found", 404));
  }

  // Get day of week from date (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = new Date(date).getDay();
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = days[dayOfWeek];

  // Check if doctor is available on this day
  const dayAvailability = doctorProfile.availability[dayName];
  if (!dayAvailability || !dayAvailability.isAvailable) {
    return res.status(200).json({
      status: "success",
      data: {
        available: false,
        message: `Doctor is not available on ${dayName}s`,
        timeSlots: [],
      },
    });
  }

  // Format the date for query
  const formattedDate = new Date(date).toISOString().split("T")[0];

  // Get all appointments for this doctor on this date
  const appointments = await Appointment.find({
    doctor: doctorId,
    date: {
      $gte: new Date(`${formattedDate}T00:00:00.000Z`),
      $lte: new Date(`${formattedDate}T23:59:59.999Z`),
    },
    status: { $nin: ["cancelled"] },
  }).sort({ startTime: 1 });

  // Generate time slots based on doctor's availability
  // Assuming appointments are 30 minutes
  const SLOT_DURATION = 30; // minutes
  const slots = [];

  if (dayAvailability.start && dayAvailability.end) {
    const startMinutes = timeToMinutes(dayAvailability.start);
    const endMinutes = timeToMinutes(dayAvailability.end);

    // Generate all possible slots
    for (let time = startMinutes; time < endMinutes; time += SLOT_DURATION) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;

      const startTime = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const endHour = Math.floor((time + SLOT_DURATION) / 60);
      const endMinute = (time + SLOT_DURATION) % 60;
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;

      // Check if this slot overlaps with any existing appointment
      const isAvailable = !appointments.some((app) => {
        const appStartMinutes = timeToMinutes(app.startTime);
        const appEndMinutes = timeToMinutes(app.endTime);

        return (
          // Slot starts during appointment
          (time >= appStartMinutes && time < appEndMinutes) ||
          // Slot ends during appointment
          (time + SLOT_DURATION > appStartMinutes &&
            time + SLOT_DURATION <= appEndMinutes) ||
          // Slot completely contains appointment
          (time <= appStartMinutes && time + SLOT_DURATION >= appEndMinutes)
        );
      });

      slots.push({
        startTime,
        endTime,
        isAvailable,
      });
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      date: formattedDate,
      dayOfWeek: dayName,
      available: dayAvailability.isAvailable,
      workingHours: {
        start: dayAvailability.start,
        end: dayAvailability.end,
      },
      timeSlots: slots,
    },
  });
});

// Create a new appointment
exports.createAppointment = catchAsync(async (req, res, next) => {
  const { doctorId, date, startTime, endTime, reason, patientNotes } = req.body;

  // Only patients can book appointments
  if (req.user.userType !== "Patient") {
    return next(new AppError("Only patients can book appointments", 403));
  }

  // Check if doctor exists
  const doctor = await User.findOne({ _id: doctorId, userType: "Doctor" });
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  // Validate that the appointment date is not in the past
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (appointmentDate < today) {
    return next(new AppError("Cannot book appointments for past dates", 400));
  }

  // If date is today, validate that the appointment time is not in the past
  if (appointmentDate.getTime() === today.getTime()) {
    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    const [startHours, startMinutes] = startTime.split(":").map(Number);

    // Convert both to minutes for comparison
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    const startTotalMinutes = startHours * 60 + startMinutes;

    if (startTotalMinutes <= currentTotalMinutes) {
      return next(new AppError("Cannot book appointments for past times", 400));
    }
  }

  // Validate the appointment time is available
  const isAvailable = await isTimeSlotAvailable(
    doctorId,
    date,
    startTime,
    endTime
  );
  if (!isAvailable) {
    return next(new AppError("This time slot is not available", 400));
  }

  // Check if the patient has any previous appointments with this doctor
  const previousAppointments = await Appointment.countDocuments({
    patient: req.user.id,
    doctor: doctorId,
  });

  // Create the appointment
  const appointment = await Appointment.create({
    patient: req.user.id,
    doctor: doctorId,
    date,
    startTime,
    endTime,
    status: "pending",
    reason: reason || undefined,
    patientNotes: patientNotes || undefined,
    isFirstVisit: previousAppointments === 0,
  });

  // Populate the doctor and patient information
  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate({
      path: "doctor",
      select: "firstName lastName avatar specialization",
    })
    .populate({
      path: "patient",
      select: "firstName lastName avatar",
    });

  res.status(201).json({
    status: "success",
    data: {
      appointment: populatedAppointment,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      appointment,
    },
  });
});

// Get patient's appointments
exports.getMyAppointments = catchAsync(async (req, res, next) => {
  const { status, pastOrUpcoming = "upcoming" } = req.query;

  // Build query based on user type
  let query = {};

  if (req.user.userType === "Patient") {
    query.patient = req.user.id;
  } else if (req.user.userType === "Doctor") {
    query.doctor = req.user.id;
  } else {
    return next(new AppError("Unauthorized", 403));
  }

  // Filter by status if provided
  if (status) {
    query.status = status;
  }

  // Filter by past or upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (pastOrUpcoming === "upcoming") {
    query.date = { $gte: today };
  } else if (pastOrUpcoming === "past") {
    query.date = { $lt: today };
  }

  // Execute query with population
  const appointments = await Appointment.find(query)
    .populate({
      path: req.user.userType === "Patient" ? "doctor" : "patient",
      select: "firstName lastName avatar gender specialization",
    })
    .sort({ date: pastOrUpcoming === "upcoming" ? 1 : -1, startTime: 1 });

  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

// Get appointment details by ID
exports.getAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find appointment with populated fields
  const appointment = await Appointment.findById(id)
    .populate({
      path: "patient",
      select: "firstName lastName avatar gender age email",
    })
    .populate({
      path: "doctor",
      select: "firstName lastName avatar gender specialization email",
    });

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Check authorization (only the patient, doctor, or admin can view)
  const isAuthorized =
    appointment.patient._id.toString() === req.user.id ||
    appointment.doctor._id.toString() === req.user.id ||
    req.user.userType === "Admin";

  if (!isAuthorized) {
    return next(
      new AppError("You are not authorized to view this appointment", 403)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});

// Update appointment status
exports.updateAppointmentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, doctorNotes } = req.body;

  // Find the appointment
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Check authorization based on the status change
  let isAuthorized = false;

  // Doctors can confirm or cancel appointments
  if (
    req.user.userType === "Doctor" &&
    appointment.doctor.toString() === req.user.id
  ) {
    if (["confirmed", "cancelled", "completed"].includes(status)) {
      isAuthorized = true;
    }
  }

  // Patients can only cancel their own appointments
  else if (
    req.user.userType === "Patient" &&
    appointment.patient.toString() === req.user.id
  ) {
    if (status === "cancelled") {
      isAuthorized = true;
    }
  }

  // Admins can update any appointment
  else if (req.user.userType === "Admin") {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return next(
      new AppError("You are not authorized to update this appointment", 403)
    );
  }

  // Update the appointment
  const updateData = { status };

  // Only doctors can add doctor notes
  if (doctorNotes && req.user.userType === "Doctor") {
    updateData.doctorNotes = doctorNotes;
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate({
      path: "patient",
      select: "firstName lastName avatar",
    })
    .populate({
      path: "doctor",
      select: "firstName lastName avatar specialization",
    });

  res.status(200).json({
    status: "success",
    data: {
      appointment: updatedAppointment,
    },
  });
});

// Cancel appointment
exports.cancelAppointment = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the appointment
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Check if the appointment can be cancelled
  if (appointment.status === "completed") {
    return next(new AppError("Cannot cancel a completed appointment", 400));
  }

  // Check authorization
  const isAuthorized =
    appointment.patient.toString() === req.user.id ||
    appointment.doctor.toString() === req.user.id ||
    req.user.userType === "Admin";

  if (!isAuthorized) {
    return next(
      new AppError("You are not authorized to cancel this appointment", 403)
    );
  }

  // Delete the appointment instead of updating status
  await Appointment.findByIdAndDelete(id);

  res.status(200).json({
    status: "success",
    message: "Appointment has been cancelled and deleted",
  });
});

// Get doctor's schedule
exports.getDoctorSchedule = catchAsync(async (req, res, next) => {
  const { doctorId } = req.params;
  const { startDate, endDate } = req.query;

  // Validate doctor exists
  const doctor = await User.findOne({ _id: doctorId, userType: "Doctor" });
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  // Build date range query
  let dateQuery = {};

  if (startDate && endDate) {
    dateQuery = {
      $gte: new Date(`${startDate}T00:00:00.000Z`),
      $lte: new Date(`${endDate}T23:59:59.999Z`),
    };
  } else if (startDate) {
    dateQuery = {
      $gte: new Date(`${startDate}T00:00:00.000Z`),
    };
  } else if (endDate) {
    dateQuery = {
      $lte: new Date(`${endDate}T23:59:59.999Z`),
    };
  } else {
    // Default to next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    dateQuery = {
      $gte: today,
      $lte: nextWeek,
    };
  }

  // Get appointments
  const appointments = await Appointment.find({
    doctor: doctorId,
    date: dateQuery,
    status: { $ne: "cancelled" },
  })
    .select("-patient -doctorNotes -patientNotes")
    .sort({ date: 1, startTime: 1 });

  // Get doctor's availability
  const doctorProfile = await DoctorProfile.findOne({ user: doctorId });

  res.status(200).json({
    status: "success",
    data: {
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      availability: doctorProfile ? doctorProfile.availability : {},
      appointments,
    },
  });
});

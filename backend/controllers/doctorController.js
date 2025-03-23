const User = require("../models/userModel");
const DoctorProfile = require("../models/doctorProfileModel");
const geocoder = require("../utils/geocoder");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Get current doctor's profile
exports.getMyProfile = catchAsync(async (req, res, next) => {
  // Get user details
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.userType !== "Doctor") {
    return next(new AppError("This route is only for doctors", 403));
  }

  // Get doctor profile
  let doctorProfile = await DoctorProfile.findOne({ user: user._id })
    .populate({
      path: "appointments",
      options: { sort: { date: 1 }, limit: 10 },
    })
    .populate({
      path: "reviews",
      options: { sort: { createdAt: -1 }, limit: 5 },
      populate: {
        path: "reviewer",
        select: "firstName lastName avatar",
      },
    });

  // If profile doesn't exist, create it
  if (!doctorProfile) {
    doctorProfile = await DoctorProfile.create({ user: user._id });
  }

  // If location has coordinates but no location name, get it
  if (
    user.location &&
    user.location.coordinates &&
    user.location.coordinates.length === 2 &&
    !doctorProfile.locationName
  ) {
    try {
      const [longitude, latitude] = user.location.coordinates;
      const locationData = await geocoder.reverseGeocode(latitude, longitude);

      // Update the doctor profile with location information
      doctorProfile = await DoctorProfile.findByIdAndUpdate(
        doctorProfile._id,
        {
          locationName: locationData.locationName,
          formattedAddress: locationData.formattedAddress,
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating location data:", error);
      // Continue without location data rather than failing the request
    }
  }

  // Prepare the response
  const responseData = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    specialization: user.specialization,
    location: user.location,
    locationDetails: {
      locationName: doctorProfile.locationName,
      formattedAddress: doctorProfile.formattedAddress,
      city: doctorProfile.city,
      state: doctorProfile.state,
      country: doctorProfile.country,
    },
    profile: doctorProfile,
  };

  res.status(200).json({
    status: "success",
    data: responseData,
  });
});

// Update doctor profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  // Get user
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.userType !== "Doctor") {
    return next(new AppError("This route is only for doctors", 403));
  }

  // Find doctor profile
  let doctorProfile = await DoctorProfile.findOne({ user: user._id });

  // If profile doesn't exist, create it
  if (!doctorProfile) {
    doctorProfile = await DoctorProfile.create({ user: user._id });
  }

  // Update user's specialization if provided
  if (req.body.specialization) {
    await User.findByIdAndUpdate(
      user._id,
      { specialization: req.body.specialization },
      { runValidators: true }
    );
  }

  // Handle location update
  let locationUpdated = false;

  // Option 1: Update from coordinates
  if (req.body.location && req.body.location.coordinates) {
    // Update user location coordinates
    await User.findByIdAndUpdate(
      user._id,
      {
        location: {
          type: "Point",
          coordinates: req.body.location.coordinates,
        },
      },
      { runValidators: true }
    );

    // Get location details from coordinates
    try {
      const [longitude, latitude] = req.body.location.coordinates;
      const locationData = await geocoder.reverseGeocode(latitude, longitude);

      // Add location details to request body for profile update
      req.body.locationName = locationData.locationName;
      req.body.formattedAddress = locationData.formattedAddress;
      req.body.city = locationData.city;
      req.body.state = locationData.state;
      req.body.country = locationData.country;

      locationUpdated = true;
    } catch (error) {
      console.error("Error updating location data from coordinates:", error);
    }
  }

  // Option 2: Update from address string
  else if (req.body.address) {
    try {
      const locationData = await geocoder.geocode(req.body.address);

      // Update user location coordinates
      await User.findByIdAndUpdate(
        user._id,
        {
          location: {
            type: "Point",
            coordinates: locationData.coordinates,
          },
        },
        { runValidators: true }
      );

      // Add location details to request body for profile update
      req.body.locationName = locationData.formattedAddress;
      req.body.formattedAddress = locationData.formattedAddress;
      req.body.city = locationData.city;
      req.body.state = locationData.state;
      req.body.country = locationData.country;

      locationUpdated = true;
    } catch (error) {
      return next(new AppError("Could not geocode the provided address", 400));
    }
  }

  // Define allowed fields for profile update
  const allowedFields = [
    "fees",
    "availability",
    "locationName",
    "formattedAddress",
    "city",
    "state",
    "country",
  ];

  // Filter request body to only include allowed fields
  const filteredBody = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  // Update profile
  const updatedProfile = await DoctorProfile.findByIdAndUpdate(
    doctorProfile._id,
    filteredBody,
    { new: true, runValidators: true }
  );

  // Get updated user (for specialization changes)
  const updatedUser = await User.findById(user._id);

  res.status(200).json({
    status: "success",
    data: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      specialization: updatedUser.specialization,
      location: updatedUser.location,
      locationDetails: {
        locationName: updatedProfile.locationName,
        formattedAddress: updatedProfile.formattedAddress,
        city: updatedProfile.city,
        state: updatedProfile.state,
        country: updatedProfile.country,
      },
      locationUpdated,
      profile: updatedProfile,
    },
  });
});

// Get nearby doctors (used by patients to find doctors)
exports.getNearbyDoctors = catchAsync(async (req, res, next) => {
  const { longitude, latitude, distance = 10, specialization } = req.query;

  // Validate required parameters
  if (!longitude || !latitude) {
    return next(new AppError("Please provide longitude and latitude", 400));
  }

  // Convert distance to meters (default 10km)
  const radius = distance * 1000;

  // Build query to find doctors near the provided coordinates
  let query = {
    userType: "Doctor",
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        $maxDistance: radius,
      },
    },
  };

  // Add specialization filter if provided
  if (specialization) {
    query.specialization = specialization;
  }

  // Find doctors matching the criteria
  const doctors = await User.find(query);

  // Get doctor profiles
  const doctorIds = doctors.map((doctor) => doctor._id);
  const doctorProfiles = await DoctorProfile.find({
    user: { $in: doctorIds },
  });

  // Create a map for quick access to profiles
  const profileMap = {};
  doctorProfiles.forEach((profile) => {
    profileMap[profile.user.toString()] = profile;
  });

  // Combine doctor info with profile info
  const doctorsWithProfiles = doctors.map((doctor) => {
    const profile = profileMap[doctor._id.toString()] || {};
    return {
      id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      location: doctor.location,
      locationDetails: {
        locationName: profile.locationName,
        formattedAddress: profile.formattedAddress,
        city: profile.city,
        state: profile.state,
        country: profile.country,
      },
      averageRating: profile.averageRating || 0,
      totalReviews: profile.totalReviews || 0,
      fees: profile.fees,
    };
  });

  res.status(200).json({
    status: "success",
    results: doctorsWithProfiles.length,
    data: {
      doctors: doctorsWithProfiles,
    },
  });
});

// Get specific doctor by ID
exports.getDoctorById = catchAsync(async (req, res, next) => {
  const doctorId = req.params.id;

  // Find doctor
  const doctor = await User.findOne({
    _id: doctorId,
    userType: "Doctor",
  });

  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  // Find doctor profile
  const doctorProfile = await DoctorProfile.findOne({
    user: doctorId,
  }).populate({
    path: "reviews",
    options: { sort: { createdAt: -1 } },
    populate: {
      path: "reviewer",
      select: "firstName lastName avatar",
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      id: doctor._id,
      avatar: doctor.avatar,
      email: doctor.email,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      location: doctor.location,
      locationDetails: doctorProfile
        ? {
            locationName: doctorProfile.locationName,
            formattedAddress: doctorProfile.formattedAddress,
            city: doctorProfile.city,
            state: doctorProfile.state,
            country: doctorProfile.country,
          }
        : {},
      profile: doctorProfile,
    },
  });
});

// Get all available doctor specializations
exports.getSpecializations = catchAsync(async (req, res, next) => {
  // Fetch all unique specializations from doctors
  const specializations = await User.distinct("specialization", {
    userType: "Doctor",
    specialization: { $exists: true, $ne: null },
  });

  // Count doctors in each specialization
  const specializationCounts = await Promise.all(
    specializations.map(async (spec) => {
      const count = await User.countDocuments({
        userType: "Doctor",
        specialization: spec,
      });

      return {
        name: spec,
        doctorCount: count,
      };
    })
  );

  // Sort by doctor count (descending)
  specializationCounts.sort((a, b) => b.doctorCount - a.doctorCount);

  res.status(200).json({
    status: "success",
    results: specializationCounts.length,
    data: {
      specializations: specializationCounts,
    },
  });
});

// Add to doctorController.js

// Get all doctors with filtering and pagination
exports.getAllDoctors = catchAsync(async (req, res, next) => {
  // Build query based on filters
  const queryObj = { userType: "Doctor" };

  // Filter by specialization if provided
  if (req.query.specialization) {
    queryObj.specialization = req.query.specialization;
  }

  // Filter by name if provided
  if (req.query.name) {
    const nameRegex = new RegExp(req.query.name, "i");
    queryObj.$or = [{ firstName: nameRegex }, { lastName: nameRegex }];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const doctors = await User.find(queryObj)
    .select("firstName lastName specialization location avatar")
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalDoctors = await User.countDocuments(queryObj);

  // Get doctor profiles for each doctor
  const doctorIds = doctors.map((doctor) => doctor._id);
  const doctorProfiles = await DoctorProfile.find({
    user: { $in: doctorIds },
  });

  // Create a map for quick access to profiles
  const profileMap = {};
  doctorProfiles.forEach((profile) => {
    profileMap[profile.user.toString()] = profile;
  });

  // Combine doctor info with profile info
  const doctorsWithProfiles = doctors.map((doctor) => {
    const profile = profileMap[doctor._id.toString()] || {};
    return {
      id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      location: doctor.location,
      avatar: doctor.avatar,
      fees: profile.fees,
      averageRating: profile.averageRating || 0,
      totalReviews: profile.totalReviews || 0,
      locationDetails: {
        locationName: profile.locationName,
        city: profile.city,
        state: profile.state,
        country: profile.country,
      },
    };
  });

  res.status(200).json({
    status: "success",
    results: doctorsWithProfiles.length,
    pagination: {
      page,
      limit,
      totalDoctors,
      totalPages: Math.ceil(totalDoctors / limit),
    },
    data: {
      doctors: doctorsWithProfiles,
    },
  });
});

// Get all doctors with filtering and pagination
exports.getAllDoctors = catchAsync(async (req, res, next) => {
  // Build query based on filters
  const queryObj = { userType: "Doctor" };

  // Filter by specialization if provided
  if (req.query.specialization) {
    queryObj.specialization = req.query.specialization;
  }

  // Filter by name if provided
  if (req.query.name) {
    const nameRegex = new RegExp(req.query.name, "i");
    queryObj.$or = [{ firstName: nameRegex }, { lastName: nameRegex }];
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const doctors = await User.find(queryObj)
    .select("firstName lastName specialization location avatar fees")
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalDoctors = await User.countDocuments(queryObj);

  // Get doctor profiles for each doctor
  const doctorIds = doctors.map((doctor) => doctor._id);
  const doctorProfiles = await DoctorProfile.find({
    user: { $in: doctorIds },
  });

  // Create a map for quick access to profiles
  const profileMap = {};
  doctorProfiles.forEach((profile) => {
    profileMap[profile.user.toString()] = profile;
  });

  // Combine doctor info with profile info
  const doctorsWithProfiles = doctors.map((doctor) => {
    const profile = profileMap[doctor._id.toString()] || {};
    return {
      id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      location: doctor.location,
      avatar: doctor.avatar,
      fees: profile.fees,
      averageRating: profile.averageRating || 0,
      totalReviews: profile.totalReviews || 0,
      locationDetails: {
        locationName: profile.locationName,
        city: profile.city,
        state: profile.state,
        country: profile.country,
      },
    };
  });

  res.status(200).json({
    status: "success",
    results: doctorsWithProfiles.length,
    pagination: {
      page,
      limit,
      totalDoctors,
      totalPages: Math.ceil(totalDoctors / limit),
    },
    data: {
      doctors: doctorsWithProfiles,
    },
  });
});

/**
 * Update doctor availability schedule
 * @route PATCH /api/doctors/:id/availability
 * @access Private (Admin or the Doctor themselves)
 */
exports.updateAvailability = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { availability } = req.body;

  // Validate the request body
  if (!availability) {
    return next(new AppError("Availability data is required", 400));
  }

  // Check if valid days are provided
  const validDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const providedDays = Object.keys(availability);

  // Ensure all provided days are valid
  const invalidDays = providedDays.filter((day) => !validDays.includes(day));
  if (invalidDays.length > 0) {
    return next(new AppError(`Invalid day(s): ${invalidDays.join(", ")}`, 400));
  }

  // Validate time format for each day
  for (const day of providedDays) {
    const dayData = availability[day];

    // Skip validation if day is marked as unavailable
    if (dayData.isAvailable === false) {
      continue;
    }

    // If day is available, start and end times are required
    if (dayData.isAvailable === true) {
      if (!dayData.start || !dayData.end) {
        return next(
          new AppError(`Start and end times are required for ${day}`, 400)
        );
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(dayData.start) || !timeRegex.test(dayData.end)) {
        return next(
          new AppError(`Invalid time format for ${day}. Use HH:MM format.`, 400)
        );
      }

      // Validate start time is before end time
      const startMinutes = timeToMinutes(dayData.start);
      const endMinutes = timeToMinutes(dayData.end);

      if (startMinutes >= endMinutes) {
        return next(
          new AppError(`Start time must be before end time for ${day}`, 400)
        );
      }
    }
  }

  // Check authorization - only the doctor themselves or an admin can update
  const doctor = await User.findById(id);

  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  if (doctor.userType !== "Doctor") {
    return next(new AppError("User is not a doctor", 400));
  }

  // Check if the user is allowed to update this doctor's availability
  const isAuthorized =
    req.user.id === id || // Doctor updating their own availability
    req.user.userType === "Admin"; // Admin updating any doctor

  if (!isAuthorized) {
    return next(
      new AppError(
        "You are not authorized to update this doctor's availability",
        403
      )
    );
  }

  // Find the doctor profile
  const doctorProfile = await DoctorProfile.findOne({ user: id });

  if (!doctorProfile) {
    return next(new AppError("Doctor profile not found", 404));
  }

  // Update only the provided days, keep existing availability for other days
  const updatedAvailability = { ...doctorProfile.availability };
  for (const day of providedDays) {
    updatedAvailability[day] = availability[day];
  }

  // Update the doctor profile
  const updatedProfile = await DoctorProfile.findByIdAndUpdate(
    doctorProfile._id,
    { availability: updatedAvailability },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      availability: updatedProfile.availability,
    },
  });
});

// Helper function to convert HH:MM to minutes for comparison
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

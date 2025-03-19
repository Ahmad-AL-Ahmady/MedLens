const User = require("../models/userModel");
const PharmacyProfile = require("../models/pharmacyProfileModel");
const PharmacyInventory = require("../models/pharmacyInventoryModel");
const Medication = require("../models/medicationModel");
const geocoder = require("../utils/geocoder");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Get current pharmacy's profile
exports.getMyProfile = catchAsync(async (req, res, next) => {
  // Get user details
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.userType !== "Pharmacy") {
    return next(new AppError("This route is only for pharmacies", 403));
  }

  // Get pharmacy profile
  let pharmacyProfile = await PharmacyProfile.findOne({ user: user._id })
    .populate({
      path: "inventory",
      populate: {
        path: "medication",
      },
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
  if (!pharmacyProfile) {
    pharmacyProfile = await PharmacyProfile.create({ user: user._id });
  }

  // If location has coordinates but no location name, get it
  if (
    user.location &&
    user.location.coordinates &&
    user.location.coordinates.length === 2 &&
    !pharmacyProfile.locationName
  ) {
    try {
      const [longitude, latitude] = user.location.coordinates;
      const locationData = await geocoder.reverseGeocode(latitude, longitude);

      // Update the pharmacy profile with location information
      pharmacyProfile = await PharmacyProfile.findByIdAndUpdate(
        pharmacyProfile._id,
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
    location: user.location,
    locationDetails: {
      locationName: pharmacyProfile.locationName,
      formattedAddress: pharmacyProfile.formattedAddress,
      city: pharmacyProfile.city,
      state: pharmacyProfile.state,
      country: pharmacyProfile.country,
    },
    profile: pharmacyProfile,
  };

  res.status(200).json({
    status: "success",
    data: responseData,
  });
});

// Update pharmacy profile
exports.updateProfile = catchAsync(async (req, res, next) => {
  // Get user
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.userType !== "Pharmacy") {
    return next(new AppError("This route is only for pharmacies", 403));
  }

  // Find pharmacy profile
  let pharmacyProfile = await PharmacyProfile.findOne({ user: user._id });

  // If profile doesn't exist, create it
  if (!pharmacyProfile) {
    pharmacyProfile = await PharmacyProfile.create({ user: user._id });
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
    "phoneNumber",
    "operatingHours",
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
  const updatedProfile = await PharmacyProfile.findByIdAndUpdate(
    pharmacyProfile._id,
    filteredBody,
    { new: true, runValidators: true }
  );

  // Get updated user
  const updatedUser = await User.findById(user._id);

  res.status(200).json({
    status: "success",
    data: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
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

// Get pharmacy by ID
exports.getPharmacyById = catchAsync(async (req, res, next) => {
  const pharmacyId = req.params.id;

  // Find pharmacy
  const pharmacy = await User.findOne({
    _id: pharmacyId,
    userType: "Pharmacy",
  });

  if (!pharmacy) {
    return next(new AppError("Pharmacy not found", 404));
  }

  // Find pharmacy profile
  const pharmacyProfile = await PharmacyProfile.findOne({
    user: pharmacyId,
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
      id: pharmacy._id,
      firstName: pharmacy.firstName,
      lastName: pharmacy.lastName,
      location: pharmacy.location,
      locationDetails: pharmacyProfile
        ? {
            locationName: pharmacyProfile.locationName,
            formattedAddress: pharmacyProfile.formattedAddress,
            city: pharmacyProfile.city,
            state: pharmacyProfile.state,
            country: pharmacyProfile.country,
          }
        : {},
      profile: pharmacyProfile,
    },
  });
});

// Get nearby pharmacies
exports.getNearbyPharmacies = catchAsync(async (req, res, next) => {
  const { longitude, latitude, distance = 10 } = req.query;

  // Validate required parameters
  if (!longitude || !latitude) {
    return next(new AppError("Please provide longitude and latitude", 400));
  }

  // Convert distance to meters (default 10km)
  const radius = distance * 1000;

  // Build query to find pharmacies near the provided coordinates
  let query = {
    userType: "Pharmacy",
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

  // Find pharmacies matching the criteria
  const pharmacies = await User.find(query);

  // Get pharmacy profiles
  const pharmacyIds = pharmacies.map((pharmacy) => pharmacy._id);
  const pharmacyProfiles = await PharmacyProfile.find({
    user: { $in: pharmacyIds },
  });

  // Create a map for quick access to profiles
  const profileMap = {};
  pharmacyProfiles.forEach((profile) => {
    profileMap[profile.user.toString()] = profile;
  });

  // Combine pharmacy info with profile info
  const pharmaciesWithProfiles = pharmacies.map((pharmacy) => {
    const profile = profileMap[pharmacy._id.toString()] || {};
    return {
      id: pharmacy._id,
      firstName: pharmacy.firstName,
      lastName: pharmacy.lastName,
      location: pharmacy.location,
      locationDetails: {
        locationName: profile.locationName,
        formattedAddress: profile.formattedAddress,
        city: profile.city,
        state: profile.state,
        country: profile.country,
      },
      averageRating: profile.averageRating || 0,
      totalReviews: profile.totalReviews || 0,
    };
  });

  res.status(200).json({
    status: "success",
    results: pharmaciesWithProfiles.length,
    data: {
      pharmacies: pharmaciesWithProfiles,
    },
  });
});

// Get all pharmacies with filtering and pagination
exports.getAllPharmacies = catchAsync(async (req, res, next) => {
  // Build query based on filters
  const queryObj = { userType: "Pharmacy" };

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
  const pharmacies = await User.find(queryObj)
    .select("firstName lastName location avatar")
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalPharmacies = await User.countDocuments(queryObj);

  // Get pharmacy profiles for each pharmacy
  const pharmacyIds = pharmacies.map((pharmacy) => pharmacy._id);
  const pharmacyProfiles = await PharmacyProfile.find({
    user: { $in: pharmacyIds },
  });

  // Create a map for quick access to profiles
  const profileMap = {};
  pharmacyProfiles.forEach((profile) => {
    profileMap[profile.user.toString()] = profile;
  });

  // Combine pharmacy info with profile info
  const pharmaciesWithProfiles = pharmacies.map((pharmacy) => {
    const profile = profileMap[pharmacy._id.toString()] || {};
    return {
      id: pharmacy._id,
      firstName: pharmacy.firstName,
      lastName: pharmacy.lastName,
      location: pharmacy.location,
      avatar: pharmacy.avatar,
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
    results: pharmaciesWithProfiles.length,
    pagination: {
      page,
      limit,
      totalPharmacies,
      totalPages: Math.ceil(totalPharmacies / limit),
    },
    data: {
      pharmacies: pharmaciesWithProfiles,
    },
  });
});

// Update pharmacy operating hours
exports.updateOperatingHours = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { operatingHours } = req.body;

  // Validate the request body
  if (!operatingHours) {
    return next(new AppError("Operating hours data is required", 400));
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
  const providedDays = Object.keys(operatingHours);

  // Ensure all provided days are valid
  const invalidDays = providedDays.filter((day) => !validDays.includes(day));
  if (invalidDays.length > 0) {
    return next(new AppError(`Invalid day(s): ${invalidDays.join(", ")}`, 400));
  }

  // Validate time format for each day
  for (const day of providedDays) {
    const dayData = operatingHours[day];

    // Skip validation if day is marked as not open
    if (dayData.isOpen === false) {
      continue;
    }

    // If day is open, start and end times are required
    if (dayData.isOpen === true) {
      if (!dayData.open || !dayData.close) {
        return next(
          new AppError(`Open and close times are required for ${day}`, 400)
        );
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(dayData.open) || !timeRegex.test(dayData.close)) {
        return next(
          new AppError(`Invalid time format for ${day}. Use HH:MM format.`, 400)
        );
      }

      // Validate open time is before close time
      const openMinutes = timeToMinutes(dayData.open);
      const closeMinutes = timeToMinutes(dayData.close);

      if (openMinutes >= closeMinutes) {
        return next(
          new AppError(`Open time must be before close time for ${day}`, 400)
        );
      }
    }
  }

  // Check authorization - only the pharmacy themselves or an admin can update
  const pharmacy = await User.findById(id);

  if (!pharmacy) {
    return next(new AppError("Pharmacy not found", 404));
  }

  if (pharmacy.userType !== "Pharmacy") {
    return next(new AppError("User is not a pharmacy", 400));
  }

  // Check if the user is allowed to update this pharmacy's operating hours
  const isAuthorized =
    req.user.id === id || // Pharmacy updating their own hours
    req.user.userType === "Admin"; // Admin updating any pharmacy

  if (!isAuthorized) {
    return next(
      new AppError(
        "You are not authorized to update this pharmacy's operating hours",
        403
      )
    );
  }

  // Find the pharmacy profile
  const pharmacyProfile = await PharmacyProfile.findOne({ user: id });

  if (!pharmacyProfile) {
    return next(new AppError("Pharmacy profile not found", 404));
  }

  // Update only the provided days, keep existing operating hours for other days
  const updatedOperatingHours = { ...pharmacyProfile.operatingHours };
  for (const day of providedDays) {
    updatedOperatingHours[day] = operatingHours[day];
  }

  // Update the pharmacy profile
  const updatedProfile = await PharmacyProfile.findByIdAndUpdate(
    pharmacyProfile._id,
    { operatingHours: updatedOperatingHours },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      operatingHours: updatedProfile.operatingHours,
    },
  });
});

// Helper function to convert HH:MM to minutes for comparison
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// INVENTORY MANAGEMENT

// Add/update medication in inventory
exports.updateInventoryItem = catchAsync(async (req, res, next) => {
  const pharmacyId = req.user.id;
  const { medicationId, stock, price, expiryDate } = req.body;

  // Validate required fields
  if (!medicationId || stock === undefined || price === undefined) {
    return next(
      new AppError("Medication ID, stock, and price are required fields", 400)
    );
  }

  // Check if the medication exists
  const medication = await Medication.findById(medicationId);
  if (!medication) {
    return next(new AppError("Medication not found", 404));
  }

  // Check if inventory item already exists
  let inventoryItem = await PharmacyInventory.findOne({
    pharmacy: pharmacyId,
    medication: medicationId,
  });

  if (inventoryItem) {
    // Update existing inventory item
    inventoryItem = await PharmacyInventory.findByIdAndUpdate(
      inventoryItem._id,
      {
        stock,
        price,
        expiryDate: expiryDate || inventoryItem.expiryDate,
      },
      { new: true, runValidators: true }
    );
  } else {
    // Create new inventory item
    inventoryItem = await PharmacyInventory.create({
      pharmacy: pharmacyId,
      medication: medicationId,
      stock,
      price,
      expiryDate,
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      inventoryItem,
    },
  });
});

// Get pharmacy inventory
exports.getInventory = catchAsync(async (req, res, next) => {
  const pharmacyId = req.params.id || req.user.id;

  // Check if pharmacy exists
  const pharmacy = await User.findOne({
    _id: pharmacyId,
    userType: "Pharmacy",
  });

  if (!pharmacy) {
    return next(new AppError("Pharmacy not found", 404));
  }

  // Get inventory items with medication details
  const inventory = await PharmacyInventory.find({
    pharmacy: pharmacyId,
  }).populate("medication");

  res.status(200).json({
    status: "success",
    results: inventory.length,
    data: {
      inventory,
    },
  });
});

// Remove medication from inventory
exports.removeInventoryItem = catchAsync(async (req, res, next) => {
  const pharmacyId = req.user.id;
  const { medicationId } = req.params;

  // Check if the inventory item exists
  const inventoryItem = await PharmacyInventory.findOne({
    pharmacy: pharmacyId,
    medication: medicationId,
  });

  if (!inventoryItem) {
    return next(new AppError("Inventory item not found", 404));
  }

  // Delete the inventory item
  await PharmacyInventory.findByIdAndDelete(inventoryItem._id);

  res.status(200).json({
    status: "success",
    message: "Inventory item removed successfully",
  });
});

// Delete pharmacy and all associated data
exports.deletePharmacy = catchAsync(async (req, res, next) => {
  const pharmacyId = req.params.id;

  // Check if the pharmacy exists
  const pharmacy = await User.findOne({
    _id: pharmacyId,
    userType: "Pharmacy",
  });

  if (!pharmacy) {
    return next(new AppError("Pharmacy not found", 404));
  }

  // Check authorization - only admin or the pharmacy itself can delete
  const isAuthorized =
    req.user.id === pharmacyId || // Pharmacy deleting itself
    req.user.userType === "Admin"; // Admin deleting any pharmacy

  if (!isAuthorized) {
    return next(
      new AppError("You are not authorized to delete this pharmacy", 403)
    );
  }

  // STEP 1: Delete all pharmacy inventory items
  const deletedInventory = await PharmacyInventory.deleteMany({
    pharmacy: pharmacyId,
  });

  // STEP 2: Delete pharmacy profile
  const deletedProfile = await PharmacyProfile.findOneAndDelete({
    user: pharmacyId,
  });

  // STEP 3: Delete pharmacy user
  await User.findByIdAndDelete(pharmacyId);

  res.status(200).json({
    status: "success",
    message: "Pharmacy and all associated data deleted successfully",
    data: {
      deletedInventoryItems: deletedInventory.deletedCount,
      profileDeleted: !!deletedProfile,
    },
  });
});

// MEDICATION SEARCH FUNCTIONALITY

// Search for medications and find pharmacies that have them
exports.searchMedications = catchAsync(async (req, res, next) => {
  const { query, longitude, latitude, distance = 10 } = req.query;

  if (!query) {
    return next(new AppError("Please provide a search query", 400));
  }

  // First, find medications matching the search query
  const nameRegex = new RegExp(query, "i");
  const medications = await Medication.find({
    $or: [
      { name: nameRegex },
      { description: nameRegex },
      { strength: nameRegex },
    ],
  });

  if (medications.length === 0) {
    return res.status(200).json({
      status: "success",
      results: 0,
      data: {
        medications: [],
        pharmacies: [],
      },
    });
  }

  // Get all medication IDs from the search results
  const medicationIds = medications.map((med) => med._id);

  // Find pharmacies that have these medications in stock
  let pharmacyQuery = {};

  // If location is provided, find nearby pharmacies
  if (longitude && latitude) {
    // Convert distance to meters (default 10km)
    const radius = distance * 1000;

    // First, get all pharmacies that are nearby
    const nearbyPharmacies = await User.find({
      userType: "Pharmacy",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radius,
        },
      },
    });

    const nearbyPharmacyIds = nearbyPharmacies.map((p) => p._id);

    // Then find inventory items for these pharmacies with the medications
    pharmacyQuery = {
      pharmacy: { $in: nearbyPharmacyIds },
      medication: { $in: medicationIds },
      stock: { $gt: 0 }, // Only include in-stock items
    };
  } else {
    // If no location is provided, just find any pharmacy with the medications
    pharmacyQuery = {
      medication: { $in: medicationIds },
      stock: { $gt: 0 }, // Only include in-stock items
    };
  }

  // Find inventory items that match the medication and pharmacy criteria
  const inventoryItems = await PharmacyInventory.find(pharmacyQuery)
    .populate("medication")
    .populate({
      path: "pharmacy",
      select: "firstName lastName location",
    });

  // Group by pharmacy
  const pharmaciesMap = {};
  inventoryItems.forEach((item) => {
    const pharmacyId = item.pharmacy._id.toString();

    if (!pharmaciesMap[pharmacyId]) {
      pharmaciesMap[pharmacyId] = {
        pharmacy: item.pharmacy,
        medications: [],
      };
    }

    pharmaciesMap[pharmacyId].medications.push({
      medication: item.medication,
      stock: item.stock,
      price: item.price,
      expiryDate: item.expiryDate,
    });
  });

  // Get pharmacy profiles for additional details
  const pharmacyIds = Object.keys(pharmaciesMap);
  const pharmacyProfiles = await PharmacyProfile.find({
    user: { $in: pharmacyIds },
  });

  // Create a map for quick access to profiles
  const profileMap = {};
  pharmacyProfiles.forEach((profile) => {
    profileMap[profile.user.toString()] = profile;
  });

  // Format the results
  const result = [];
  for (const pharmacyId in pharmaciesMap) {
    const pharmacyInfo = pharmaciesMap[pharmacyId];
    const profile = profileMap[pharmacyId] || {};

    result.push({
      id: pharmacyId,
      firstName: pharmacyInfo.pharmacy.firstName,
      lastName: pharmacyInfo.pharmacy.lastName,
      location: pharmacyInfo.pharmacy.location,
      locationDetails: {
        locationName: profile.locationName,
        formattedAddress: profile.formattedAddress,
        city: profile.city,
        state: profile.state,
        country: profile.country,
      },
      averageRating: profile.averageRating || 0,
      totalReviews: profile.totalReviews || 0,
      medications: pharmacyInfo.medications,
    });
  }

  res.status(200).json({
    status: "success",
    results: result.length,
    data: {
      medications,
      pharmacies: result,
    },
  });
});

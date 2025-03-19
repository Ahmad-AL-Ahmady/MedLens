const Medication = require("../models/medicationModel");
const PharmacyInventory = require("../models/pharmacyInventoryModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// Create a new medication
exports.createMedication = catchAsync(async (req, res, next) => {
  const { name, description, strength } = req.body;

  // Check if the medication already exists
  const existingMedication = await Medication.findOne({
    name,
    strength,
  });

  if (existingMedication) {
    return next(
      new AppError(
        "A medication with this name and strength already exists",
        400
      )
    );
  }

  // Create new medication
  const medication = await Medication.create({
    name,
    description,
    strength,
  });

  res.status(201).json({
    status: "success",
    data: {
      medication,
    },
  });
});

// Get all medications with filtering and pagination
exports.getAllMedications = catchAsync(async (req, res, next) => {
  // Build query based on filters
  const queryObj = {};

  // Filter by name if provided
  if (req.query.name) {
    queryObj.name = new RegExp(req.query.name, "i");
  }

  // Filter by strength if provided
  if (req.query.strength) {
    queryObj.strength = new RegExp(req.query.strength, "i");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Execute query with pagination
  const medications = await Medication.find(queryObj).skip(skip).limit(limit);

  // Get total count for pagination
  const totalMedications = await Medication.countDocuments(queryObj);

  res.status(200).json({
    status: "success",
    results: medications.length,
    pagination: {
      page,
      limit,
      totalMedications,
      totalPages: Math.ceil(totalMedications / limit),
    },
    data: {
      medications,
    },
  });
});

// Get medication by ID
exports.getMedicationById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const medication = await Medication.findById(id);

  if (!medication) {
    return next(new AppError("Medication not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      medication,
    },
  });
});

// Update medication
exports.updateMedication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, description, strength } = req.body;

  // Find and update the medication
  const updatedMedication = await Medication.findByIdAndUpdate(
    id,
    {
      name,
      description,
      strength,
    },
    { new: true, runValidators: true }
  );

  if (!updatedMedication) {
    return next(new AppError("Medication not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      medication: updatedMedication,
    },
  });
});

// Delete medication
exports.deleteMedication = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if the medication is in use in any pharmacy inventory
  const inUse = await PharmacyInventory.findOne({ medication: id });

  if (inUse) {
    return next(
      new AppError(
        "This medication is currently in a pharmacy's inventory and cannot be deleted",
        400
      )
    );
  }

  // Delete the medication
  const medication = await Medication.findByIdAndDelete(id);

  if (!medication) {
    return next(new AppError("Medication not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: null,
  });
});

// Get pharmacies that have a specific medication in stock
exports.getPharmaciesWithMedication = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { longitude, latitude, distance = 10 } = req.query;

  // Check if medication exists
  const medication = await Medication.findById(id);
  if (!medication) {
    return next(new AppError("Medication not found", 404));
  }

  // Base query to find pharmacy inventories with this medication in stock
  let inventoryQuery = {
    medication: id,
    stock: { $gt: 0 },
  };

  // If location is provided, find nearby pharmacies first
  let pharmacyIds = [];
  if (longitude && latitude) {
    // Convert distance to meters (default 10km)
    const radius = distance * 1000;

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

    pharmacyIds = nearbyPharmacies.map((p) => p._id);

    // Add pharmacy filter to inventory query
    if (pharmacyIds.length > 0) {
      inventoryQuery.pharmacy = { $in: pharmacyIds };
    }
  }

  // Find inventory items
  const inventoryItems = await PharmacyInventory.find(inventoryQuery).populate({
    path: "pharmacy",
    select: "firstName lastName location",
  });

  // Format response
  const pharmaciesWithMedication = inventoryItems.map((item) => ({
    id: item.pharmacy._id,
    name: `${item.pharmacy.firstName} ${item.pharmacy.lastName}`,
    location: item.pharmacy.location,
    stock: item.stock,
    price: item.price,
    expiryDate: item.expiryDate,
  }));

  res.status(200).json({
    status: "success",
    results: pharmaciesWithMedication.length,
    data: {
      medication,
      pharmacies: pharmaciesWithMedication,
    },
  });
});

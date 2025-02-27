const mongoose = require("mongoose");

const pharmacyInventorySchema = new mongoose.Schema(
  {
    pharmacy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    medication: {
      type: mongoose.Schema.ObjectId,
      ref: "Medication",
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    expiryDate: Date,
    price: {
      type: Number,
      required: true,
    },
    // discount: {
    //   type: Number,
    //   default: 0,
    //   min: 0,
    //   max: 100,
    // },
  },
  {
    timestamps: true,
  }
);

// Create compound index for pharmacy-medication unique pairs
pharmacyInventorySchema.index({ pharmacy: 1, medication: 1 }, { unique: true });

PharmacyInventory = mongoose.model(
  "PharmacyInventory",
  pharmacyInventorySchema
);

module.exports = PharmacyInventory;

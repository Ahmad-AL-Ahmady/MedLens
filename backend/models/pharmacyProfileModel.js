/**
 * pharmacyProfileModel.js
 *
 * This file defines the Mongoose schema for the PharmacyProfile model in the HealthVision backend.
 * It includes fields for pharmacy details such as user reference, name, location, operating hours, and inventory.
 */

const mongoose = require("mongoose");

// Define a schema for opening/closing hours
const operatingHoursSchema = new mongoose.Schema(
  {
    open: {
      type: String,
      validate: {
        validator: function (v) {
          // Time format validation (HH:MM)
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:MM`,
      },
    },
    close: {
      type: String,
      validate: {
        validator: function (v) {
          // Time format validation (HH:MM)
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid time format! Use HH:MM`,
      },
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const pharmacyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Enhanced operating hours with availability
    operatingHours: {
      monday: { type: operatingHoursSchema, default: () => ({}) },
      tuesday: { type: operatingHoursSchema, default: () => ({}) },
      wednesday: { type: operatingHoursSchema, default: () => ({}) },
      thursday: { type: operatingHoursSchema, default: () => ({}) },
      friday: { type: operatingHoursSchema, default: () => ({}) },
      saturday: { type: operatingHoursSchema, default: () => ({}) },
      sunday: { type: operatingHoursSchema, default: () => ({}) },
    },
    // Location information
    locationName: {
      type: String,
      trim: true,
    },
    formattedAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    // Rating information
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Additional information
    phoneNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for reviews
pharmacyProfileSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "reviewedEntity",
  localField: "user",
});

// Virtual populate for inventory
pharmacyProfileSchema.virtual("inventory", {
  ref: "PharmacyInventory",
  foreignField: "pharmacy",
  localField: "user",
});

const PharmacyProfile = mongoose.model(
  "PharmacyProfile",
  pharmacyProfileSchema
);

module.exports = PharmacyProfile;

const mongoose = require("mongoose");

const pharmacyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    openingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    description: {
      type: String,
      trim: true,
    },
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

/**
 * reviewModel.js
 *
 * This file defines the Mongoose schema for the Review model in the HealthVision backend.
 * It includes fields for review details such as user reference, entity being reviewed, rating, and comment.
 */

const mongoose = require("mongoose");
const DoctorProfile = require("./doctorProfileModel");
const PharmacyProfile = require("./pharmacyProfileModel");

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedEntity: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    entityType: {
      type: String,
      enum: ["Doctor", "Pharmacy"],
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: String,
    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// This compound index ensures a user can only review a specific entity once
reviewSchema.index({ reviewer: 1, reviewedEntity: 1 }, { unique: true });

// Create static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (entityId) {
  try {
    const stats = await this.aggregate([
      {
        $match: { reviewedEntity: new mongoose.Types.ObjectId(entityId) },
      },
      {
        $group: {
          _id: "$reviewedEntity",
          avgRating: { $avg: "$rating" },
          nRating: { $sum: 1 },
        },
      },
    ]);

    const updateData =
      stats.length > 0
        ? {
            averageRating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
            totalReviews: stats[0].nRating,
          }
        : {
            averageRating: 0,
            totalReviews: 0,
          };

    // First try to update doctor profile
    const doctorUpdated = await DoctorProfile.findOneAndUpdate(
      { user: entityId },
      updateData,
      { new: true } // Return the updated document
    );

    // If no doctor was updated, try pharmacy
    if (!doctorUpdated) {
      await PharmacyProfile.findOneAndUpdate({ user: entityId }, updateData, {
        new: true,
      });
    }

    console.log(`Updated stats for entity ${entityId}:`, updateData);
  } catch (error) {
    console.error("Error calculating average rating:", error);
  }
};

// Call calcAverageRating after save
reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRating(this.reviewedEntity);
});

// For deletion, store the document before deleting
reviewSchema.pre("findOneAndDelete", async function () {
  this.r = await this.clone().findOne();
});

// After deletion, calculate new average
reviewSchema.post("findOneAndDelete", async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRating(this.r.reviewedEntity);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

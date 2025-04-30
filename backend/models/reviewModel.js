const mongoose = require("mongoose");
const DoctorProfile = require("./doctorProfileModel");

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
  const stats = await this.aggregate([
    {
      $match: { reviewedEntity: entityId },
    },
    {
      $group: {
        _id: "$reviewedEntity",
        avgRating: { $avg: "$rating" },
        nRating: { $sum: 1 },
      },
    },
  ]);

  // Update the doctor or pharmacy profile
  if (stats.length > 0) {
    // First try to update doctor profile
    const doctorUpdated = await DoctorProfile.findOneAndUpdate(
      { user: entityId },
      {
        averageRating: stats[0].avgRating,
        totalReviews: stats[0].nRating,
      }
    );

    // If no doctor was updated, try pharmacy
    if (!doctorUpdated) {
      await PharmacyProfile.findOneAndUpdate(
        { user: entityId },
        {
          averageRating: stats[0].avgRating,
          totalReviews: stats[0].nRating,
        }
      );
    }
  }
};

// Call calcAverageRating after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.reviewedEntity);
});

// Call calcAverageRating before remove
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.reviewedEntity);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;

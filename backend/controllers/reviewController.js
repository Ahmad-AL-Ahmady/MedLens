const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const DoctorProfile = require("../models/doctorProfileModel");
const PharmacyProfile = require("../models/pharmacyProfileModel");
const Appointment = require("../models/appointmentModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

/**
 * Create a new review
 * Users can review doctors and pharmacies
 */
exports.createReview = catchAsync(async (req, res, next) => {
  const { reviewedEntityId, entityType, rating, comment } = req.body;

  // Validate required fields
  if (!reviewedEntityId || !entityType || !rating) {
    return next(
      new AppError("Entity ID, entity type, and rating are required", 400)
    );
  }

  // Validate entity type
  if (!["Doctor", "Pharmacy"].includes(entityType)) {
    return next(
      new AppError("Entity type must be 'Doctor' or 'Pharmacy'", 400)
    );
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  // Check if the entity exists
  const entity = await User.findOne({
    _id: reviewedEntityId,
    userType: entityType,
  });

  if (!entity) {
    return next(new AppError(`${entityType} not found`, 404));
  }

  // Check if user already reviewed this entity
  const existingReview = await Review.findOne({
    reviewer: req.user.id,
    reviewedEntity: reviewedEntityId,
  });

  if (existingReview) {
    return next(
      new AppError(
        `You have already reviewed this ${entityType.toLowerCase()}`,
        400
      )
    );
  }

  // Create the review
  const review = await Review.create({
    reviewer: req.user.id,
    reviewedEntity: reviewedEntityId,
    entityType,
    rating,
    comment,
    helpful: { count: 0, users: [] },
  });

  // Populate the review with reviewer information
  const populatedReview = await Review.findById(review._id).populate({
    path: "reviewer",
    select: "firstName lastName avatar",
  });

  res.status(201).json({
    status: "success",
    data: {
      review: populatedReview,
    },
  });
});

/**
 * Get all reviews for a specific entity (doctor or pharmacy)
 */
exports.getEntityReviews = catchAsync(async (req, res, next) => {
  const { entityId } = req.params;

  // Check if entity exists
  const entity = await User.findById(entityId);

  if (!entity) {
    return next(new AppError("Entity not found", 404));
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get reviews for this entity
  const reviews = await Review.find({ reviewedEntity: entityId })
    .populate({
      path: "reviewer",
      select: "firstName lastName avatar",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalReviews = await Review.countDocuments({
    reviewedEntity: entityId,
  });

  // Get entity details and average rating
  let profileData;
  if (entity.userType === "Doctor") {
    profileData = await DoctorProfile.findOne({ user: entityId });
  } else if (entity.userType === "Pharmacy") {
    profileData = await PharmacyProfile.findOne({ user: entityId });
  }

  res.status(200).json({
    status: "success",
    results: reviews.length,
    pagination: {
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
    data: {
      entityName: `${entity.firstName} ${entity.lastName}`,
      entityType: entity.userType,
      averageRating: profileData ? profileData.averageRating : 0,
      totalReviews: profileData ? profileData.totalReviews : 0,
      reviews,
    },
  });
});

/**
 * Get all reviews by the current user
 */
exports.getMyReviews = catchAsync(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get all reviews by this user
  const reviews = await Review.find({ reviewer: req.user.id })
    .populate({
      path: "reviewedEntity",
      select: "firstName lastName userType avatar",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalReviews = await Review.countDocuments({ reviewer: req.user.id });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    pagination: {
      page,
      limit,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
    },
    data: {
      reviews,
    },
  });
});

/**
 * Get a specific review by ID
 */
exports.getReviewById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id)
    .populate({
      path: "reviewer",
      select: "firstName lastName avatar",
    })
    .populate({
      path: "reviewedEntity",
      select: "firstName lastName userType avatar",
    });

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

/**
 * Update a review (rating and comment)
 */
exports.updateReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  // Find the review
  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Check if the user is authorized to update this review
  if (
    review.reviewer.toString() !== req.user.id &&
    req.user.userType !== "Admin"
  ) {
    return next(
      new AppError("You are not authorized to update this review", 403)
    );
  }

  // Update fields if provided
  if (rating !== undefined) {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return next(new AppError("Rating must be between 1 and 5", 400));
    }
    review.rating = rating;
  }

  if (comment !== undefined) {
    review.comment = comment;
  }

  // Save the updated review
  await review.save();

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

/**
 * Delete a review
 */
exports.deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the review
  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Check if the user is the one who created the review
  if (review.reviewer.toString() !== req.user.id) {
    return next(new AppError("You can only delete your own reviews", 403));
  }

  // Delete the review
  await Review.findByIdAndDelete(id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

/**
 * Mark a review as helpful (LIKE BUTTON 👍)
 */
exports.markReviewHelpful = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the review
  const review = await Review.findById(id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  // Check if user already marked this review as helpful
  const alreadyMarked = review.helpful.users.some(
    (userId) => userId.toString() === req.user.id
  );

  if (alreadyMarked) {
    // Remove the user from the helpful list
    review.helpful.users = review.helpful.users.filter(
      (userId) => userId.toString() !== req.user.id
    );
    review.helpful.count = Math.max(0, review.helpful.count - 1);
  } else {
    // Add the user to the helpful list
    review.helpful.users.push(req.user.id);
    review.helpful.count += 1;
  }

  // Save the updated review
  await review.save();

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

/**
 * Get statistics about reviews for the system
 * Admin only endpoint
 */
exports.getReviewStats = catchAsync(async (req, res, next) => {
  // Total reviews
  const totalReviews = await Review.countDocuments();

  // Reviews by entity type
  const reviewsByType = await Review.aggregate([
    {
      $group: {
        _id: "$entityType",
        count: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  // Top rated entities
  const topRatedEntities = await Review.aggregate([
    {
      $group: {
        _id: "$reviewedEntity",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
    {
      $match: {
        reviewCount: { $gte: 3 }, // Minimum of 3 reviews
      },
    },
    {
      $sort: { averageRating: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  // Populate entity details for top rated
  const topRatedWithDetails = await User.populate(topRatedEntities, {
    path: "_id",
    select: "firstName lastName userType",
  });

  // Rating distribution
  const ratingDistribution = await Review.aggregate([
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      totalReviews,
      reviewsByType,
      topRatedEntities: topRatedWithDetails,
      ratingDistribution,
    },
  });
});

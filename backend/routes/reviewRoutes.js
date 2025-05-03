const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * GET /api/reviews/entity/:entityId
 * Frontend: Used to view all reviews for a specific doctor or pharmacy
 * Parameter: entityId - ID of the doctor or pharmacy
 * Public endpoint to view all reviews for a specific entity
 * Used in doctor or pharmacy detail page reviews section
 */
router.get("/entity/:entityId", reviewController.getEntityReviews);

/**
 * GET /api/reviews/:id
 * Frontend: Used to view details of a specific review
 * Parameter: id - review ID
 * Public endpoint to view a specific review in detail
 * Used when clicking on a review for more information
 */
router.get("/:id", reviewController.getReviewById);

// All other routes require authentication
router.use(authController.protect);

/**
 * POST /api/reviews
 * Frontend: Used to create a new review for a doctor or pharmacy
 * Body contains reviewedEntityId, entityType, rating, and comment
 * Only authenticated users can create reviews
 * Patients can only review doctors they've had appointments with
 * Used in doctor or pharmacy detail page to submit a review
 */
router.post(
  "/",
  authController.restrictTo("Patient"),
  reviewController.createReview
);

/**
 * GET /api/reviews/my-reviews
 * Frontend: Used to view all reviews created by the current user
 * Returns a list of all reviews submitted by the current user
 * Only accessible to authenticated users
 * Used in "My Reviews" section of user dashboard
 */
router.get("/my-reviews", reviewController.getMyReviews);

/**
 * PATCH /api/reviews/:id
 * Frontend: Used to update a review's rating or comment
 * Parameter: id - review ID
 * Body contains updated rating and/or comment
 * Only the review creator or admin can update a review
 * Used in "My Reviews" section to edit an existing review
 */
router.patch("/:id", reviewController.updateReview);

/**
 * DELETE /api/reviews/:id
 * Frontend: Used to delete a review
 * Parameter: id - review ID
 * Only the review creator or admin can delete a review
 * Used in "My Reviews" section to remove a review
 */
router.delete("/:id", reviewController.deleteReview);

/**
 * POST /api/reviews/:id/helpful
 * Frontend: Used to mark a review as helpful or remove helpful mark
 * Parameter: id - review ID
 * Toggles the helpful status for the current user
 * Used in review display to mark a review as helpful
 */
router.post("/:id/like", reviewController.markReviewHelpful);

/**
 * GET /api/reviews/stats
 * Frontend: Used to view statistics about reviews in the system
 * Admin only endpoint for system analytics
 * Returns data about review counts, ratings, and top rated entities
 * Used in admin dashboard for system overview
 */
router.get(
  "/stats",
  authController.restrictTo("Admin"),
  reviewController.getReviewStats
);

module.exports = router;

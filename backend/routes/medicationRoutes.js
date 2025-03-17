const express = require("express");
const medicationController = require("../controllers/medicationController");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * GET /api/medications
 * Frontend: Used on medication search/browse screen to find medications
 * Parameters: name (search term), strength, page, limit
 * Returns paginated list of medications matching search criteria
 * Used in both patient medication search and pharmacy inventory management
 */
router.get("/", medicationController.getAllMedications);

/**
 * GET /api/medications/:id
 * Frontend: Used to view detailed information about a specific medication
 * Parameter: id - medication ID
 * Returns complete information about the medication
 * Used when user clicks on a medication from search results
 */
router.get("/:id", medicationController.getMedicationById);

/**
 * GET /api/medications/:id/pharmacies
 * Frontend: Used to find which pharmacies have a specific medication in stock
 * Parameter: id - medication ID
 * Query parameters: longitude, latitude, distance (optional, in km)
 * Returns list of pharmacies having this medication, sorted by distance if location provided
 * Used in medication detail page to show where to buy this medication
 */
router.get("/:id/pharmacies", medicationController.getPharmaciesWithMedication);

// Protected routes - require authentication
router.use(authController.protect);

/**
 * POST /api/medications
 * Frontend: Used by pharmacies or admins to add new medications to the system
 * Body contains medication details (name, description, strength)
 * Creates a new global medication entry in the database
 * Used in "Add New Medication" form in pharmacy inventory management
 */
router.post(
  "/",
  authController.restrictTo("Admin", "Pharmacy"),
  medicationController.createMedication
);

/**
 * PATCH /api/medications/:id
 * Frontend: Used to update general information about a medication
 * Parameter: id - medication ID
 * Body contains fields to update (name, description, strength)
 * Updates the global medication record
 * Used by pharmacies or admins to correct or update medication details
 */
router
  .route("/:id")
  .patch(
    authController.restrictTo("Admin", "Pharmacy"),
    medicationController.updateMedication
  )
  /**
   * DELETE /api/medications/:id
   * Frontend: Used to remove a medication from the system
   * Parameter: id - medication ID
   * Completely removes the medication (if not in any pharmacy inventory)
   * Admin-only functionality, used for removing obsolete medications
   */
  .delete(
    authController.restrictTo("Admin"),
    medicationController.deleteMedication
  );

module.exports = router;

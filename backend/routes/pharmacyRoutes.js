const express = require("express");
const pharmacyController = require("../controllers/pharmacyController");
const authController = require("../controllers/authController");

const router = express.Router();

/**
 * GET /api/pharmacies/all
 * Frontend: Used in pharmacy listing page with pagination, searching by name
 * Parameters: page, limit, name
 * Returns list of all pharmacies with basic details and pagination
 * Used when browsing all pharmacies without location-based search
 */
router.get("/all", pharmacyController.getAllPharmacies);

/**
 * GET /api/pharmacies/nearby
 * Frontend: Main pharmacy search functionality - finds pharmacies near user's location
 * Parameters: longitude, latitude, distance (optional, in km, default 10)
 * Returns pharmacies sorted by distance from user
 * Used when user searches for pharmacies with location access enabled
 */
router.get("/nearby", pharmacyController.getNearbyPharmacies);

/**
 * GET /api/pharmacies/search-medications
 * Frontend: Used in medication search feature to find pharmacies with specific medications
 * Parameters: query (medication name/description), longitude, latitude, distance (optional)
 * Returns matching medications and pharmacies that have them in stock
 * Used in "Find Medication" section where users search for where to buy specific medicines
 */
router.get("/search-medications", pharmacyController.searchMedications);

// Protected routes - require authentication
router.use(authController.protect);

/**
 * GET /api/pharmacies/profile
 * Frontend: Used in pharmacy's dashboard to view own profile
 * Shows pharmacy profile with inventory and reviews
 * Only accessible to pharmacy users - shows their complete profile data
 * Used in pharmacy's "My Profile" section
 */
router
  .route("/profile")
  .get(authController.restrictTo("Pharmacy"), pharmacyController.getMyProfile)
  /**
   * PATCH /api/pharmacies/profile
   * Frontend: Used in pharmacy's profile settings for updating information
   * Updates contact details, location, operating hours, etc.
   * Only accessible to pharmacy users for updating their own profile
   * Used in the "Edit Profile" form in pharmacy's dashboard
   */
  .patch(
    authController.restrictTo("Pharmacy"),
    pharmacyController.updateProfile
  );

/**
 * PATCH /api/pharmacies/:id/operating-hours
 * Frontend: Used to update a pharmacy's operating schedule
 * Body contains operating hours data for each day of the week
 * Can be used by the pharmacy to update their own hours or by admin
 * Used in the "Operating Hours" section of pharmacy settings
 */
router.patch("/:id/operating-hours", pharmacyController.updateOperatingHours);

/**
 * GET /api/pharmacies/inventory
 * Frontend: Used in pharmacy dashboard to view and manage inventory
 * Shows all medications in the pharmacy's inventory with stock levels and prices
 * Only accessible to the pharmacy user to view their own inventory
 * Used in the "Inventory Management" section of pharmacy dashboard
 */
router
  .route("/inventory")
  .get(authController.restrictTo("Pharmacy"), pharmacyController.getInventory)
  /**
   * POST /api/pharmacies/inventory
   * Frontend: Used to add or update medication in pharmacy inventory
   * Body contains medication ID, stock quantity, price, and expiry date
   * Creates new inventory entry if medication not in inventory, otherwise updates existing
   * Used in "Add/Edit Medication" form in inventory management
   */
  .post(
    authController.restrictTo("Pharmacy"),
    pharmacyController.updateInventoryItem
  );

/**
 * DELETE /api/pharmacies/inventory/:medicationId
 * Frontend: Used to remove a medication from pharmacy inventory
 * Parameter: medicationId - ID of the medication to remove
 * Completely removes the medication from pharmacy's inventory
 * Used in inventory management for discontinuing medications
 */
router.delete(
  "/inventory/:medicationId",
  authController.restrictTo("Pharmacy"),
  pharmacyController.removeInventoryItem
);

/**
 * GET /api/pharmacies/:id
 * Frontend: Used to view details of a specific pharmacy
 * Parameter: id - pharmacy ID
 * Returns complete pharmacy information including location and reviews
 * Used when user clicks on a pharmacy from search results
 */
router.get("/:id", pharmacyController.getPharmacyById);

/**
 * GET /api/pharmacies/:id/inventory
 * Frontend: Used to view a pharmacy's available medications
 * Parameter: id - pharmacy ID
 * Returns all medications in stock at the specified pharmacy
 * Used in pharmacy detail page to show what medications are available
 */
router.get("/:id/inventory", pharmacyController.getInventory);

/**
 * DELETE /api/pharmacies/:id
 * Frontend: Used to completely delete a pharmacy and all associated data
 * Parameter: id - pharmacy ID
 * Removes the pharmacy user, profile, and all inventory items
 * Can only be performed by the pharmacy itself or an admin
 * Used in account management for pharmacy deletion
 */
router.delete(
  "/:id",
  authController.protect,
  pharmacyController.deletePharmacy
);

module.exports = router;

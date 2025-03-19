const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Database connection
const DB = process.env.DATABASE;
console.log(
  `Connecting to database: ${
    DB ? "Database URI loaded successfully" : "Failed to load Database URI"
  }`
);

// Check if required environment variables are loaded
if (!DB) {
  console.error(
    "Error: DATABASE environment variable is not defined in .env file"
  );
  process.exit(1);
}

// Connect to database with proper error handling
mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connection successful!");
    // Only proceed with verification after successful connection
    verifyPharmaciesAndMedications();
  })
  .catch((err) => {
    console.log("DB connection error:", err);
    process.exit(1);
  });

// Import models - we need to ensure proper model registration order
require("../models");
const User = require("../models/userModel");
const PharmacyProfile = require("../models/pharmacyProfileModel");
const Medication = require("../models/medicationModel");
const PharmacyInventory = require("../models/pharmacyInventoryModel");

// Count pharmacies and medications
const verifyPharmaciesAndMedications = async () => {
  try {
    // 1. Count total pharmacies
    const totalPharmacies = await User.countDocuments({ userType: "Pharmacy" });
    console.log(`Total pharmacies in database: ${totalPharmacies}`);

    // 2. Count total medications
    const totalMedications = await Medication.countDocuments();
    console.log(`Total medications in database: ${totalMedications}`);

    // 3. Count total inventory items
    const totalInventoryItems = await PharmacyInventory.countDocuments();
    console.log(`Total pharmacy inventory items: ${totalInventoryItems}`);

    // 4. Calculate average inventory items per pharmacy
    const avgItemsPerPharmacy =
      totalPharmacies > 0
        ? Math.round((totalInventoryItems / totalPharmacies) * 10) / 10
        : 0;
    console.log(`Average medications per pharmacy: ${avgItemsPerPharmacy}`);

    // 5. Get a sample of pharmacies with their profiles
    const samplePharmacies = await User.find({ userType: "Pharmacy" })
      .select("firstName lastName location")
      .limit(5);

    console.log("\nSample pharmacies:");
    for (const pharmacy of samplePharmacies) {
      const profile = await PharmacyProfile.findOne({
        user: pharmacy._id,
      }).select("phoneNumber operatingHours");

      console.log(`- ${pharmacy.firstName} ${pharmacy.lastName}`);
      console.log(
        `  Location: [${
          pharmacy.location?.coordinates?.join(", ") || "No coordinates"
        }]`
      );

      if (profile) {
        console.log(`  Phone: ${profile.phoneNumber || "Not set"}`);

        // Print a sample of operating hours
        const monday = profile.operatingHours?.monday;
        if (monday) {
          console.log(
            `  Monday Hours: ${
              monday.isOpen ? `${monday.open} - ${monday.close}` : "Closed"
            }`
          );
        }
      }

      // Get inventory count for this pharmacy
      const inventoryCount = await PharmacyInventory.countDocuments({
        pharmacy: pharmacy._id,
      });
      console.log(`  Inventory: ${inventoryCount} medications`);

      // Get a sample of 3 medications from this pharmacy's inventory
      const inventorySample = await PharmacyInventory.find({
        pharmacy: pharmacy._id,
      })
        .populate("medication")
        .limit(3);

      if (inventorySample.length > 0) {
        console.log("  Sample inventory items:");
        inventorySample.forEach((item) => {
          console.log(
            `    - ${item.medication.name} ${item.medication.strength}: ${item.stock} in stock, ${item.price} EGP`
          );
        });
      }

      console.log("");
    }

    // 6. Get top 5 medications (most commonly stocked)
    const topMedications = await PharmacyInventory.aggregate([
      {
        $group: {
          _id: "$medication",
          pharmacyCount: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          avgStock: { $avg: "$stock" },
        },
      },
      { $sort: { pharmacyCount: -1 } },
      { $limit: 5 },
    ]);

    console.log("\nTop 5 most commonly stocked medications:");
    for (const item of topMedications) {
      const medication = await Medication.findById(item._id);
      console.log(`- ${medication.name} ${medication.strength}`);
      console.log(`  Stocked by ${item.pharmacyCount} pharmacies`);
      console.log(
        `  Average price: ${Math.round(item.avgPrice * 100) / 100} EGP`
      );
      console.log(`  Average stock: ${Math.round(item.avgStock)} units`);
    }

    // 7. Test nearby query - find pharmacies near Cairo
    const cairoCoordinates = [31.2357, 30.0444]; // Cairo coordinates

    console.log("\nTesting nearby pharmacies functionality...");
    try {
      const nearbyPharmacies = await User.find({
        userType: "Pharmacy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: cairoCoordinates,
            },
            $maxDistance: 10000, // 10km
          },
        },
      }).limit(5);

      console.log(
        `Found ${nearbyPharmacies.length} pharmacies within 10km of Cairo:`
      );
      for (const pharmacy of nearbyPharmacies) {
        console.log(`- ${pharmacy.firstName} ${pharmacy.lastName}`);

        // Calculate distance in km
        const lon1 = cairoCoordinates[0];
        const lat1 = cairoCoordinates[1];
        const lon2 = pharmacy.location.coordinates[0];
        const lat2 = pharmacy.location.coordinates[1];

        // Simple distance calculation
        const R = 6371; // Radius of the earth in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km

        console.log(`  Distance: ${distance.toFixed(2)} km from Cairo`);
      }

      // 8. Test medication search - find pharmacies with a specific medication
      console.log("\nTesting medication search functionality...");

      // Find a random medication to search for
      const randomMedication = await Medication.findOne();

      if (randomMedication) {
        console.log(
          `Searching for pharmacies with: ${randomMedication.name} ${randomMedication.strength}`
        );

        // Find pharmacies that have this medication in stock
        const pharmaciesWithMedication = await PharmacyInventory.find({
          medication: randomMedication._id,
          stock: { $gt: 0 },
        })
          .populate("pharmacy")
          .populate("medication")
          .limit(5);

        console.log(
          `Found ${pharmaciesWithMedication.length} pharmacies with this medication:`
        );

        for (const item of pharmaciesWithMedication) {
          const pharmacy = await User.findById(item.pharmacy);
          console.log(`- ${pharmacy.firstName} ${pharmacy.lastName}`);
          console.log(`  Price: ${item.price} EGP`);
          console.log(`  Stock: ${item.stock} units`);

          if (pharmacy.location && pharmacy.location.coordinates) {
            // Calculate distance from Cairo
            const lon1 = cairoCoordinates[0];
            const lat1 = cairoCoordinates[1];
            const lon2 = pharmacy.location.coordinates[0];
            const lat2 = pharmacy.location.coordinates[1];

            // Distance calculation
            const R = 6371;
            const dLat = ((lat2 - lat1) * Math.PI) / 180;
            const dLon = ((lon2 - lon1) * Math.PI) / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            console.log(`  Distance: ${distance.toFixed(2)} km from Cairo`);
          }
        }
      } else {
        console.log("No medications found to search for.");
      }
    } catch (error) {
      console.error("Error testing nearby functionality:", error.message);
      console.log(
        "Hint: Make sure you have a geospatial index on the location field:"
      );
      console.log('User.index({ location: "2dsphere" });');
    }

    console.log("\nVerification complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error during verification:", error);
    process.exit(1);
  }
};

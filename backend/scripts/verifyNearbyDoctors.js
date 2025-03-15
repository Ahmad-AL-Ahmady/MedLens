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
    countDoctors();
  })
  .catch((err) => {
    console.log("DB connection error:", err);
    process.exit(1);
  });

// Import models - we need to ensure proper model registration order
require("../models");
const User = require("../models/userModel");
const DoctorProfile = require("../models/doctorProfileModel");

// Count doctors
const countDoctors = async () => {
  try {
    const totalDoctors = await User.countDocuments({ userType: "Doctor" });
    console.log(`Total doctors in database: ${totalDoctors}`);

    // Count by specialization
    const specializations = await User.aggregate([
      { $match: { userType: "Doctor" } },
      { $group: { _id: "$specialization", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\nDoctors by specialization:");
    specializations.forEach((spec) => {
      console.log(`- ${spec._id || "Unspecified"}: ${spec.count}`);
    });

    // Get a sample of doctors with their profiles
    const sampleDoctors = await User.find({ userType: "Doctor" })
      .select("firstName lastName specialization location")
      .limit(5);

    console.log("\nSample doctors:");
    for (const doctor of sampleDoctors) {
      const profile = await DoctorProfile.findOne({ user: doctor._id }).select(
        "biography fees"
      );

      console.log(`- Dr. ${doctor.firstName} ${doctor.lastName}`);
      console.log(`  Specialization: ${doctor.specialization}`);
      console.log(
        `  Location: [${
          doctor.location?.coordinates?.join(", ") || "No coordinates"
        }]`
      );
      if (profile) {
        console.log(`  Fees: ${profile.fees || "Not set"} EGP`);
        console.log(
          `  Bio: ${
            profile.biography
              ? profile.biography.slice(0, 100) + "..."
              : "No biography"
          }`
        );
      }
      console.log("");
    }

    // Test nearby query - find doctors near Cairo
    const cairoCoordinates = [31.2357, 30.0444]; // Cairo coordinates

    console.log("\nTesting nearby doctors functionality...");
    try {
      const nearbyDoctors = await User.find({
        userType: "Doctor",
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
        `Found ${nearbyDoctors.length} doctors within 10km of Cairo:`
      );
      for (const doctor of nearbyDoctors) {
        console.log(
          `- Dr. ${doctor.firstName} ${doctor.lastName}, ${doctor.specialization}`
        );

        // Calculate distance in km
        const lon1 = cairoCoordinates[0];
        const lat1 = cairoCoordinates[1];
        const lon2 = doctor.location.coordinates[0];
        const lat2 = doctor.location.coordinates[1];

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

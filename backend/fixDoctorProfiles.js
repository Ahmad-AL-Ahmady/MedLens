/**
 * fixDoctorProfiles.js
 *
 * This file contains a utility function to fix doctor profiles in the HealthVision backend.
 * It connects to the MongoDB database, loads the User and DoctorProfile models,
 * and then checks each doctor user. If a doctor does not have a corresponding profile,
 * it creates a new profile with default availability settings.
 *
 * @async
 * @function fixDoctorProfiles
 * @throws {Error} If there's an error accessing the database or creating profiles
 * @returns {Promise<void>} Resolves when all profiles are checked/created
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const DB = process.env.DATABASE;
console.log(
  `Connecting to database: ${DB ? "DATABASE loaded" : "DATABASE not loaded"}`
);

// Connect to database
mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });

// Load models
require("./models");
const User = mongoose.model("User");
const DoctorProfile = mongoose.model("DoctorProfile");

/**
 * Fixes doctor profiles by creating missing profiles for doctors in the database.
 * This function finds all users with userType "Doctor" and ensures each has a corresponding DoctorProfile.
 * If a doctor doesn't have a profile, it creates one with default availability settings.
 *
 * @async
 * @function fixDoctorProfiles
 * @throws {Error} If there's an error accessing the database or creating profiles
 *
 * @returns {Promise<void>} Resolves when all profiles are checked/created
 *
 * Process:
 * 1. Queries all doctor users from the database
 * 2. For each doctor, checks if they have an existing profile
 * 3. Creates new profiles with default availability for doctors without profiles
 * 4. Logs results including number of doctors found, profiles created, and failures
 * 5. Closes database connection when complete
 */
async function fixDoctorProfiles() {
  try {
    console.log("Starting doctor profile fix...");

    // Find all doctor users
    const doctors = await User.find({ userType: "Doctor" });
    console.log(`Found ${doctors.length} doctors in the database`);

    let fixed = 0;
    let failed = 0;

    // Create missing profiles
    for (const doctor of doctors) {
      try {
        console.log(
          `Checking doctor: ${doctor.firstName} ${doctor.lastName} (${doctor._id})`
        );

        // Check if profile exists
        const existingProfile = await DoctorProfile.findOne({
          user: doctor._id,
        });

        if (existingProfile) {
          console.log(
            `  Doctor profile already exists (ID: ${existingProfile._id})`
          );
        } else {
          console.log(`  No profile found, creating new profile...`);

          // Create new profile with minimal required fields
          const profile = await DoctorProfile.create({
            user: doctor._id,
            // Add default values for any required fields
            availability: {
              monday: { isAvailable: false },
              tuesday: { isAvailable: false },
              wednesday: { isAvailable: false },
              thursday: { isAvailable: false },
              friday: { isAvailable: false },
              saturday: { isAvailable: false },
              sunday: { isAvailable: false },
            },
          });

          console.log(`  ✅ Created new profile (ID: ${profile._id})`);
          fixed++;
        }
      } catch (error) {
        console.error(`  ❌ Error creating profile for doctor ${doctor._id}:`);
        console.error(`     ${error.message}`);
        failed++;
      }
    }

    console.log(`\nResults:`);
    console.log(`- ${doctors.length} doctors found`);
    console.log(`- ${fixed} profiles created`);
    console.log(`- ${failed} failures`);

    if (fixed === 0 && failed === 0) {
      console.log("All doctors already have profiles!");
    }

    // Close database connection
    mongoose.connection.close();
    console.log("Done!");
  } catch (error) {
    console.error("Error fixing doctor profiles:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the fix
fixDoctorProfiles();

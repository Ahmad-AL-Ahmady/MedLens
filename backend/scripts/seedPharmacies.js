const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Database connection
const DB = process.env.DATABASE;
console.log(
  `Database connection string: ${
    DB ? "Valid" : "Invalid - check your .env file"
  }`
);

// Cairo neighborhoods and Delta cities with coordinates - same as in seedDoctors.js
const locations = [
  // Cairo Neighborhoods
  {
    city: "Cairo",
    area: "Downtown",
    coordinates: [31.2357, 30.0444],
    description: "Central Cairo",
  },
  {
    city: "Cairo",
    area: "Maadi",
    coordinates: [31.2573, 29.9742],
    description: "Upscale residential area",
  },
  {
    city: "Cairo",
    area: "Zamalek",
    coordinates: [31.2229, 30.07],
    description: "Island neighborhood",
  },
  {
    city: "Cairo",
    area: "Heliopolis",
    coordinates: [31.332, 30.0914],
    description: "Eastern district",
  },
  {
    city: "Cairo",
    area: "Nasr City",
    coordinates: [31.3675, 30.0566],
    description: "Modern district",
  },
  {
    city: "Cairo",
    area: "New Cairo",
    coordinates: [31.4216, 30.0075],
    description: "New development",
  },
  {
    city: "Cairo",
    area: "5th Settlement",
    coordinates: [31.4429, 29.9916],
    description: "New Cairo district",
  },
  {
    city: "Cairo",
    area: "Garden City",
    coordinates: [31.2297, 30.0433],
    description: "Historic district",
  },
  {
    city: "Cairo",
    area: "Dokki",
    coordinates: [31.2126, 30.038],
    description: "Central area in Giza",
  },
  {
    city: "Cairo",
    area: "Mohandessin",
    coordinates: [31.2039, 30.0541],
    description: "Popular residential area",
  },

  // Giza
  {
    city: "Giza",
    area: "Haram",
    coordinates: [31.1386, 29.9914],
    description: "Near the pyramids",
  },
  {
    city: "Giza",
    area: "6th of October",
    coordinates: [30.9748, 29.9491],
    description: "Western suburb",
  },
  {
    city: "Giza",
    area: "Sheikh Zayed",
    coordinates: [30.9385, 30.0149],
    description: "New city",
  },

  // Delta Cities
  {
    city: "Alexandria",
    area: "Downtown",
    coordinates: [29.9187, 31.2001],
    description: "Coastal city center",
  },
  {
    city: "Alexandria",
    area: "Montazah",
    coordinates: [29.9995, 31.2783],
    description: "Eastern district",
  },
  {
    city: "Alexandria",
    area: "Gleem",
    coordinates: [29.9657, 31.2406],
    description: "Coastal area",
  },
  {
    city: "Alexandria",
    area: "Smouha",
    coordinates: [29.9367, 31.2099],
    description: "Southern district",
  },
  {
    city: "Tanta",
    area: "Downtown",
    coordinates: [31.0, 30.7865],
    description: "Central Delta",
  },
  {
    city: "Mansoura",
    area: "Downtown",
    coordinates: [31.3667, 31.0333],
    description: "Northeastern Delta",
  },
  {
    city: "Zagazig",
    area: "Downtown",
    coordinates: [31.5021, 30.5833],
    description: "Eastern Delta",
  },
];

// Common medications to seed
const medicationsData = [
  // Common antibiotics
  {
    name: "Amoxicillin",
    description: "Penicillin antibiotic",
    strength: "500mg",
  },
  {
    name: "Azithromycin",
    description: "Macrolide antibiotic",
    strength: "250mg",
  },
  {
    name: "Ciprofloxacin",
    description: "Fluoroquinolone antibiotic",
    strength: "500mg",
  },
  {
    name: "Doxycycline",
    description: "Tetracycline antibiotic",
    strength: "100mg",
  },

  // Pain relievers
  {
    name: "Paracetamol",
    description: "Pain reliever and fever reducer",
    strength: "500mg",
  },
  { name: "Ibuprofen", description: "NSAID pain reliever", strength: "400mg" },
  {
    name: "Diclofenac",
    description: "NSAID for pain and inflammation",
    strength: "50mg",
  },
  { name: "Tramadol", description: "Opioid pain medication", strength: "50mg" },

  // Blood pressure medications
  {
    name: "Amlodipine",
    description: "Calcium channel blocker",
    strength: "5mg",
  },
  { name: "Lisinopril", description: "ACE inhibitor", strength: "10mg" },
  {
    name: "Losartan",
    description: "Angiotensin II receptor blocker",
    strength: "50mg",
  },
  { name: "Bisoprolol", description: "Beta blocker", strength: "5mg" },

  // Diabetes medications
  {
    name: "Metformin",
    description: "Oral diabetes medication",
    strength: "500mg",
  },
  {
    name: "Glimepiride",
    description: "Sulfonylurea for diabetes",
    strength: "2mg",
  },
  {
    name: "Insulin Glargine",
    description: "Long-acting insulin",
    strength: "100IU/ml",
  },

  // Gastrointestinal medications
  {
    name: "Omeprazole",
    description: "Proton pump inhibitor",
    strength: "20mg",
  },
  {
    name: "Ranitidine",
    description: "H2 blocker for acid reflux",
    strength: "150mg",
  },
  {
    name: "Loperamide",
    description: "Anti-diarrheal medication",
    strength: "2mg",
  },

  // Allergy medications
  {
    name: "Cetirizine",
    description: "Antihistamine for allergies",
    strength: "10mg",
  },
  {
    name: "Fexofenadine",
    description: "Non-drowsy antihistamine",
    strength: "120mg",
  },
  {
    name: "Diphenhydramine",
    description: "Antihistamine and sleep aid",
    strength: "25mg",
  },

  // Respiratory medications
  {
    name: "Salbutamol",
    description: "Bronchodilator for asthma",
    strength: "100mcg",
  },
  {
    name: "Fluticasone",
    description: "Inhaled corticosteroid",
    strength: "50mcg",
  },
  {
    name: "Montelukast",
    description: "Leukotriene modifier for asthma",
    strength: "10mg",
  },

  // Vitamins and supplements
  { name: "Vitamin D3", description: "Vitamin supplement", strength: "1000IU" },
  {
    name: "Vitamin B Complex",
    description: "B vitamin supplement",
    strength: "Multiple",
  },
  {
    name: "Iron Supplement",
    description: "For iron deficiency",
    strength: "65mg",
  },
  {
    name: "Calcium + Vitamin D",
    description: "Bone health supplement",
    strength: "600mg/400IU",
  },

  // Topical medications
  {
    name: "Betamethasone",
    description: "Topical corticosteroid",
    strength: "0.1%",
  },
  { name: "Clotrimazole", description: "Antifungal cream", strength: "1%" },
];

// Egyptian pharmacy names
const pharmacyPrefixes = [
  "Al",
  "El",
  "New",
  "Modern",
  "Super",
  "Pharma",
  "Care",
  "Health",
  "Family",
  "Cairo",
  "Nile",
  "Delta",
  "Egyptian",
  "Community",
  "City",
];

const pharmacySuffixes = [
  "Pharmacy",
  "Pharma",
  "Drugstore",
  "Medications",
  "Meds",
  "Care",
  "Health",
  "Wellness",
  "Medical",
  "Remedies",
];

// Generate a random pharmacy name
function generatePharmacyName() {
  const prefix =
    pharmacyPrefixes[Math.floor(Math.random() * pharmacyPrefixes.length)];
  const suffix =
    pharmacySuffixes[Math.floor(Math.random() * pharmacySuffixes.length)];
  return `${prefix} ${suffix}`;
}

// Generate a list of pharmacies with details
function generatePharmaciesList(count) {
  const pharmacies = [];
  const usedEmails = new Set();
  const usedNames = new Set();

  for (let i = 0; i < count; i++) {
    // Pick a random location
    const location = locations[Math.floor(Math.random() * locations.length)];

    // Generate a unique pharmacy name
    let pharmacyName;
    do {
      pharmacyName = generatePharmacyName();
    } while (usedNames.has(pharmacyName));
    usedNames.add(pharmacyName);

    // Generate email (ensure it's unique)
    let email;
    do {
      email = `${pharmacyName.toLowerCase().replace(/\s/g, "")}${Math.floor(
        Math.random() * 1000
      )}@example.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    // Use pharmacy name for first name, and location for last name
    const firstName = pharmacyName;
    const lastName = `${location.area} Branch`;

    // Generate random phone number
    const phoneNumber = `+20${Math.floor(Math.random() * 10)}${Math.floor(
      Math.random() * 10000000
    )
      .toString()
      .padStart(7, "0")}`;

    pharmacies.push({
      firstName,
      lastName,
      email,
      phoneNumber,
      location: {
        coordinates: location.coordinates,
      },
      city: location.city,
      area: location.area,
      areaDescription: location.description,
    });
  }

  return pharmacies;
}

// Generate default operating hours for pharmacies
const generateOperatingHours = () => {
  return {
    monday: { open: "08:00", close: "22:00", isOpen: true },
    tuesday: { open: "08:00", close: "22:00", isOpen: true },
    wednesday: { open: "08:00", close: "22:00", isOpen: true },
    thursday: { open: "08:00", close: "22:00", isOpen: true },
    friday: { open: "08:00", close: "22:00", isOpen: true },
    saturday: { open: "09:00", close: "22:00", isOpen: true },
    sunday: { open: "09:00", close: "22:00", isOpen: true },
  };
};

async function seedPharmacies(pharmacyCount = 20) {
  try {
    // Connect to database
    await mongoose.connect(DB);
    console.log("DB connection successful!");

    // Import models after successful connection
    const User = require("../models/userModel");
    const PharmacyProfile = require("../models/pharmacyProfileModel");
    const Medication = require("../models/medicationModel");
    const PharmacyInventory = require("../models/pharmacyInventoryModel");

    console.log(
      `Models loaded - User: ${!!User}, PharmacyProfile: ${!!PharmacyProfile}, Medication: ${!!Medication}, PharmacyInventory: ${!!PharmacyInventory}`
    );

    // Generate pharmacy data
    const pharmaciesList = generatePharmaciesList(pharmacyCount);
    console.log(`Generated data for ${pharmaciesList.length} pharmacies`);

    // Clear existing test pharmacies if needed
    console.log("Clearing existing test pharmacies...");
    await User.deleteMany({ email: /.*example.com/, userType: "Pharmacy" });

    // Hash the password once for all pharmacies
    const password = await bcrypt.hash(
      process.env.Fake_Doctors_Password || "pass1234",
      12
    );

    // Create users one by one to ensure hooks run properly
    const createdUsers = [];
    console.log("Creating pharmacy users...");

    for (const pharmacy of pharmaciesList) {
      try {
        const userData = {
          firstName: pharmacy.firstName,
          lastName: pharmacy.lastName,
          email: pharmacy.email,
          password: password,
          passwordConfirm: password,
          userType: "Pharmacy",
          gender: Math.random() > 0.5 ? "male" : "female", // Just for profile completeness
          age: 30 + Math.floor(Math.random() * 30), // Just for profile completeness
          location: {
            type: "Point",
            coordinates: pharmacy.location.coordinates,
          },
          profileCompleted: true,
          emailVerified: true,
        };

        // Use create instead of insertMany to ensure hooks run
        const user = await User.create(userData);
        console.log(
          `Created pharmacy: ${user.firstName} ${user.lastName} in ${pharmacy.city}, ${pharmacy.area}`
        );
        createdUsers.push({ user, details: pharmacy });
      } catch (error) {
        console.error(
          `Error creating pharmacy ${pharmacy.firstName} ${pharmacy.lastName}:`,
          error.message
        );
      }
    }

    console.log(`Successfully created ${createdUsers.length} pharmacy users.`);

    // Update pharmacy profiles with additional data
    console.log("Updating pharmacy profiles with additional data...");

    for (const { user, details } of createdUsers) {
      try {
        // Find the already created profile (created by the post-save hook)
        const existingProfile = await PharmacyProfile.findOne({
          user: user._id,
        });

        if (existingProfile) {
          // Update with additional data
          const updatedProfile = await PharmacyProfile.findByIdAndUpdate(
            existingProfile._id,
            {
              phoneNumber: details.phoneNumber,
              operatingHours: generateOperatingHours(),
              city: details.city,
              locationName: `${details.area}, ${details.city}`,
              formattedAddress: `${details.area}, ${details.city}, Egypt`,
            },
            { new: true }
          );

          console.log(
            `Updated profile for ${user.firstName} ${user.lastName} in ${details.city}`
          );
        } else {
          console.log(
            `No profile found for ${user.firstName} ${user.lastName}, this is unexpected`
          );
        }
      } catch (error) {
        console.error(
          `Error updating profile for pharmacy ${user.firstName} ${user.lastName}:`,
          error.message
        );
      }
    }

    // Create medications (if they don't exist)
    console.log("Creating/verifying medications...");
    const createdMedications = [];

    for (const medicationData of medicationsData) {
      try {
        // Check if medication already exists
        let medication = await Medication.findOne({
          name: medicationData.name,
          strength: medicationData.strength,
        });

        if (!medication) {
          medication = await Medication.create(medicationData);
          console.log(
            `Created medication: ${medication.name} ${medication.strength}`
          );
        } else {
          console.log(
            `Medication already exists: ${medication.name} ${medication.strength}`
          );
        }

        createdMedications.push(medication);
      } catch (error) {
        console.error(
          `Error creating medication ${medicationData.name}:`,
          error.message
        );
      }
    }

    console.log(
      `Successfully processed ${createdMedications.length} medications.`
    );

    // Add medications to pharmacy inventories
    console.log("Adding medications to pharmacy inventories...");

    // Clear existing inventory items for test pharmacies
    const pharmacyIds = createdUsers.map(({ user }) => user._id);
    await PharmacyInventory.deleteMany({ pharmacy: { $in: pharmacyIds } });

    // For each pharmacy, add a random subset of medications
    for (const { user } of createdUsers) {
      // Determine how many medications this pharmacy will have (between 10 and 25)
      const medicationCount = 10 + Math.floor(Math.random() * 16);

      // Shuffle the medications array and take the first medicationCount items
      const shuffled = [...createdMedications].sort(() => 0.5 - Math.random());
      const selectedMedications = shuffled.slice(0, medicationCount);

      // Add each selected medication to the pharmacy's inventory
      for (const medication of selectedMedications) {
        try {
          // Generate random stock (between 10 and 100)
          const stock = 10 + Math.floor(Math.random() * 91);

          // Generate random price based on medication (with some variation)
          let basePrice = 0;
          if (medication.name.includes("Vitamin")) basePrice = 50;
          else if (medication.strength.includes("mg")) {
            const mgValue = parseInt(medication.strength);
            basePrice = mgValue * 0.1;
          } else basePrice = 20;

          // Add some randomness to the price
          const price = basePrice + Math.floor(Math.random() * 30);

          // Generate expiry date (between 6 months and 2 years from now)
          const monthsToAdd = 6 + Math.floor(Math.random() * 18);
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

          // Create inventory item
          await PharmacyInventory.create({
            pharmacy: user._id,
            medication: medication._id,
            stock,
            price,
            expiryDate,
          });

          console.log(
            `Added ${medication.name} ${medication.strength} to ${user.firstName}'s inventory`
          );
        } catch (error) {
          console.error(
            `Error adding ${medication.name} to ${user.firstName}'s inventory:`,
            error.message
          );
        }
      }
    }

    console.log("Seeding completed successfully!");
    console.log("Distribution by city:");

    // Count pharmacies by city
    const cityCounts = {};
    createdUsers.forEach(({ details }) => {
      cityCounts[details.city] = (cityCounts[details.city] || 0) + 1;
    });

    Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`${city}: ${count} pharmacies`);
      });

    // Count medications
    console.log(`\nTotal medications: ${createdMedications.length}`);
    console.log("Sample medications:");
    createdMedications.slice(0, 5).forEach((med) => {
      console.log(`- ${med.name} ${med.strength}: ${med.description}`);
    });
  } catch (error) {
    console.error("Error during seeding process:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// You can change the number of pharmacies to seed
const numberOfPharmacies = 20;
seedPharmacies(numberOfPharmacies);

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

// Menofia Governorate locations with coordinates - focused around 30.5077622, 31.1251893
const locations = [
  // Shibin El Kom (Capital of Menofia)
  {
    city: "Shibin El Kom",
    area: "Downtown",
    coordinates: [30.552, 31.012],
    description: "Capital of Menofia Governorate",
  },
  {
    city: "Shibin El Kom",
    area: "El Mahatta",
    coordinates: [30.558, 31.014],
    description: "Train station area",
  },
  {
    city: "Shibin El Kom",
    area: "El Gamaa",
    coordinates: [30.545, 31.018],
    description: "University district",
  },

  // Menouf
  {
    city: "Menouf",
    area: "Downtown",
    coordinates: [30.4658, 30.9335],
    description: "Historic town center",
  },
  {
    city: "Menouf",
    area: "El Midan",
    coordinates: [30.468, 30.935],
    description: "Central square area",
  },

  // Quesna
  {
    city: "Quesna",
    area: "Downtown",
    coordinates: [30.5077, 31.1251], // The requested coordinates
    description: "Main district",
  },
  {
    city: "Quesna",
    area: "El Mahatta",
    coordinates: [30.509, 31.128],
    description: "Transportation hub",
  },
  {
    city: "Quesna",
    area: "Al Azhar Street",
    coordinates: [30.505, 31.124],
    description: "Commercial district",
  },

  // Tala
  {
    city: "Tala",
    area: "Downtown",
    coordinates: [30.6803, 30.9401],
    description: "Town center",
  },
  {
    city: "Tala",
    area: "El Souq",
    coordinates: [30.682, 30.942],
    description: "Market area",
  },

  // Ashmoun
  {
    city: "Ashmoun",
    area: "Downtown",
    coordinates: [30.2975, 30.9753],
    description: "Main district",
  },
  {
    city: "Ashmoun",
    area: "El Tahrir",
    coordinates: [30.3, 30.978],
    description: "Central square",
  },

  // Berket El Sab
  {
    city: "Berket El Sab",
    area: "Downtown",
    coordinates: [30.6267, 31.075],
    description: "Town center",
  },
  {
    city: "Berket El Sab",
    area: "El Kornish",
    coordinates: [30.628, 31.077],
    description: "Waterfront area",
  },

  // El Bagour
  {
    city: "El Bagour",
    area: "Downtown",
    coordinates: [30.4319, 31.0319],
    description: "Town center",
  },
  {
    city: "El Bagour",
    area: "El Mahatta",
    coordinates: [30.433, 31.034],
    description: "Station area",
  },

  // El Shohada
  {
    city: "El Shohada",
    area: "Downtown",
    coordinates: [30.5964, 30.8967],
    description: "Town center",
  },
  {
    city: "El Shohada",
    area: "El Souq",
    coordinates: [30.598, 30.898],
    description: "Market district",
  },

  // El Sadat City (Related to Menofia)
  {
    city: "El Sadat City",
    area: "Downtown",
    coordinates: [30.3619, 30.5336],
    description: "Modern planned city",
  },
  {
    city: "El Sadat City",
    area: "Industrial Zone",
    coordinates: [30.37, 30.54],
    description: "Industrial area",
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

// Egyptian pharmacy names in Menofia region
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
  "Menofia",
  "Nile",
  "Delta",
  "Quesna",
  "Shibin",
  "Egyptian",
  "Community",
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

// Local pharmacy names in Arabic transliteration
const localPharmacyNames = [
  "Al Shorouk",
  "Al Amana",
  "Al Baraka",
  "Al Rahma",
  "Al Salam",
  "Al Noor",
  "Al Shefa",
  "Al Ezaby",
  "Al Hayah",
  "Al Dawaa",
  "Al Mohsen",
  "Al Watany",
  "Al Zahraa",
  "Al Hekma",
  "Ibn Sina",
  "Al Tawhid",
  "Al Mostakbal",
  "Al Doktor",
  "Al Zaytoun",
  "Al Taqwa",
];

// Generate a random pharmacy name with more local flavor
function generatePharmacyName() {
  // 40% chance to use a local Arabic-style name
  if (Math.random() < 0.4) {
    return localPharmacyNames[
      Math.floor(Math.random() * localPharmacyNames.length)
    ];
  }

  // 60% chance to use prefix-suffix combination
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

  // Distribute pharmacies with higher concentration around Quesna (the specified coordinates)
  // and fewer as we move away from that area
  const locationWeights = locations.map((loc) => {
    // Calculate distance from Quesna center (30.5077, 31.1251)
    const latDiff = loc.coordinates[0] - 30.5077;
    const lngDiff = loc.coordinates[1] - 31.1251;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    // Weight inversely proportional to distance (closer = higher weight)
    return {
      location: loc,
      weight: 1 / (distance + 0.05), // Adding small constant to avoid division by zero
    };
  });

  // Normalize weights to create a probability distribution
  const totalWeight = locationWeights.reduce((sum, loc) => sum + loc.weight, 0);
  const normalizedWeights = locationWeights.map((loc) => ({
    location: loc.location,
    probability: loc.weight / totalWeight,
  }));

  for (let i = 0; i < count; i++) {
    // Select location based on weighted probability
    const rand = Math.random();
    let cumulativeProbability = 0;
    let selectedLocation;

    for (const loc of normalizedWeights) {
      cumulativeProbability += loc.probability;
      if (rand <= cumulativeProbability) {
        selectedLocation = loc.location;
        break;
      }
    }

    // If somehow we didn't select (shouldn't happen), take the first one
    if (!selectedLocation) {
      selectedLocation = locations[0];
    }

    // Generate a unique pharmacy name
    let pharmacyName;
    do {
      pharmacyName = generatePharmacyName();
    } while (usedNames.has(pharmacyName));
    usedNames.add(pharmacyName);

    // Generate email (ensure it's unique)
    let email;
    do {
      // Use more Egyptian-style email domains sometimes
      const emailDomain =
        Math.random() > 0.5
          ? "example.com"
          : Math.random() > 0.5
          ? "gmail.com"
          : "yahoo.com";

      email = `${pharmacyName.toLowerCase().replace(/\s/g, "")}${Math.floor(
        Math.random() * 1000
      )}@${emailDomain}`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    // Use pharmacy name for first name, and location for last name
    const firstName = pharmacyName;
    const lastName = `${selectedLocation.area} Branch`;

    // Generate random phone number (Egyptian format)
    const phoneNumber = `+20${
      Math.random() > 0.5 ? "10" : Math.random() > 0.5 ? "11" : "12"
    }${Math.floor(Math.random() * 10000000)
      .toString()
      .padStart(7, "0")}`;

    pharmacies.push({
      firstName,
      lastName,
      email,
      phoneNumber,
      location: {
        coordinates: selectedLocation.coordinates,
      },
      city: selectedLocation.city,
      area: selectedLocation.area,
      areaDescription: selectedLocation.description,
    });
  }

  return pharmacies;
}

// Generate operating hours for pharmacies
const generateOperatingHours = () => {
  // Some pharmacies will have different hours
  const openingVariations = ["08:00", "09:00", "10:00"];
  const closingVariations = ["22:00", "23:00", "00:00"];
  const weekendOpeningVariations = ["09:00", "10:00", "11:00"];

  // Some pharmacies will be 24 hours
  const is24Hours = Math.random() < 0.2;

  if (is24Hours) {
    return {
      monday: { open: "00:00", close: "23:59", isOpen: true },
      tuesday: { open: "00:00", close: "23:59", isOpen: true },
      wednesday: { open: "00:00", close: "23:59", isOpen: true },
      thursday: { open: "00:00", close: "23:59", isOpen: true },
      friday: { open: "00:00", close: "23:59", isOpen: true },
      saturday: { open: "00:00", close: "23:59", isOpen: true },
      sunday: { open: "00:00", close: "23:59", isOpen: true },
    };
  }

  const opening =
    openingVariations[Math.floor(Math.random() * openingVariations.length)];
  const closing =
    closingVariations[Math.floor(Math.random() * closingVariations.length)];
  const weekendOpening =
    weekendOpeningVariations[
      Math.floor(Math.random() * weekendOpeningVariations.length)
    ];

  // Friday is a religious day in Egypt, some pharmacies may have different hours
  const fridayOpen = Math.random() < 0.8; // 80% chance pharmacy is open on Friday

  return {
    monday: { open: opening, close: closing, isOpen: true },
    tuesday: { open: opening, close: closing, isOpen: true },
    wednesday: { open: opening, close: closing, isOpen: true },
    thursday: { open: opening, close: closing, isOpen: true },
    friday: {
      open: fridayOpen ? weekendOpening : "00:00",
      close: fridayOpen ? closing : "00:00",
      isOpen: fridayOpen,
    },
    saturday: { open: weekendOpening, close: closing, isOpen: true },
    sunday: { open: weekendOpening, close: closing, isOpen: true },
  };
};

async function seedPharmacies(pharmacyCount = 30) {
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
    console.log(
      `Generated data for ${pharmaciesList.length} pharmacies in Menofia region`
    );

    // Clear existing test pharmacies if needed
    console.log("Clearing existing test pharmacies...");
    await User.deleteMany({
      email: /.*example.com|.*gmail.com|.*yahoo.com/,
      userType: "Pharmacy",
    });

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

    console.log(
      `Successfully created ${createdUsers.length} pharmacy users in Menofia region.`
    );

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
              formattedAddress: `${details.area}, ${details.city}, Menofia Governorate, Egypt`,
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
    console.log("Distribution of pharmacies by city in Menofia region:");

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

// Seed 30 pharmacies in the Menofia region
const numberOfPharmacies = 30;
seedPharmacies(numberOfPharmacies);

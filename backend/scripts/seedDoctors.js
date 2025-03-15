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

// Cairo neighborhoods and Delta cities with coordinates
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
  {
    city: "Port Said",
    area: "Downtown",
    coordinates: [32.3019, 31.2556],
    description: "Northeastern port city",
  },
  {
    city: "Damietta",
    area: "Downtown",
    coordinates: [31.8144, 31.4165],
    description: "Northern Delta",
  },
  {
    city: "Kafr El Sheikh",
    area: "Downtown",
    coordinates: [30.94, 31.11],
    description: "Northern Delta",
  },
  {
    city: "Damanhur",
    area: "Downtown",
    coordinates: [30.4721, 31.0409],
    description: "Western Delta",
  },
];

// Specializations with more weight to common ones
const specializations = [
  "General Practice",
  "General Practice",
  "General Practice",
  "Cardiology",
  "Cardiology",
  "Dermatology",
  "Dermatology",
  "Pediatrics",
  "Pediatrics",
  "Pediatrics",
  "General Surgery",
  "General Surgery",
  "Anesthesiology",
  "Radiology",
  "Psychiatry",
  "Obstetrics/Gynecology",
  "Obstetrics/Gynecology",
  "ENT",
  "ENT",
];

// Egyptian names
const egyptianFirstNames = [
  // Male names
  "Mohamed",
  "Ahmed",
  "Mahmoud",
  "Ali",
  "Omar",
  "Youssef",
  "Ibrahim",
  "Mostafa",
  "Karim",
  "Khaled",
  "Amr",
  "Hassan",
  "Hussein",
  "Tarek",
  "Sherif",
  "Hany",
  "Sameh",
  "Wael",
  "Ayman",
  "Ashraf",
  "Adel",
  "Magdy",
  // Female names
  "Nour",
  "Laila",
  "Hoda",
  "Amira",
  "Sara",
  "Mariam",
  "Fatma",
  "Aisha",
  "Mona",
  "Eman",
  "Heba",
  "Rania",
  "Dina",
  "Nashwa",
  "Yasmine",
  "Nadia",
  "Reem",
  "Sahar",
  "Salma",
  "Hala",
  "Shereen",
  "Noha",
  "Ghada",
  "Rehab",
];

const egyptianLastNames = [
  "Mohamed",
  "Ahmed",
  "Mahmoud",
  "Ali",
  "Ibrahim",
  "Hassan",
  "Hussein",
  "Fouad",
  "Abdel Rahman",
  "Abdel Aziz",
  "El-Sayed",
  "Shawky",
  "Mansour",
  "Khalil",
  "Farouk",
  "Fathy",
  "Naguib",
  "Samir",
  "Osman",
  "Zaki",
  "Selim",
  "Gaber",
  "Ramzy",
  "Taha",
  "Hamdy",
  "Abbas",
  "Morsy",
  "Salem",
  "Helmy",
  "Aboul Fotouh",
  "El-Sherif",
  "Maher",
  "Lotfy",
  "Wahba",
  "Zaghloul",
  "Nassar",
  "Rashad",
  "Abdellatif",
  "Moustafa",
  "Kamel",
  "Sadek",
  "Sobhy",
  "Refaat",
  "Hashim",
  "El-Masry",
  "Abdallah",
  "El-Badry",
  "El-Din",
];

// Generate a list of doctors with details
function generateDoctorsList(count) {
  const doctors = [];
  const usedEmails = new Set();

  for (let i = 0; i < count; i++) {
    // Pick a random location
    const location = locations[Math.floor(Math.random() * locations.length)];

    // Pick a random name
    const firstName =
      egyptianFirstNames[Math.floor(Math.random() * egyptianFirstNames.length)];
    const lastName =
      egyptianLastNames[Math.floor(Math.random() * egyptianLastNames.length)];

    // Generate email (ensure it's unique)
    let email;
    do {
      email = `${firstName.toLowerCase()}.${lastName
        .toLowerCase()
        .replace(/\s/g, "")}${Math.floor(Math.random() * 1000)}@example.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    // Pick a random specialization
    const specialization =
      specializations[Math.floor(Math.random() * specializations.length)];

    // Generate random fees (higher for popular areas like Maadi, Zamalek, Heliopolis)
    let fees = 200 + Math.floor(Math.random() * 300); // base 200-500
    if (
      [
        "Maadi",
        "Zamalek",
        "Heliopolis",
        "New Cairo",
        "5th Settlement",
      ].includes(location.area)
    ) {
      fees += 100; // premium for upscale areas
    }

    doctors.push({
      firstName,
      lastName,
      email,
      specialization,
      location: {
        coordinates: location.coordinates,
      },
      fees,
      city: location.city,
      area: location.area,
      areaDescription: location.description,
    });
  }

  return doctors;
}

// Generate default availability for doctors
const generateAvailability = () => {
  return {
    monday: { start: "09:00", end: "17:00", isAvailable: true },
    tuesday: { start: "09:00", end: "17:00", isAvailable: true },
    wednesday: { start: "09:00", end: "17:00", isAvailable: true },
    thursday: { start: "09:00", end: "17:00", isAvailable: true },
    friday: { start: "09:00", end: "14:00", isAvailable: true },
    saturday: { start: "10:00", end: "14:00", isAvailable: true },
    sunday: { isAvailable: false },
  };
};

async function seedDoctors(doctorCount = 30) {
  try {
    // Connect to database
    await mongoose.connect(DB);
    console.log("DB connection successful!");

    // Import models after successful connection
    const User = require("../models/userModel");
    const DoctorProfile = require("../models/doctorProfileModel");

    console.log(
      `Models loaded - User: ${!!User}, DoctorProfile: ${!!DoctorProfile}`
    );

    // Generate doctor data
    const doctorsList = generateDoctorsList(doctorCount);
    console.log(`Generated data for ${doctorsList.length} doctors`);

    // Clear existing test doctors if needed
    console.log("Clearing existing test doctors...");
    await User.deleteMany({ email: /.*example.com/ });

    // Hash the password once for all doctors
    const password = await bcrypt.hash(
      process.env.Fake_Doctors_Password || "pass1234",
      12
    );

    // Create users one by one to ensure hooks run properly
    const createdUsers = [];
    console.log("Creating doctor users...");

    for (const doctor of doctorsList) {
      try {
        const userData = {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email,
          password: password,
          passwordConfirm: password,
          userType: "Doctor",
          gender: Math.random() > 0.4 ? "male" : "female",
          age: 30 + Math.floor(Math.random() * 30),
          specialization: doctor.specialization,
          location: {
            type: "Point",
            coordinates: doctor.location.coordinates,
          },
          profileCompleted: true,
          emailVerified: true,
        };

        // Use create instead of insertMany to ensure hooks run
        const user = await User.create(userData);
        console.log(
          `Created doctor: ${user.firstName} ${user.lastName} - ${doctor.specialization} in ${doctor.city}, ${doctor.area}`
        );
        createdUsers.push({ user, details: doctor });
      } catch (error) {
        console.error(
          `Error creating doctor ${doctor.firstName} ${doctor.lastName}:`,
          error.message
        );
      }
    }

    console.log(`Successfully created ${createdUsers.length} doctor users.`);

    // Update doctor profiles with additional data
    console.log("Updating doctor profiles with additional data...");

    for (const { user, details } of createdUsers) {
      try {
        // Find the already created profile (created by the post-save hook)
        const existingProfile = await DoctorProfile.findOne({ user: user._id });

        if (existingProfile) {
          // Update with additional data
          const updatedProfile = await DoctorProfile.findByIdAndUpdate(
            existingProfile._id,
            {
              fees: details.fees,
              availability: generateAvailability(),
              city: details.city,
              locationName: `${details.area}, ${details.city}`,
              formattedAddress: `${details.area}, ${details.city}, Egypt`,
            },
            { new: true }
          );

          console.log(
            `Updated profile for Dr. ${user.firstName} ${user.lastName} in ${details.city}`
          );
        } else {
          console.log(
            `No profile found for Dr. ${user.firstName} ${user.lastName}, this is unexpected`
          );
        }
      } catch (error) {
        console.error(
          `Error updating profile for doctor ${user.firstName} ${user.lastName}:`,
          error.message
        );
      }
    }

    console.log("Seeding completed successfully!");
    console.log("Distribution by city:");

    // Count doctors by city
    const cityCounts = {};
    createdUsers.forEach(({ details }) => {
      cityCounts[details.city] = (cityCounts[details.city] || 0) + 1;
    });

    Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`${city}: ${count} doctors`);
      });

    // Count doctors by specialization
    console.log("\nDistribution by specialization:");
    const specCounts = {};
    createdUsers.forEach(({ details }) => {
      specCounts[details.specialization] =
        (specCounts[details.specialization] || 0) + 1;
    });

    Object.entries(specCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([spec, count]) => {
        console.log(`${spec}: ${count} doctors`);
      });
  } catch (error) {
    console.error("Error during seeding process:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

// You can change the number of doctors to seed
const numberOfDoctors = 30;
seedDoctors(numberOfDoctors);

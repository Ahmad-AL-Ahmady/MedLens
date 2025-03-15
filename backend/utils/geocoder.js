const NodeGeocoder = require("node-geocoder");
const AppError = require("./appError");

// Configure geocoder with OpenStreetMap
const options = {
  provider: "openstreetmap",
  formatter: null,
  language: "en", // Request English results
  httpAdapter: "https",
};

const geocoder = NodeGeocoder(options);

// Reverse geocode (coordinates to address)
exports.reverseGeocode = async (latitude, longitude) => {
  try {
    // Adjust precision to 6 decimal places for consistency
    const lat = parseFloat(parseFloat(latitude).toFixed(6));
    const lng = parseFloat(parseFloat(longitude).toFixed(6));

    // Add explicit language parameter for more reliable results
    const result = await geocoder.reverse({
      lat,
      lon: lng,
      language: "en", // Explicitly request English
    });

    if (!result || result.length === 0) {
      return {
        locationName: "Unknown Location",
        formattedAddress: "",
        city: "",
        state: "",
        country: "",
      };
    }

    const location = result[0];

    // Sometimes OpenStreetMap still returns local names, let's try to use English country names
    const countryMap = {
      مصر: "Egypt",
      السعودية: "Saudi Arabia",
      الإمارات: "United Arab Emirates",
      الأردن: "Jordan",
      تونس: "Tunisia",
      المغرب: "Morocco",
      الجزائر: "Algeria",
      لبنان: "Lebanon",
      قطر: "Qatar",
      الكويت: "Kuwait",
      البحرين: "Bahrain",
      عمان: "Oman",
      ليبيا: "Libya",
      اليمن: "Yemen",
      سوريا: "Syria",
      السودان: "Sudan",
    };

    // Convert known Arabic country names to English
    let country = location.country;
    if (countryMap[country]) {
      country = countryMap[country];
    }

    // Use English names for states in Egypt if possible
    let state = location.state;
    const egyptStates = {
      المنوفية: "Menoufia",
      القاهرة: "Cairo",
      الإسكندرية: "Alexandria",
      الجيزة: "Giza",
      الشرقية: "Sharqia",
      الغربية: "Gharbia",
      البحيرة: "Beheira",
      الدقهلية: "Dakahlia",
      القليوبية: "Qalyubia",
      أسيوط: "Assiut",
      سوهاج: "Sohag",
      المنيا: "Minya",
      "كفر الشيخ": "Kafr El Sheikh",
      الفيوم: "Faiyum",
      "بني سويف": "Beni Suef",
      قنا: "Qena",
      أسوان: "Aswan",
      الأقصر: "Luxor",
      بورسعيد: "Port Said",
      الإسماعيلية: "Ismailia",
      السويس: "Suez",
    };

    if (country === "Egypt" || country === "مصر") {
      if (egyptStates[state]) {
        state = egyptStates[state];
      }
    }

    // Try to build a more English-friendly formatted address
    let formattedAddress = location.formattedAddress;
    if (location.streetName && location.city && state && country) {
      formattedAddress = [location.streetName, location.city, state, country]
        .filter(Boolean)
        .join(", ");
    }

    return {
      locationName:
        formattedAddress || location.formattedAddress || "Unknown Location",
      formattedAddress: formattedAddress || location.formattedAddress || "",
      city: location.city || "",
      state: state || "",
      country: country || "",
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      locationName: "Unknown Location",
      formattedAddress: "",
      city: "",
      state: "",
      country: "",
    };
  }
};

// Forward geocode (address to coordinates)
exports.geocode = async (address) => {
  try {
    const result = await geocoder.geocode({
      address,
      language: "en", // Explicitly request English
    });

    if (!result || result.length === 0) {
      throw new AppError("Location not found for this address", 400);
    }

    const location = result[0];

    return {
      type: "Point",
      coordinates: [location.longitude, location.latitude],
      formattedAddress: location.formattedAddress,
      city: location.city,
      state: location.state || location.administrativeLevels?.level1long || "",
      country: location.country,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Error processing location data", 500);
  }
};

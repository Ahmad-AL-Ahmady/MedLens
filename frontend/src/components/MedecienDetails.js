import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import "../Styles/Medeciendetails.css";

export default function MedicineDetails() {
  const { id } = useParams(); // Get medication ID from URL
  const navigate = useNavigate();
  const { state } = useLocation(); // Access state from PharmacyPage
  const [medicine, setMedicine] = useState(null); // Store medication details
  const [pharmacies, setPharmacies] = useState([]); // Store pharmacies with the medication
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Haversine formula for distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // Distance in km
  };

  // Log location and distance to console
  useEffect(() => {
    console.log("Location from PharmacyPage:", state?.location);
    console.log("Distance from PharmacyPage:", state?.distance);
  }, [state]);

  // Fetch medication and pharmacy data
  useEffect(() => {
    const fetchMedicationDetails = async () => {
      Swal.fire({
        title: "Loading Medication Details...",
        text: "Please wait while we fetch the details!",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // Fetch medication details
        const medicationResponse = await fetch(
          `http://localhost:4000/api/medications/${id}`
        );
        if (!medicationResponse.ok) {
          throw new Error("Failed to fetch medication details");
        }
        const medicationData = await medicationResponse.json();
        setMedicine(medicationData.data.medication); // Store medication details

        // Step 1: Fetch pharmacies stocking the medication
        const pharmacyWithMedResponse = await fetch(
          `http://localhost:4000/api/medications/${id}/pharmacies`
        );
        if (!pharmacyWithMedResponse.ok) {
          throw new Error("Failed to fetch pharmacies with medication");
        }
        const pharmacyWithMedData = await pharmacyWithMedResponse.json();
        const pharmaciesWithMedication = pharmacyWithMedData.data.pharmacies;

        // Step 2: Fetch nearby pharmacies if location is available
        let nearbyPharmacies = [];
        if (state?.location?.coordinates) {
          const [longitude, latitude] = state.location.coordinates;
          const distance = state?.distance || 10; // Default to 10km
          const nearbyResponse = await fetch(
            `http://localhost:4000/api/pharmacies/nearby?longitude=${longitude}&latitude=${latitude}&distance=${distance}`
          );
          if (!nearbyResponse.ok) {
            throw new Error("Failed to fetch nearby pharmacies");
          }
          const nearbyData = await nearbyResponse.json();
          nearbyPharmacies = nearbyData.data.pharmacies;
        } else {
          // If no location, use all pharmacies with the medication
          nearbyPharmacies = pharmaciesWithMedication;
        }

        // Step 3: Intersect pharmacies with medication and nearby pharmacies
        const nearbyPharmacyIds = nearbyPharmacies.map((p) => p.id.toString());
        const filteredPharmacies = pharmaciesWithMedication.filter((pharmacy) =>
          nearbyPharmacyIds.includes(pharmacy.id.toString())
        );

        // Step 4: Fetch pharmacy profiles for locationDetails
        const pharmacyIds = filteredPharmacies.map((p) => p.id);
        const profileResponse = await fetch(
          `http://localhost:4000/api/pharmacies/profiles?ids=${pharmacyIds.join(
            ","
          )}`
        );
        let profileData = { data: [] };
        if (profileResponse.ok) {
          profileData = await profileResponse.json();
        }

        // Create a map of profiles for quick lookup
        const profileMap = {};
        profileData.data.forEach((profile) => {
          profileMap[profile.id] = profile;
        });

        // Step 5: Enhance pharmacies with calculated distance and locationDetails
        const enhancedPharmacies = filteredPharmacies.map((pharmacy) => {
          const profile = profileMap[pharmacy.id] || {};
          return {
            ...pharmacy,
            locationDetails: profile.locationDetails || {
              locationName: "",
              formattedAddress: "",
              city: "",
              state: "",
              country: "",
            },
            calculatedDistance:
              state?.location && pharmacy.location?.coordinates
                ? calculateDistance(
                    state.location.coordinates[1], // User latitude
                    state.location.coordinates[0], // User longitude
                    pharmacy.location.coordinates[1], // Pharmacy latitude
                    pharmacy.location.coordinates[0] // Pharmacy longitude
                  )
                : "N/A",
          };
        });

        console.log(
          "Nearby pharmacies stocking the medication:",
          enhancedPharmacies
        );
        setPharmacies(enhancedPharmacies); // Store enhanced pharmacies

        setLoading(false);
        Swal.close(); // Close loading alert
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
        Swal.close();
        Swal.fire({
          icon: "error",
          title: "Oops, something went wrong!",
          text:
            err.message ||
            "We couldn't load the medication details. Please try again later.",
          confirmButtonText: "Okay",
        });
      }
    };

    fetchMedicationDetails();
  }, [id, state]);

  // Handle loading and error states
  if (loading) {
    return (
      <div className="medecien-details">
        <button
          className="medecien-details__back-button"
          onClick={() => navigate(-1)}
        >
          ← Back to medicines
        </button>
        <div className="medecien-details__loading">
          <p>Loading medication details...</p>
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="medecien-details">
        <button
          className="medecien-details__back-button"
          onClick={() => navigate(-1)}
        >
          ← Back to medicines
        </button>
        <div className="medecien-details__error">
          <p>{error || "No medication found or an error occurred."}</p>
          <button
            className="medecien-details__retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medecien-details">
      <button
        className="medecien-details__back-button"
        onClick={() => navigate(-1)}
      >
        ← Back to medicines
      </button>

      <div className="medecien-details__header">
        <h1 className="medecien-details__title">{medicine.name}</h1>
        <span className="medecien-details__category">{medicine.strength}</span>
        <p className="medecien-details__description">
          {medicine.description ||
            "No description available for this medication."}
        </p>
      </div>

      <h2 className="medecien-details__subtitle">
        Available at Nearby Pharmacies
      </h2>

      <div className="medecien-details__pharmacy-list">
        {pharmacies.length > 0 ? (
          pharmacies.map((pharmacy, index) => (
            <div key={index} className="medecien-details__pharmacy-item">
              <div className="medecien-details__pharmacy-info">
                <h3 className="medecien-details__pharmacy-name">
                  {pharmacy.name}
                </h3>
                <p className="medecien-details__pharmacy-distance">
                  {pharmacy.calculatedDistance !== "N/A"
                    ? `${pharmacy.calculatedDistance} km`
                    : "Distance not available"}{" "}
                  • {pharmacy.stock} in stock
                </p>
                <p className="medecien-details__pharmacy-address">
                  {pharmacy.locationDetails?.formattedAddress ||
                    "Address not available"}
                </p>
              </div>

              <div className="medecien-details__pharmacy-pricing">
                <span className="medecien-details__pharmacy-price">
                  ${pharmacy.price?.toFixed(2) || "N/A"}
                </span>
                <button
                  className="medecien-details__view-map-button"
                  onClick={() =>
                    pharmacy.location?.coordinates &&
                    window.open(
                      `https://www.google.com/maps?q=${pharmacy.location.coordinates[1]},${pharmacy.location.coordinates[0]}`
                    )
                  }
                >
                  View Map
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="medecien-details__no-pharmacies">
            <p>No pharmacies currently stock this medication in your area.</p>
            {state?.location && (
              <p className="medecien-details__suggestion">
                Try increasing your search distance or check back later.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

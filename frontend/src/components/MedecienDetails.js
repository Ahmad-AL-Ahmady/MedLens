import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import "../Styles/Medeciendetails.css";

export default function MedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [medicine, setMedicine] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null); // State for selected pharmacy details
  const [pharmacyLoading, setPharmacyLoading] = useState(false); // Loading state for pharmacy details
  const [showModal, setShowModal] = useState(false); // Control modal visibility

  // Haversine formula for distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
    return (R * c).toFixed(1);
  };

  // Fetch medication and nearby pharmacies
  useEffect(() => {
    const fetchMedicationDetails = async () => {
      try {
        const medicationResponse = await fetch(
          `http://localhost:4000/api/medications/${id}`
        );
        if (!medicationResponse.ok) {
          throw new Error("Failed to fetch medication details");
        }
        const medicationData = await medicationResponse.json();
        setMedicine(medicationData.data.medication);

        if (!state?.location || !state?.distance) {
          throw new Error(
            "Location and distance are required to find nearby pharmacies."
          );
        }

        const queryParams = new URLSearchParams({
          longitude: state.location.coordinates[0],
          latitude: state.location.coordinates[1],
          distance: state.distance, // Already in km from PharmacyPage
        }).toString();

        const pharmacyResponse = await fetch(
          `http://localhost:4000/api/medications/${id}/pharmacies/nearby?${queryParams}`
        );
        if (!pharmacyResponse.ok) {
          throw new Error("Failed to fetch nearby pharmacies");
        }
        const pharmacyData = await pharmacyResponse.json();
        let nearbyPharmacies = pharmacyData.data.pharmacies;

        nearbyPharmacies = nearbyPharmacies.map((pharmacy, index) => ({
          ...pharmacy,
          calculatedDistance: pharmacy.location?.coordinates
            ? calculateDistance(
                state.location.coordinates[1],
                state.location.coordinates[0],
                pharmacy.location.coordinates[1],
                pharmacy.location.coordinates[0]
              )
            : "N/A",
          animationOrder: index,
        }));

        setPharmacies(nearbyPharmacies);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Oops, something went wrong!",
          text: err.message,
          confirmButtonText: "Okay",
        });
      }
    };

    fetchMedicationDetails();
  }, [id, state]);

  // Fetch pharmacy details by ID
  const fetchPharmacyDetails = async (pharmacyId) => {
    setPharmacyLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/pharmacies/${pharmacyId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pharmacy details");
      }
      const data = await response.json();
      setSelectedPharmacy(data.data);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching pharmacy details:", err);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Could not load pharmacy details. Please try again.",
      });
    } finally {
      setPharmacyLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedPharmacy(null);
  };

  if (loading) {
    return (
      <div className="medicine-details medicine-details--loading">
        <div className="medicine-details__spinner"></div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="medicine-details">
        <button
          className="medicine-details__back-button"
          onClick={() => navigate(-1)}
          aria-label="Back to medicines"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
          Back to medicines
        </button>
        <p className="medicine-details__error">
          {error || "No medication found."}
        </p>
      </div>
    );
  }

  return (
    <div className="medicine-details">
      <button
        className="medicine-details__back-button"
        onClick={() => navigate(-1)}
        aria-label="Back to medicines"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
        Back to medicines
      </button>

      <div className="medicine-details__header">
        <h1 className="medicine-details__title">{medicine.name}</h1>
        <span className="medicine-details__category">{medicine.strength}</span>
        <p className="medicine-details__description">
          {medicine.description ||
            "No description available for this medication."}
        </p>
      </div>

      <h2 className="medicine-details__subtitle">
        Available at Nearby Pharmacies
      </h2>

      <div className="medicine-details__pharmacy-list">
        {pharmacies.length > 0 ? (
          pharmacies.map((pharmacy, index) => (
            <div
              key={index}
              className="medicine-details__pharmacy-item"
              style={{ "--animation-order": pharmacy.animationOrder }}
              onClick={() => fetchPharmacyDetails(pharmacy.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fetchPharmacyDetails(pharmacy.id);
                }
              }}
            >
              <div className="medicine-details__pharmacy-info">
                <h3 className="medicine-details__pharmacy-name">
                  {pharmacy.name}
                </h3>
                <p className="medicine-details__pharmacy-distance">
                  {pharmacy.calculatedDistance !== "N/A"
                    ? `${pharmacy.calculatedDistance} km away`
                    : "Distance not available"}{" "}
                  • {pharmacy.stock} in stock
                </p>
                <p className="medicine-details__pharmacy-address">
                  {pharmacy.locationDetails?.formattedAddress ||
                    "Address not available"}
                </p>
              </div>

              <div className="medicine-details__pharmacy-pricing">
                <span className="medicine-details__pharmacy-price">
                  ${pharmacy.price?.toFixed(2) || "N/A"}
                </span>
                <button
                  className="medicine-details__view-map-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering modal
                    window.open(
                      `https://www.google.com/maps?q=${pharmacy.location?.coordinates[1]},${pharmacy.location?.coordinates[0]}`,
                      "_blank"
                    );
                  }}
                  aria-label={`View ${pharmacy.name} on map`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  View on Map
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="medicine-details__no-results">
            No nearby pharmacies stock this medication within {state?.distance}{" "}
            km.
          </p>
        )}
      </div>

      {/* Pharmacy Details Modal */}
      {showModal && selectedPharmacy && (
        <div className="medicine-details__modal">
          <div className="medicine-details__modal-content">
            <button
              className="medicine-details__modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            {pharmacyLoading ? (
              <div className="medicine-details__spinner"></div>
            ) : (
              <>
                <h2 className="medicine-details__modal-title">
                  {selectedPharmacy.firstName} {selectedPharmacy.lastName}
                </h2>
                <p className="medicine-details__modal-address">
                  {selectedPharmacy.locationDetails?.formattedAddress ||
                    "Address not available"}
                </p>
                <p className="medicine-details__modal-rating">
                  Rating: {selectedPharmacy.profile?.averageRating || 0} (
                  {selectedPharmacy.profile?.totalReviews || 0} reviews)
                </p>
                <h3 className="medicine-details__modal-subtitle">
                  Operating Hours
                </h3>
                <ul className="medicine-details__modal-hours">
                  {selectedPharmacy.profile?.operatingHours ? (
                    Object.entries(selectedPharmacy.profile.operatingHours).map(
                      ([day, hours]) => (
                        <li key={day}>
                          <strong>
                            {day.charAt(0).toUpperCase() + day.slice(1)}:
                          </strong>{" "}
                          {hours.isOpen
                            ? `${hours.open} - ${hours.close}`
                            : "Closed"}
                        </li>
                      )
                    )
                  ) : (
                    <li>No operating hours available</li>
                  )}
                </ul>
                <h3 className="medicine-details__modal-subtitle">
                  Recent Reviews
                </h3>
                <ul className="medicine-details__modal-reviews">
                  {selectedPharmacy.profile?.reviews?.length > 0 ? (
                    selectedPharmacy.profile.reviews.map((review, index) => (
                      <li key={index}>
                        <strong>
                          {review.reviewer.firstName} {review.reviewer.lastName}
                        </strong>
                        : {review.rating} stars -{" "}
                        {review.comment || "No comment"}
                      </li>
                    ))
                  ) : (
                    <li>No reviews available</li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

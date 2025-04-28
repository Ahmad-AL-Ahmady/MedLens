import React, { useState, useEffect } from "react";
import "../Styles/Pharmacy.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2

export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState(""); // To store the search query
  const [medicines, setMedicines] = useState([]); // To store medicines from the API
  const [loading, setLoading] = useState(true); // To manage loading state
  const navigate = useNavigate();

  // Fetch medicines from the API
  useEffect(() => {
    // Show loading alert
    Swal.fire({
      title: "Loading Medicines...",
      text: "Please wait while we fetch the medicines for you!",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(); // Show loading spinner
      },
    });

    fetch("http://localhost:4000/api/medications")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch medicines");
        }
        return response.json();
      })
      .then((data) => {
        setMedicines(data.data.medications); // Store medicines in state
        setLoading(false); // Update loading state
        Swal.close(); // Close loading alert
        console.log("Medications data:", data);
      })
      .catch((error) => {
        console.error("Error fetching medications:", error);
        setLoading(false); // Update loading state
        Swal.fire({
          icon: "error",
          title: "Oops, something went wrong!",
          text: "We couldn't load the medicines. Please try again later.",
          confirmButtonText: "Okay",
        });
      });
  }, []);

  // Filter medicines based on search query
  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pharmacy-page">
      <h1 className="pharmacy-page__title">Search for medicines</h1>

      <div className="pharmacy-page__search-container">
        <input
          type="text"
          placeholder="Search medicine or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query
          className="pharmacy-page__search-input"
        />
      </div>

      {/* Display medicines or no results message */}
      {!loading && (
        <div className="pharmacy-page__medicine-grid">
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map((medicine) => (
              <div
                key={medicine._id} // Unique ID for each medicine
                className="pharmacy-page__medicine-card"
                onClick={() => navigate(`/medicines/${medicine._id}`)} // Navigate to medicine details
                role="button"
                tabIndex={0}
              >
                <div className="pharmacy-page__medicine-header">
                  <h2 className="pharmacy-page__medicine-name">
                    {medicine.name}
                  </h2>
                  <span className="pharmacy-page__medicine-category">
                    {medicine.strength}
                  </span>
                </div>
                <p className="pharmacy-page__medicine-description">
                  {medicine.description}
                </p>
              </div>
            ))
          ) : (
            <p>No medications found. Try searching with a different term!</p> // User-friendly message
          )}
        </div>
      )}
    </div>
  );
}

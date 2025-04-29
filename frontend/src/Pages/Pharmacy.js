import React, { useState, useEffect } from "react";
import "../Styles/Pharmacy.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState(""); // Search query for name
  const [medicines, setMedicines] = useState([]); // Store medicines
  const [loading, setLoading] = useState(true); // Loading state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12, // Changed from 10 to 12
    totalPages: 1,
    totalMedications: 0,
  }); // Pagination state
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  const navigate = useNavigate();

  // Fetch medicines from the API
  useEffect(() => {
    const fetchMedicines = async () => {
      // Show loading alert only on initial load
      if (isInitialLoad) {
        Swal.fire({
          title: "Loading Medicines...",
          text: "Please wait while we fetch the medicines for you!",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }

      try {
        // Construct query string for backend filtering and pagination
        const queryParams = new URLSearchParams({
          name: searchQuery,
          page: pagination.page,
          limit: pagination.limit,
        }).toString();

        const response = await fetch(
          `http://localhost:4000/api/medications?${queryParams}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch medicines");
        }

        const data = await response.json();
        setMedicines(data.data.medications); // Store medicines
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          totalPages: data.pagination.totalPages,
          totalMedications: data.pagination.totalMedications,
        }); // Update pagination
        setLoading(false);
        if (isInitialLoad) {
          Swal.close(); // Close loading alert only on initial load
          setIsInitialLoad(false); // Mark initial load as complete
        }
        console.log("Medications data:", data);
      } catch (error) {
        console.error("Error fetching medications:", error);
        setLoading(false);
        if (isInitialLoad) {
          Swal.close(); // Close loading alert on error during initial load
          setIsInitialLoad(false);
        }
        Swal.fire({
          icon: "error",
          title: "Oops, something went wrong!",
          text: "We couldn't load the medicines. Please try again later.",
          confirmButtonText: "Okay",
        });
      }
    };

    fetchMedicines();
  }, [searchQuery, pagination.page, pagination.limit, isInitialLoad]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="pharmacy-page">
      <h1 className="pharmacy-page__title">Search for medicines</h1>

      <div className="pharmacy-page__search-container">
        <input
          type="text"
          placeholder="Search by medicine name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on search
          }}
          className="pharmacy-page__search-input"
        />
      </div>

      {/* Display medicines or no results message */}
      {!loading && (
        <>
          <div className="pharmacy-page__medicine-grid">
            {medicines.length > 0 ? (
              medicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="pharmacy-page__medicine-card"
                  onClick={() => navigate(`/medicines/${medicine._id}`)}
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
              <p>No medications found. Try searching with a different term!</p>
            )}
          </div>

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="pharmacy-page__pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

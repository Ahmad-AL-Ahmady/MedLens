import React, { useState, useEffect } from "react";
import { CiLocationOn } from "react-icons/ci";
import { Search } from "lucide-react";
import "../Styles/Pharmacy.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import LocationPicker from "./LocationPicker";

export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    totalMedications: 0,
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [location, setLocation] = useState(null); // { type: "Point", coordinates: [longitude, latitude] }
  const [distance, setDistance] = useState("");
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedicines = async () => {
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
        setMedicines(data.data.medications);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          totalPages: data.pagination.totalPages,
          totalMedications: data.pagination.totalMedications,
        });
        setLoading(false);
        if (isInitialLoad) {
          Swal.close();
          setIsInitialLoad(false);
        }
      } catch (error) {
        console.error("Error fetching medications:", error);
        setLoading(false);
        if (isInitialLoad) {
          Swal.close();
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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = () => {
    if (!location || !distance) {
      Swal.fire({
        icon: "warning",
        title: "Location Required",
        text: "Please select a location and distance to search for nearby pharmacies.",
      });
      return;
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="pharmacy-page">
      <h1 className="pharmacy-page__title">Search for Medicines</h1>

      <div className="pharmacy-page__search-wrapper">
        <input
          type="text"
          placeholder="Search by medicine name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          className="pharmacy-page__search-input"
        />

        <select
          className="pharmacy-page__distance-select"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          aria-label="Select search distance"
        >
          <option value="">Select Distance</option>
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="20">20 km</option>
          <option value="50">50 km</option>
        </select>

        <div className="pharmacy-page__location-container">
          <button
            type="button"
            className="pharmacy-page__location-button"
            onClick={() => setShowMap(!showMap)}
          >
            <CiLocationOn className="pharmacy-page__location-icon" />
            {location ? "Location Selected" : "Select Location"}
          </button>
        </div>

        {showMap && (
          <LocationPicker
            onSelect={setLocation}
            onClose={() => setShowMap(false)}
          />
        )}

        <button className="pharmacy-page__search-button" onClick={handleSearch}>
          <Search size={16} />
        </button>
      </div>

      {!loading && (
        <>
          <div className="pharmacy-page__medicine-grid">
            {medicines.length > 0 ? (
              medicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="pharmacy-page__medicine-card"
                  onClick={() =>
                    navigate(`/medicines/${medicine._id}`, {
                      state: { location, distance },
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/medicines/${medicine._id}`, {
                        state: { location, distance },
                      });
                    }
                  }}
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
              <p className="pharmacy-page__no-results">
                No medications found. Try searching with a different term!
              </p>
            )}
          </div>

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

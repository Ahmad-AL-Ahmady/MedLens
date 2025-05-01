import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import LocationPicker from "./LocationPicker";
import {
  Stethoscope,
  HeartPulse,
  Baby,
  Microscope,
  Hospital,
  Bandage,
  Ear,
  Syringe,
  Activity,
  Search,
  StarIcon,
} from "lucide-react";
import "../Styles/Doctor.css";

export default function DoctorPage() {
  const specialtyIcons = {
    "General Practice": <Stethoscope size={18} color="#1f61a8" />,
    Cardiology: <HeartPulse size={18} color="red" />,
    Pediatrics: <Baby size={18} color="#ff9800" />,
    Radiology: <Microscope size={18} color="#03a9f4" />,
    "General Surgery": <Hospital size={18} color="#bcbcbc" />,
    Dermatology: <Bandage size={18} color="#1f61a8" />,
    ENT: <Ear size={18} color="brown" />,
    Anesthesiology: <Syringe size={18} color="#164475" />,
    "Obstetrics/Gynecology": <Activity size={18} color="red" />,
  };

  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctorCardsPerPage, setDoctorCardsPerPage] = useState(6);
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [showDistance, setShowDistance] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    totalDoctors: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        // setItemsPerPage(1);
      } else if (window.innerWidth >= 576 && window.innerWidth < 768) {
        // setItemsPerPage(2);
      } else if (window.innerWidth >= 768 && window.innerWidth < 992) {
        // setItemsPerPage(3);
      } else if (window.innerWidth >= 992 && window.innerWidth < 1200) {
        // setItemsPerPage(4);
      } else {
        // setItemsPerPage(8);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleDoctorResize = () => {
      if (window.innerWidth < 576) {
        setDoctorCardsPerPage(1);
      } else if (window.innerWidth >= 576 && window.innerWidth < 768) {
        setDoctorCardsPerPage(2);
      } else if (window.innerWidth >= 768 && window.innerWidth < 992) {
        setDoctorCardsPerPage(3);
      } else if (window.innerWidth >= 992 && window.innerWidth < 1200) {
        setDoctorCardsPerPage(4);
      } else {
        setDoctorCardsPerPage(6);
      }
    };

    handleDoctorResize();
    window.addEventListener("resize", handleDoctorResize);

    return () => window.removeEventListener("resize", handleDoctorResize);
  }, []);

  const handleSpecializationClick = (specialty) => {
    if (selectedSpecialization === specialty) {
      setSelectedSpecialization("");
      setPagination((prev) => ({ ...prev, page: 1 }));
    } else {
      setSelectedSpecialization(specialty);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  // ✅ Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        let url = "http://localhost:4000/api/doctors/all";
        const queryParams = new URLSearchParams({
          page: pagination.page,
          limit: pagination.limit,
        });

        // Only add specialization if it's not empty
        if (selectedSpecialization) {
          queryParams.append("specialization", selectedSpecialization);
        }

        // Only add name if it's not empty
        if (searchName) {
          queryParams.append("name", searchName);
        }

        const response = await fetch(`${url}?${queryParams.toString()}`);
        const data = await response.json();

        if (data.data && data.data.doctors) {
          setDoctors(data.data.doctors);
          setPagination({
            page: data.pagination.page,
            limit: data.pagination.limit,
            totalPages: data.pagination.totalPages,
            totalDoctors: data.pagination.totalDoctors,
          });
        } else {
          setDoctors([]);
          setPagination((prev) => ({ ...prev, totalPages: 1 }));
        }
      } catch (error) {
        console.error("Error loading doctors:", error);
        setError("Failed to fetch doctors");
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, [selectedSpecialization, searchName, pagination.page, pagination.limit]);

  // ✅ Show specializations list
  useEffect(() => {
    fetch("http://localhost:4000/api/doctors/specializations")
      .then((res) => res.json())
      .then((data) => setSpecializations(data.data.specializations))
      .catch((error) => console.error("Error loading specializations:", error));
  }, []);

  // ✅ Search doctors based on location, distance, and specialization
  const handleSearch = async () => {
    let url = "http://localhost:4000/api/doctors/all";

    let latitude, longitude;
    if (location && location.coordinates?.length === 2) {
      latitude = location.coordinates[1];
      longitude = location.coordinates[0];
    }

    if (latitude && longitude) {
      url = `http://localhost:4000/api/doctors/nearby?latitude=${latitude}&longitude=${longitude}&distance=${distance}&specialization=${selectedSpecialization}`;
    } else if (searchName) {
      url = `http://localhost:4000/api/doctors/all?name=${searchName}&specialization=${selectedSpecialization}`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      let doctorsList = data.data.doctors || [];

      if (searchName) {
        const searchLower = searchName.toLowerCase().trim();
        const filteredDoctors = doctorsList.filter((doctor) => {
          const firstName = doctor.firstName.toLowerCase();
          const lastName = doctor.lastName.toLowerCase();
          const fullName = `${firstName} ${lastName}`;

          return (
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            fullName.includes(searchLower)
          );
        });

        setDoctors(filteredDoctors);
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(filteredDoctors.length / prev.limit),
        }));
      } else if (location?.latitude && location?.longitude) {
        setDoctors(doctorsList.sort((a, b) => a.distance - b.distance));
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(doctorsList.length / prev.limit),
        }));
      } else {
        setDoctors(doctorsList);
        setPagination((prev) => ({
          ...prev,
          totalPages: Math.ceil(doctorsList.length / prev.limit),
        }));
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setError("Failed to fetch doctors");
      setDoctors([]);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="doctorpage-container">
      {/* ✅ Specialization bar */}
      <div className="specialty-container">
        {specializations.map((specialty) => {
          const isActive = selectedSpecialization === specialty.name;
          const icon = specialtyIcons[specialty.name]
            ? React.cloneElement(specialtyIcons[specialty.name], {
                color: isActive
                  ? "white"
                  : specialtyIcons[specialty.name].props.color,
              })
            : null;

          return (
            <button
              key={specialty.name}
              className={`specialty-btn ${isActive ? "active" : ""}`}
              onClick={() => handleSpecializationClick(specialty.name)}
            >
              {icon}
              {specialty.name}
            </button>
          );
        })}
        {/* Add Clear Filter button if a specialization is selected */}
        {selectedSpecialization && (
          <button
            className="specialty-btn clear-filter-btn"
            onClick={() => handleSpecializationClick(selectedSpecialization)}
            style={{
              marginLeft: 12,
              background: "#f8d7da",
              color: "#a71d2a",
              border: "1.5px solid #f5c2c7",
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* ✅ Search bar */}
      <div className="search-bar-card">
        <input
          type="text"
          placeholder="Search name"
          className="search-input"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        <select
          className="distance-select"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        >
          <option value="">Select Distance</option>
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="20">20 km</option>
          <option value="50">50 km</option>
        </select>

        <div className="signup-location-container">
          <button
            type="button"
            className="signup-location-button"
            onClick={() => setShowMap(!showMap)}
          >
            <CiLocationOn className="signup-location-icon" />
            {location ? "Location Selected" : "Select Location"}
          </button>
        </div>
        {showMap && (
          <LocationPicker
            onSelect={setLocation}
            onClose={() => setShowMap(false)}
          />
        )}

        <button className="search-button" onClick={handleSearch}>
          <Search size={16} />
        </button>
      </div>

      {/* ✅ Doctors List */}
      <div className="doctors-section">
        <div className="header">
          <h2 className="Recommended-title">Recommended Doctors</h2>
          <button onClick={() => setShowAll(!showAll)} className="view-all-btn">
            {showAll ? "Show Less" : "View All"}
            {showAll ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        <div className="doctors-container">
          {error ? (
            <p className="error-message">{error}</p>
          ) : doctors.length > 0 ? (
            doctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-info">
                  <img
                    src={
                      doctor.avatar
                        ? `http://localhost:4000/public/uploads/users/${doctor.avatar}`
                        : "http://localhost:4000/public/uploads/users/default.jpg"
                    }
                    alt={doctor.name}
                    className="doctor-img"
                  />
                  <div className="doctor-details">
                    <h3 className="doctor-name">
                      {doctor.firstName} {doctor.lastName}
                    </h3>
                    <span className="specialty-badge">
                      {doctor.specialization}
                    </span>
                    <p className="rating">
                      <StarIcon size={16} /> {doctor.averageRating} (
                      {doctor.totalReviews} reviews)
                    </p>
                  </div>
                </div>
                <button
                  className="profile-btn"
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                >
                  Profile
                </button>
              </div>
            ))
          ) : (
            <p className="no-doctors">No doctors available</p>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <div className="pagination">
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
      </div>
    </div>
  );
}

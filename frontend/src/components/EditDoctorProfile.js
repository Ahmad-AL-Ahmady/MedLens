import React, { useState } from "react";
import { User, MapPin } from "lucide-react";
import LocationPicker from "../Pages/LocationPicker";
import Swal from "sweetalert2";

const EditDoctorProfile = ({
  doctor,
  formData,
  setFormData,
  setShowEditForm,
  fetchDoctorProfile,
}) => {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({ ...formData, avatar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLocationSelect = async (location) => {
    try {
      const lat = location.coordinates[1];
      const lng = location.coordinates[0];

      // Reverse geocoding using OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();

      setFormData({
        ...formData,
        location: {
          ...location,
          formattedAddress: data.display_name,
        },
      });
    } catch (error) {
      console.error("Error getting location details:", error);
      // Fallback to coordinates if geocoding fails
      setFormData({
        ...formData,
        location,
      });
    }
  };

  const editHandleSubmit = async (e) => {
    e.preventDefault();
    const doctorId = doctor.id;

    // Loading state
    Swal.fire({
      title: "Updating profile...",
      text: "Please wait while we update your profile",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const profileRes = await fetch(
        "http://localhost:4000/api/doctors/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            fees: formData.fees,
            experienceYears: formData.experienceYears,
            location: formData.location,
          }),
        }
      );

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        Swal.fire({
          icon: "error",
          title: "Profile Update Failed",
          text: profileData.message || "Failed to update profile",
          confirmButtonColor: "#3b82f6",
        });
        return;
      }

      try {
        const availabilityRes = await fetch(
          `http://localhost:4000/api/doctors/${doctorId}/availability`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              availability: formData.availability,
            }),
          }
        );

        const availabilityData = await availabilityRes.json();
        if (!availabilityRes.ok) {
          console.error(
            "Availability update failed:",
            availabilityData.message
          );
          Swal.fire({
            icon: "warning",
            title: "Partial Update",
            text:
              "Profile updated but availability settings could not be saved. " +
              (availabilityData.message || "Please try again later."),
            confirmButtonColor: "#3b82f6",
          });
        } else {
          // Both updates successful
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Profile updated successfully",
            confirmButtonColor: "#3b82f6",
          });
        }
      } catch (availabilityError) {
        console.error("Error updating availability:", availabilityError);
        Swal.fire({
          icon: "warning",
          title: "Partial Update",
          text: "Profile updated but availability settings could not be saved due to an error.",
          confirmButtonColor: "#3b82f6",
        });
      }

      await fetchDoctorProfile();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while updating your profile",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  // Get initial position for location picker if available
  const getInitialPosition = () => {
    if (
      doctor.location?.coordinates &&
      doctor.location.coordinates.length === 2
    ) {
      // GeoJSON format is [longitude, latitude], but Leaflet uses [latitude, longitude]
      return [doctor.location.coordinates[1], doctor.location.coordinates[0]];
    }
    return [30.0444, 31.2357]; // Default position (Cairo)
  };

  return (
    <div className="edit-doctor-profile-form-overlay">
      <form onSubmit={editHandleSubmit} className="edit-doctor-profile-form">
        <button
          type="button"
          className="close-form-btn"
          onClick={() => setShowEditForm(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2>Update Your Profile</h2>

        <div className="form-section">
          <div className="form-section-title">
            <User size={18} />
            Personal Information
          </div>
          <div className="form-row">
            <div className="doctor-form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
              />
            </div>
            <div className="doctor-form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <MapPin size={18} />
            Location Information
          </div>
          <div className="form-row location-picker-centered">
            <div className="doctor-form-group full-width">
              <label>Location</label>
              <div className="location-picker-button">
                <button
                  type="button"
                  className="select-location-btn"
                  onClick={() => setShowLocationPicker(true)}
                >
                  <MapPin size={16} />
                  {formData.location
                    ? "Change Location"
                    : "Select Location on Map"}
                </button>
                {formData.location && (
                  <span className="location-selected">
                    {formData.location.formattedAddress ||
                      `Location selected: ${formData.location.coordinates[1].toFixed(
                        4
                      )}, ${formData.location.coordinates[0].toFixed(4)}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Professional Details
          </div>
          <div className="form-row">
            <div className="doctor-form-group">
              <label>Consultation Fees</label>
              <input
                type="number"
                name="fees"
                value={formData.fees}
                onChange={handleChange}
                placeholder="Enter your fees"
              />
            </div>
            <div className="doctor-form-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                placeholder="Years of experience"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Working Hours
          </div>
          <div className="doctor-operating-hours-edit">
            {Object.entries(formData.availability).map(([day, info]) => (
              <div key={day} className="doctor-operating-hours-item">
                <label className="doctor-operating-hours-label">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={info.isAvailable}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availability: {
                        ...formData.availability,
                        [day]: {
                          ...formData.availability[day],
                          isAvailable: e.target.checked,
                        },
                      },
                    })
                  }
                />
                {info.isAvailable && (
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={info.start}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availability: {
                            ...formData.availability,
                            [day]: {
                              ...formData.availability[day],
                              start: e.target.value,
                            },
                          },
                        })
                      }
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={info.end}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          availability: {
                            ...formData.availability,
                            [day]: {
                              ...formData.availability[day],
                              end: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-btns">
          <button
            type="button"
            onClick={() => setShowEditForm(false)}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </div>
      </form>

      {showLocationPicker && (
        <LocationPicker
          onSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
          initialPosition={getInitialPosition()}
        />
      )}
    </div>
  );
};

export default EditDoctorProfile;

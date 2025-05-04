import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Mail,
  Phone,
  ThumbsUp,
  Star,
  Calendar,
  Edit,
  Trash2,
  MapPin,
  User,
  ScanBarcode,
  Stethoscope,
  ClipboardList,
  Pill,
} from "lucide-react";
import Swal from "sweetalert2";
import "../Styles/PharmacyProfile.css";
import LocationPicker from "../Pages/LocationPicker";

const PharmacyProfile = () => {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scans, setScans] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    avatar: "",
    location: null,
  });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isViewingOwnProfile, setIsViewingOwnProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const fetchPharmacyProfile = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        text: "Fetching pharmacy profile",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const apiUrl = id
        ? `http://localhost:4000/api/pharmacies/${id}`
        : "http://localhost:4000/api/pharmacies/profile";

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pharmacy profile");
      }

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setPharmacy(data.data);
        setProfile(data.data.profile);
        setFormData({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          phoneNumber: data.data.profile?.phoneNumber || "",
          avatar: data.data.avatar || null,
          location: data.data.location || null,
        });
        Swal.close();
      } else {
        throw new Error("Failed to fetch pharmacy data");
      }
    } catch (error) {
      console.error("Error fetching pharmacy profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error fetching pharmacy profile",
        confirmButtonColor: "#3b82f6",
      });
      setError(error.message || "Error fetching pharmacy profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchScans = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/medical-scans", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.status === "success" && data.data?.scans) {
        setScans(data.data.scans);
      } else {
        setScans([]);
      }
    } catch (error) {
      console.error("Error fetching scans:", error);
      throw error;
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/pharmacies/inventory",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.status === "success" && data.data?.inventory) {
        setInventory(data.data.inventory);
      } else {
        setInventory([]);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      throw error;
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No token found");
      setError("No token found");
      setLoading(false);
      return;
    }

    // Get current user ID from token
    const tokenPayload = JSON.parse(atob(token.split(".")[1]));
    setCurrentUserId(tokenPayload.id);

    // Check if viewing own profile
    if (!id) {
      setIsViewingOwnProfile(true);
    } else {
      setIsViewingOwnProfile(id === tokenPayload.id);
    }

    const fetchData = async () => {
      try {
        await Promise.all([
          fetchPharmacyProfile(),
          fetchScans(),
          fetchInventory(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({ ...formData, avatar: files[0] });
    } else if (name === "phoneNumber") {
      // Remove any non-digit characters except the initial +20
      const cleanedValue = value.replace(/[^\d]/g, "");
      // Ensure the phone number starts with +20 and limit to 10 digits after that
      const formattedValue =
        cleanedValue.length > 0 ? cleanedValue.slice(0, 10) : "";
      setFormData({ ...formData, phoneNumber: formattedValue });
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

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);

      try {
        Swal.fire({
          title: "Uploading...",
          text: "Please wait while we upload your avatar",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await fetch(
          "http://localhost:4000/api/users/updateAvatar",
          {
            method: "PATCH",
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Avatar updated successfully!",
            confirmButtonColor: "#3b82f6",
          }).then(() => {
            // Refresh the page after successful upload
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to update avatar",
            confirmButtonColor: "#3b82f6",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while updating avatar",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleDeleteAvatar = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete your avatar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Deleting...",
            text: "Please wait while we delete your avatar",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const response = await fetch(
            "http://localhost:4000/api/users/deleteAvatar",
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            Swal.fire({
              icon: "success",
              title: "Success!",
              text: "Avatar deleted successfully!",
              confirmButtonColor: "#3b82f6",
            }).then(() => {
              // Refresh the page after successful deletion
              window.location.reload();
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to delete avatar",
              confirmButtonColor: "#3b82f6",
            });
          }
        } catch (error) {
          console.error("Error while deleting avatar:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "An error occurred while deleting avatar",
            confirmButtonColor: "#3b82f6",
          });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number length
    if (formData.phoneNumber && formData.phoneNumber.length !== 10) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Phone number must be exactly 10 digits after the +20 prefix",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

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
      const response = await fetch(
        "http://localhost:4000/api/pharmacies/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber
              ? `+20${formData.phoneNumber}`
              : "",
            location: formData.location,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile updated successfully",
          confirmButtonColor: "#3b82f6",
        });
        await fetchPharmacyProfile();
        setShowEditForm(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message || "Failed to update profile",
          confirmButtonColor: "#3b82f6",
        });
      }
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:4000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reviewedEntityId: id,
          entityType: "Pharmacy",
          rating,
          comment,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        throw new Error("Can't add multiple reviews for the same entity.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Your review has been submitted successfully!",
        confirmButtonColor: "#3b82f6",
      });

      setShowReviewForm(false);
      setComment("");
      setRating(5);

      // Fetch updated pharmacy profile to get new stats and reviews
      await fetchPharmacyProfile();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Review Submission Failed",
        text:
          error.message === "You have already reviewed this pharmacy"
            ? "You have already submitted a review for this pharmacy. You can edit or delete your existing review."
            : error.message ||
              "Something went wrong while submitting your review. Please try again.",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete this review?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(
            `http://localhost:4000/api/reviews/${reviewId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Something went wrong");
          }

          // Update the profile state to remove the deleted review
          setProfile((prev) => ({
            ...prev,
            reviews: prev.reviews.filter((review) => review._id !== reviewId),
          }));

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Your review has been deleted successfully.",
            confirmButtonColor: "#3b82f6",
          });

          // Fetch updated pharmacy profile to get new stats
          await fetchPharmacyProfile();
        } catch (error) {
          console.error("Error deleting review:", error.message);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete review. Please try again.",
            confirmButtonColor: "#3b82f6",
          });
        }
      }
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "New password and confirm password do not match",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:4000/api/users/updatePassword",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passwordCurrent: passwordData.currentPassword,
            password: passwordData.newPassword,
            passwordConfirm: passwordData.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Password updated successfully",
          confirmButtonColor: "#3b82f6",
        }).then(() => {
          // Clear tokens from storage
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          // Redirect to login page
          window.location.href = "/login";
        });
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to update password",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while updating your password",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  // Get initial position for location picker if available
  const getInitialPosition = () => {
    if (
      pharmacy?.location?.coordinates &&
      pharmacy.location.coordinates.length === 2
    ) {
      // GeoJSON format is [longitude, latitude], but Leaflet uses [latitude, longitude]
      return [
        pharmacy.location.coordinates[1],
        pharmacy.location.coordinates[0],
      ];
    }
    return [30.0444, 31.2357]; // Default position (Cairo)
  };

  const handleDeleteScan = async (scanId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this scan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/medical-scans/${scanId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete scan");
        }

        // Update scans list
        const updatedScans = scans.filter((scan) => scan._id !== scanId);
        setScans(updatedScans);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The scan has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Something went wrong while deleting the scan. Please try again.",
        });
      }
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!pharmacy) return null;

  return (
    <div className="doctor-profile-container">
      {showEditForm ? (
        <div className="edit-doctor-profile-form-overlay">
          <form onSubmit={handleSubmit} className="edit-doctor-profile-form">
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
              <div className="form-row">
                <div className="doctor-form-group">
                  <label>Phone Number</label>
                  <div className="phone-input-container">
                    <span className="country-code">+20</span>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      maxLength="10"
                    />
                  </div>
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
      ) : (
        <>
          {/* Pharmacy info */}
          <div className="doctor-profile-header">
            <div className="doctor-header-top">
              <div className="profile-image-container">
                <img
                  src={
                    selectedImage || pharmacy.avatar
                      ? `http://localhost:4000/public/uploads/users/${
                          selectedImage || pharmacy.avatar
                        }`
                      : "http://localhost:4000/public/uploads/users/default.jpg"
                  }
                  alt="Pharmacy"
                  className="doctor-profile-image"
                />
                {isViewingOwnProfile && (
                  <div className="camera-menu">
                    <button onClick={toggleMenu} className="camera-icon">
                      <img
                        src="https://img.icons8.com/ios-filled/50/000000/camera.png"
                        alt="Edit"
                      />
                    </button>

                    {menuOpen && (
                      <>
                        <div className="overlay" onClick={toggleMenu}></div>
                        <div className="camera-options">
                          <button
                            onClick={() =>
                              document.getElementById("upload-photo").click()
                            }
                          >
                            Upload
                          </button>
                          <button onClick={handleDeleteAvatar}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <input
                  type="file"
                  id="upload-photo"
                  accept="image/*"
                  capture="user"
                  style={{ display: "none" }}
                  onChange={(e) => handlePhotoChange(e)}
                />
              </div>
              <div className="doctor-profile-info">
                <h1 className="doctor-profile-name">
                  {pharmacy.firstName} {pharmacy.lastName}
                </h1>
                <p className="doctor-profile-usertype">Pharmacy</p>
                <div className="doctor-profile-details">
                  <p className="doctor-profile-email">
                    <Mail size={16} color="#1e56cf" /> {pharmacy.email}
                  </p>
                  <p className="doctor-profile-email">
                    <Phone size={16} color="#1e56cf" />
                    {profile?.phoneNumber ? (
                      <>{profile.phoneNumber}</>
                    ) : (
                      "No phone number"
                    )}
                  </p>
                </div>
              </div>
              {isViewingOwnProfile ? (
                <div className="profile-action-buttons">
                  <button
                    className="edit-doctor-profile-button"
                    onClick={() => setShowEditForm(true)}
                  >
                    <Edit size={15} color="white" /> Edit Profile
                  </button>
                  <button
                    className="update-password-button"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Update Password
                  </button>
                </div>
              ) : null}
            </div>

            {/* Replace the stats cards section */}
            <div className="patient-profile-summary-cards">
              <div className="patient-profile-card">
                <Pill size={16} color="#1f61a8" />
                <h3>{inventory.length}</h3>
                <p>Medications</p>
              </div>
              <div className="patient-profile-card">
                <Calendar size={16} color="#1f61a8" />
                <h3>
                  {profile?.createdAt
                    ? (() => {
                        const now = new Date();
                        const createdDate = new Date(profile.createdAt);
                        const years =
                          now.getFullYear() - createdDate.getFullYear();
                        const months = now.getMonth() - createdDate.getMonth();

                        if (years > 0) {
                          return years === 1 ? "1 year" : `${years} years`;
                        } else if (months > 0) {
                          return months === 1 ? "1 month" : `${months} months`;
                        } else {
                          return "< 1 month";
                        }
                      })()
                    : "N/A"}
                </h3>
                <p>Pharmacy Since</p>
              </div>
              <div className="patient-profile-card">
                <ClipboardList size={16} color="#1f61a8" />
                <h3>{scans.length}</h3>
                <p>Reports</p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="doctor-profile-map">
            <iframe
              title="Pharmacy Location"
              src={`https://www.google.com/maps?q=${pharmacy.location?.coordinates?.[1]},${pharmacy.location?.coordinates?.[0]}&output=embed`}
              width="100%"
              height="300"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          {/* Reviews Section */}
          <div className="patient-profile-scan-section">
            <h2>
              <ScanBarcode size={20} color="#1e40af" />
              Scans
            </h2>
            <table className="patient-profile-data-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Body Part</th>
                  <th>Confidence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.length > 0 ? (
                  scans.map((scan) => (
                    <tr key={scan._id}>
                      <td>
                        {scan.images && scan.images.length > 0 ? (
                          <img
                            src={`http://localhost:4000${scan.images[0]}`}
                            alt="Scan preview"
                            className="scan-preview-image"
                          />
                        ) : (
                          "No image"
                        )}
                      </td>
                      <td>
                        {scan.scanDate
                          ? new Date(scan.scanDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        {scan.aiAnalysis?.classification_result ||
                          (scan.description &&
                          scan.description.includes("AI Analysis:")
                            ? scan.description
                                .replace("AI Analysis:", "")
                                .trim()
                            : "N/A")}
                      </td>
                      <td>{scan.bodyPart || "N/A"}</td>
                      <td className="confidence-cell">
                        {scan.aiAnalysis &&
                        typeof scan.aiAnalysis.confidence_score === "number" ? (
                          <span
                            className={`confidence-value ${
                              scan.aiAnalysis.confidence_score >= 90
                                ? "high-confidence"
                                : scan.aiAnalysis.confidence_score >= 70
                                ? "medium-confidence"
                                : "low-confidence"
                            }`}
                          >
                            {scan.aiAnalysis.confidence_score}%
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        <button
                          className="delete-appointment-button"
                          onClick={() => handleDeleteScan(scan._id)}
                          title="Delete Scan"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No scans found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showPasswordForm && (
            <div className="edit-doctor-profile-form-overlay">
              <form
                onSubmit={handlePasswordSubmit}
                className="edit-doctor-profile-form"
              >
                <button
                  type="button"
                  className="close-form-btn"
                  onClick={() => setShowPasswordForm(false)}
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

                <h2>Update Password</h2>

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
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Password Details
                  </div>
                  <div className="form-row">
                    <div className="doctor-form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="doctor-form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="doctor-form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-btns">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PharmacyProfile;

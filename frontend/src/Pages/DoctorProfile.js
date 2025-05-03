import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaRegCalendarAlt } from "react-icons/fa";
import {
  Mail,
  Clock,
  ThumbsUp,
  Star,
  DollarSign,
  BadgeCheck,
  Edit,
  Trash2,
  MapPin,
  User,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import "../Styles/DoctorProfile.css";
import LocationPicker from "../Pages/LocationPicker";

const DoctorProfile = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availabilityError, setAvailabilityError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    city: "",
    state: "",
    country: "",
    fees: "",
    experienceYears: 0,
    avatar: "",
    location: null,
    availability: {
      monday: { isAvailable: false, start: "", end: "" },
      tuesday: { isAvailable: false, start: "", end: "" },
      wednesday: { isAvailable: false, start: "", end: "" },
      thursday: { isAvailable: false, start: "", end: "" },
      friday: { isAvailable: false, start: "", end: "" },
      saturday: { isAvailable: false, start: "", end: "" },
      sunday: { isAvailable: false, start: "", end: "" },
    },
  });
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const [isViewingOwnProfile, setIsViewingOwnProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchDoctorProfile = async () => {
    try {
      Swal.fire({
        title: "Loading...",
        text: "Fetching doctor profile",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const apiUrl = id
        ? `http://localhost:4000/api/doctors/${id}`
        : "http://localhost:4000/api/doctors/profile";

      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch doctor profile");

      const data = await response.json();
      console.log("Response Data:", data);
      if (data.status === "success" && data.data) {
        const defaultWorkingHours = {
          monday: { isAvailable: false, start: "", end: "" },
          tuesday: { isAvailable: false, start: "", end: "" },
          wednesday: { isAvailable: false, start: "", end: "" },
          thursday: { isAvailable: false, start: "", end: "" },
          friday: { isAvailable: false, start: "", end: "" },
          saturday: { isAvailable: false, start: "", end: "" },
          sunday: { isAvailable: false, start: "", end: "" },
        };

        const rawWorkingHours =
          typeof data.data.profile?.availability === "object" &&
          data.data.profile?.availability !== null
            ? data.data.profile?.availability
            : {};

        const formattedWorkingHours = {};

        Object.entries(defaultWorkingHours).forEach(([day, defaults]) => {
          const lowerDay = day.toLowerCase();
          const backendDay = rawWorkingHours[lowerDay] || {};

          formattedWorkingHours[day] = {
            isAvailable: backendDay.isAvailable || false,
            start:
              backendDay.start && backendDay.isAvailable
                ? backendDay.start
                : "",
            end: backendDay.end && backendDay.isAvailable ? backendDay.end : "",
          };
        });

        setDoctor(data.data);
        setProfile(data.data.profile);
        setFormData({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          city: data.data.profile?.city || "",
          state: data.data.profile?.state || "",
          country: data.data.profile?.country || "",
          fees: data.data.profile?.fees || "",
          experienceYears: data.data.profile?.experienceYears || "",
          avatar: data.data.avatar || null,
          location: data.data.location || null,
          ...formData,
          availability: data.data.profile?.availability,
        });
        Swal.close();
      } else {
        throw new Error("Failed to fetch doctor data");
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Error fetching doctor profile",
        confirmButtonColor: "#3b82f6",
      });
      setError(error.message || "Error fetching doctor profile");
    } finally {
      setLoading(false);
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

    fetchDoctorProfile();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    try {
      const response = await fetch(
        "http://localhost:4000/api/appointments/book",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctorId: id,
            date,
            startTime,
            endTime,
            reason,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Appointment booked successfully!",
          confirmButtonColor: "#3b82f6",
        });
        setShowModal(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Booking Failed",
          text: `Failed to book appointment. Reason: ${
            data.message || "Unknown error"
          }`,
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to book appointment. Error occurred in the request.",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({ ...formData, avatar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
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
    // THIS IS THE FIXED LINE:
    const doctorId = doctor.id; // Use the doctor user ID, not the profile ID

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
          entityType: "Doctor",
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

      // Fetch updated doctor profile to get new stats and reviews
      await fetchDoctorProfile();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Review Submission Failed",
        text:
          error.message === "You have already reviewed this doctor"
            ? "You have already submitted a review for this doctor. You can edit or delete your existing review."
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

          // Fetch updated doctor profile to get new stats
          await fetchDoctorProfile();
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

  const handleCheckAvailability = () => {
    setShowAvailabilityModal(true);
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
    setAvailabilityError(null);
  };

  const handleCloseAvailabilityModal = () => {
    setShowAvailabilityModal(false);
    setSelectedDate("");
    setAvailableSlots([]);
    setSelectedSlot(null);
    setAvailabilityError(null);
  };

  const handleModalOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseAvailabilityModal();
    }
  };

  const handleDateSelect = async (e) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate);
    setLoadingSlots(true);
    setAvailabilityError(null);

    try {
      const response = await fetch(
        `http://localhost:4000/api/appointments/available-slots/${id}/${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        if (!data.data.available) {
          setAvailabilityError(data.data.message);
          setAvailableSlots([]);
        } else {
          setAvailableSlots(data.data.timeSlots);
        }
      } else {
        setAvailabilityError(
          "Failed to fetch available slots. Please try again."
        );
      }
    } catch (error) {
      setAvailabilityError("An error occurred while fetching available slots.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setDate(selectedDate);
  };

  const handleBookSelectedSlot = () => {
    setShowAvailabilityModal(false);
    setShowModal(true);
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!doctor) return null;

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
    <div className="doctor-profile-container">
      {showEditForm ? (
        <div className="edit-doctor-profile-form-overlay">
          <form
            onSubmit={editHandleSubmit}
            className="edit-doctor-profile-form"
          >
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
      ) : (
        <>
          {/* Doctor info */}
          <div className="doctor-profile-header">
            <div className="doctor-header-top">
              <div className="profile-image-container">
                <img
                  src={
                    selectedImage || doctor.avatar
                      ? `http://localhost:4000/public/uploads/users/${
                          selectedImage || doctor.avatar
                        }`
                      : "http://localhost:4000/public/uploads/users/default.jpg"
                  }
                  alt="Doctor"
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
                  {doctor.firstName} {doctor.lastName}
                </h1>
                <p className="doctor-profile-usertype">
                  {doctor.specialization}
                </p>
                <div className="doctor-profile-details">
                  <p className="doctor-profile-email">
                    <Mail size={16} color="#1e56cf" /> {doctor.email}
                  </p>
                  <p
                    className="working-hours-text"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8px",
                    }}
                  >
                    <Clock size={16} color="#1e56cf" /> Working Hours
                  </p>

                  {isModalOpen && (
                    <>
                      <div
                        className="modal-overlay"
                        onClick={() => setIsModalOpen(false)}
                      ></div>
                      <div className="modal-content">
                        <span
                          className="close-btn"
                          onClick={() => setIsModalOpen(false)}
                        >
                          &times;
                        </span>
                        <h2 className="modal-content-header">Working Hours</h2>
                        <div className="operating-hours-grid">
                          {profile?.availability ? (
                            Object.entries(profile.availability).map(
                              ([day, info]) => (
                                <div key={day} className="operating-hours-item">
                                  <span className="day">
                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                    :
                                  </span>
                                  <span
                                    className={`status ${
                                      info.isAvailable ? "open" : "closed"
                                    }`}
                                  >
                                    {info.isAvailable ? (
                                      <span
                                        style={{ color: "#374151" }}
                                      >{`${info.start} - ${info.end}`}</span>
                                    ) : (
                                      "Closed"
                                    )}
                                  </span>
                                </div>
                              )
                            )
                          ) : (
                            <p>No working hours available</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {showModal && (
                    <div className="edit-doctor-profile-form-overlay">
                      <div className="edit-doctor-profile-form">
                        <button
                          type="button"
                          className="close-form-btn"
                          onClick={() => setShowModal(false)}
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

                        <h2>Book Appointment</h2>

                        <form onSubmit={handleSubmit}>
                          <div className="form-section">
                            <div className="form-section-title">
                              <Calendar size={18} />
                              Appointment Details
                            </div>
                            <div className="form-row">
                              <div className="doctor-form-group">
                                <label>Selected Date</label>
                                <input
                                  type="date"
                                  value={date}
                                  readOnly
                                  disabled
                                  className="readonly-input"
                                />
                              </div>
                            </div>

                            <div className="form-row">
                              <div className="doctor-form-group">
                                <label>Start Time</label>
                                <input
                                  type="time"
                                  value={startTime}
                                  readOnly
                                  disabled
                                  className="readonly-input"
                                />
                              </div>
                              <div className="doctor-form-group">
                                <label>End Time</label>
                                <input
                                  type="time"
                                  value={endTime}
                                  readOnly
                                  disabled
                                  className="readonly-input"
                                />
                              </div>
                            </div>

                            <div className="form-row">
                              <div className="doctor-form-group full-width">
                                <label>Reason for Visit</label>
                                <textarea
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                  placeholder="Please describe your reason for visit"
                                  rows="4"
                                  required
                                ></textarea>
                              </div>
                            </div>
                          </div>

                          <div className="form-btns">
                            <button
                              type="button"
                              onClick={() => setShowModal(false)}
                              className="cancel-btn"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="save-btn">
                              Book Appointment
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
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
              ) : (
                <div className="profile-action-buttons">
                  <button
                    className="check-availability-button"
                    onClick={handleCheckAvailability}
                  >
                    <Calendar size={15} color="white" /> Check Availability
                  </button>
                </div>
              )}
            </div>

            {/* stats card */}
            <div className="doctor-profile-stats">
              <div className="doctor-profile-card">
                <DollarSign size={16} color="#1f61a8" />
                <span>{profile?.fees ?? 0}</span>
                <p>Fees</p>
              </div>
              <div className="doctor-profile-card">
                <BadgeCheck size={16} color="#1f61a8" />
                <span>{profile?.experienceYears ?? 0} Years</span>
                <p>Years of Practice</p>
              </div>
              <div className="doctor-profile-card">
                <ThumbsUp size={16} color="#1f61a8" />
                <span>{profile?.totalReviews ?? 0}+</span>
                <p>Reviews</p>
              </div>
              <div className="doctor-profile-card">
                <Star size={16} color="#1f61a8" />
                <span>{profile?.averageRating ?? "N/A"}</span>
                <p>Rating</p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="doctor-profile-map">
            <iframe
              title="Doctor Location"
              src={`https://www.google.com/maps?q=${doctor.location?.coordinates?.[1]},${doctor.location?.coordinates?.[0]}&output=embed`}
              width="100%"
              height="300"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          {/* Reviews Section */}
          <div className="doctor-profile-reviews">
            <div className="doctor-profile-review-header">
              <h2>Patient Reviews</h2>
              {!isViewingOwnProfile && (
                <button
                  className="add-review-button"
                  onClick={() => setShowReviewForm(true)}
                >
                  Add Review
                </button>
              )}
            </div>
            {showReviewForm && (
              <div className="edit-doctor-profile-form-overlay">
                <div className="edit-doctor-profile-form">
                  <button
                    type="button"
                    className="close-form-btn"
                    onClick={() => setShowReviewForm(false)}
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

                  <h2>Add Your Review</h2>

                  <form onSubmit={handleReviewSubmit}>
                    <div className="form-section">
                      <div className="form-section-title">
                        <Star size={18} />
                        Review Details
                      </div>

                      <div className="form-row">
                        <div className="doctor-form-group full-width">
                          <label>Your Review</label>
                          <textarea
                            placeholder="Write your review..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows="4"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="doctor-form-group">
                          <label>Rating</label>
                          <div className="rating-input-container">
                            <input
                              type="number"
                              value={rating}
                              onChange={(e) =>
                                setRating(Number.parseFloat(e.target.value))
                              }
                              step="0.1"
                              min="1"
                              max="5"
                              required
                            />
                            <span className="rating-star">⭐️</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-btns">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="cancel-btn"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="save-btn">
                        Submit Review
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {profile?.reviews?.length > 0 ? (
              profile.reviews.map((review) => (
                <div key={review._id} className="doctor-profile-review">
                  <div className="review-header">
                    <img
                      src={`http://localhost:4000/public/uploads/users/${review.reviewer?.avatar}`}
                      alt="Reviewer Avatar"
                      className="review-avatar"
                    />
                    <div className="reviewer-section">
                      <div className="reviewer-info">
                        <strong>
                          {review.reviewer
                            ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                            : "Anonymous"}
                        </strong>
                        <span className="doctor-profile-rating">
                          (⭐️ {review.rating})
                        </span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                    {review.reviewer?._id === currentUserId && (
                      <button
                        className="delete-review-button"
                        onClick={() => handleDeleteReview(review._id)}
                        title="Delete Review"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
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

          {/* Availability Modal */}
          {showAvailabilityModal && (
            <div className="modal-overlay" onClick={handleModalOverlayClick}>
              <div className="availability-modal">
                <button
                  className="close-modal-btn"
                  onClick={handleCloseAvailabilityModal}
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

                <h2>Check Availability</h2>

                <div className="availability-form">
                  <div className="form-group">
                    <label>Select Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateSelect}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  {loadingSlots && (
                    <div className="loading-slots">
                      <div className="spinner"></div>
                      <p>Loading available slots...</p>
                    </div>
                  )}

                  {availabilityError && (
                    <div className="availability-error">
                      <p>{availabilityError}</p>
                    </div>
                  )}

                  {availableSlots.length > 0 && (
                    <div className="time-slots-grid">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          className={`time-slot-button ${
                            slot.isAvailable ? "available" : "unavailable"
                          } ${selectedSlot === slot ? "selected" : ""}`}
                          onClick={() =>
                            slot.isAvailable && handleSlotSelect(slot)
                          }
                          disabled={!slot.isAvailable}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="availability-modal-buttons">
                    <button
                      className="cancel-button"
                      onClick={handleCloseAvailabilityModal}
                    >
                      Cancel
                    </button>
                    {selectedSlot && (
                      <button
                        className="book-appointment-button"
                        onClick={handleBookSelectedSlot}
                      >
                        Book Appointment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorProfile;

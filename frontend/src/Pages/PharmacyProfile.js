"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Mail, Phone, ThumbsUp, Star, Calendar, Edit } from "lucide-react";
import Swal from "sweetalert2";
import "../Styles/PharmacyProfile.css";

const PharmacyProfile = () => {
  const { id } = useParams();
  const [pharmacy, setPharmacy] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profile: {
      phoneNumber: "",
      locationName: "",
      formattedAddress: "",
      city: "",
      state: "",
      country: "",
    },
  });

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

      const response = await fetch(
        "http://localhost:4000/api/pharmacies/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
          email: data.data.email || "",
          profile: {
            phoneNumber: data.data.profile?.phoneNumber || "",
            locationName: data.data.profile?.locationName || "",
            formattedAddress: data.data.profile?.formattedAddress || "",
            city: data.data.profile?.city || "",
            state: data.data.profile?.state || "",
            country: data.data.profile?.country || "",
          },
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

  useEffect(() => {
    if (!token) {
      console.error("No token found");
      setError("No token found");
      setLoading(false);
      return;
    }

    fetchPharmacyProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if the field belongs to the profile object
    const profileFields = [
      "phoneNumber",
      "locationName",
      "formattedAddress",
      "city",
      "state",
      "country",
    ];

    if (profileFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const res = await fetch("http://localhost:4000/api/pharmacies/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile updated successfully!",
          confirmButtonColor: "#3b82f6",
        });
        await fetchPharmacyProfile();
        setShowEditForm(false);
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "An error occurred while updating profile",
        confirmButtonColor: "#3b82f6",
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!pharmacy) {
    console.log("No profile found:", pharmacy);
    return <p>No pharmacy profile found.</p>;
  }

  // Update the JSX structure to match the doctor profile layout
  return (
    <div className="pharmacy-profile-container">
      {showEditForm ? (
        <div className="edit-profile-form-container">
          <form onSubmit={handleSubmit} className="edit-profile-form">
            <h2>Update Your Profile</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.profile.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="locationName">Location Name</label>
              <input
                type="text"
                id="locationName"
                name="locationName"
                placeholder="Location Name"
                value={formData.profile.locationName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="formattedAddress">Formatted Address</label>
              <input
                type="text"
                id="formattedAddress"
                name="formattedAddress"
                placeholder="Formatted Address"
                value={formData.profile.formattedAddress}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="City"
                  value={formData.profile.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder="State"
                  value={formData.profile.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  placeholder="Country"
                  value={formData.profile.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-btns">
              <button type="submit" className="save-btn">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="pharmacy-profile-header">
            <div className="pharmacy-header-top">
              <div className="pharmacy-profile-image-container">
                <img
                  src={
                    selectedImage || pharmacy.avatar
                      ? `http://localhost:4000/public/uploads/users/${
                          selectedImage || pharmacy.avatar
                        }`
                      : "http://localhost:4000/public/uploads/users/default.jpg"
                  }
                  alt="Pharmacy"
                  className="pharmacy-profile-image"
                />
                {!id && (
                  <div className="pharmacy-camera-menu">
                    <button
                      onClick={toggleMenu}
                      className="pharmacy-camera-icon"
                    >
                      <img
                        src="https://img.icons8.com/ios-filled/50/000000/camera.png"
                        alt="Edit"
                      />
                    </button>

                    {menuOpen && (
                      <>
                        <div className="overlay" onClick={toggleMenu}></div>
                        <div className="pharmacy-camera-options">
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
              <div className="pharmacy-profile-info">
                <h1 className="pharmacy-profile-name">
                  {pharmacy.firstName} {pharmacy.lastName}
                </h1>
                <p className="pharmacy-profile-usertype">Pharmacist</p>
                <div className="pharmacy-profile-details">
                  <p className="pharmacy-profile-email">
                    <Mail size={16} color="#1e56cf" />
                    {pharmacy.email}
                  </p>
                  <p className="pharmacy-profile-phone">
                    <Phone size={16} color="#1e56cf" />
                    {profile?.phoneNumber || "No phone number provided"}
                  </p>
                </div>
              </div>
              <button
                className="edit-profile-btn"
                onClick={() => setShowEditForm(true)}
              >
                <Edit size={15} color="white" />
                Edit Profile
              </button>
            </div>

            {/* Stats */}
            <div className="pharmacy-profile-stats">
              <div className="pharmacy-profile-card">
                <Calendar size={16} color="#1f61a8" />
                <span>
                  {profile?.createdAt
                    ? (() => {
                        const now = new Date();
                        const createdDate = new Date(profile?.createdAt);
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
                </span>
                <p>Pharmacy Since</p>
              </div>
              <div className="pharmacy-profile-card">
                <ThumbsUp size={16} color="#1f61a8" />
                <span>{profile?.totalReviews ?? 0}+</span>
                <p>Reviews</p>
              </div>
              <div className="pharmacy-profile-card">
                <Star size={16} color="#1f61a8" />
                <span>{profile?.averageRating ?? "N/A"}</span>
                <p>Rating</p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="pharmacy-profile-map">
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
          <div className="pharmacy-profile-reviews">
            <h2>Customer Reviews</h2>
            {profile?.reviews?.length > 0 ? (
              profile.reviews.map((review) => (
                <div key={review._id} className="pharmacy-profile-review">
                  <p>
                    <strong>{review.user?.name || "Anonymous"}</strong>
                  </p>
                  <p>{review.comment}</p>
                  <span className="pharmacy-profile-rating">
                    ⭐️ {review.rating}
                  </span>
                </div>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PharmacyProfile;

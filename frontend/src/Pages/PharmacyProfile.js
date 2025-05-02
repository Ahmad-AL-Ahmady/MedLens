import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Mail, Clock, ThumbsUp, Star, Calendar, Edit } from "lucide-react";
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
    phoneNumber: "",
    locationName: "",
    formattedAddress: "",
    city: "",
    state: "",
    country: "",
    operatingHours: {
      Monday: { isOpen: false, startTime: "", endTime: "" },
      Tuesday: { isOpen: false, startTime: "", endTime: "" },
      Wednesday: { isOpen: false, startTime: "", endTime: "" },
      Thursday: { isOpen: false, startTime: "", endTime: "" },
      Friday: { isOpen: false, startTime: "", endTime: "" },
      Saturday: { isOpen: false, startTime: "", endTime: "" },
      Sunday: { isOpen: false, startTime: "", endTime: "" },
    },
    // operatingHours: {},
    avatar: "",
  });

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const fetchPharmacyProfile = async () => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      console.error("No token found");
      setError("No token found");
      setLoading(false);
      return;
    }
    try {
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
      //console.log("Pharmacy profile data:", data);
      setFormData(data.data);
      if (data.status === "success" && data.data) {
        const defaultOperatingHours = {
          Monday: { isOpen: false, startTime: "", endTime: "" },
          Tuesday: { isOpen: false, startTime: "", endTime: "" },
          Wednesday: { isOpen: false, startTime: "", endTime: "" },
          Thursday: { isOpen: false, startTime: "", endTime: "" },
          Friday: { isOpen: false, startTime: "", endTime: "" },
          Saturday: { isOpen: false, startTime: "", endTime: "" },
          Sunday: { isOpen: false, startTime: "", endTime: "" },
        };

        const rawOperatingHours = data.data.profile?.operatingHours || {};
        const formattedOperatingHours = {};

        Object.entries(defaultOperatingHours).forEach(([day, defaults]) => {
          const lowerDay = day.toLowerCase();
          const backendDay = rawOperatingHours[lowerDay] || {};
          formattedOperatingHours[day] = {
            isOpen: backendDay.isOpen || false,
            startTime: backendDay.open || "",
            endTime: backendDay.close || "",
          };
        });

        setPharmacy(data.data);
        setProfile(data.data.profile);
        setFormData({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          email: data.data.email || "",
          phoneNumber: data.data.profile?.phoneNumber || "",
          locationName: data.data.profile?.locationName || "",
          formattedAddress: data.data.profile?.formattedAddress || "",
          city: data.data.profile?.city || "",
          state: data.data.profile?.state || "",
          country: data.data.profile?.country || "",
          operatingHours: formattedOperatingHours,
          avatar: data.data?.avatar || null,
          //avatar: null,
        });
      } else {
        setError("Failed to fetch pharmacy data");
      }
    } catch (error) {
      console.error("Error fetching pharmacy profile:", error);
      setError("Error fetching pharmacy profile");
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
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({ ...formData, avatar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log("Submitting formData:", formData);
    const form = new FormData();

    const transformedOperatingHours = {};
    Object.entries(formData.operatingHours).forEach(([day, value]) => {
      const lowerDay = day.toLowerCase();

      // send only days that have values or are open
      if (value.isOpen || value.startTime || value.endTime) {
        transformedOperatingHours[lowerDay] = {
          isOpen: value.isOpen,
          open: value.isOpen ? value.startTime : "",
          close: value.isOpen ? value.endTime : "",
        };
      }
    });

    //console.log("Final Operating Hours being sent:", transformedOperatingHours);

    form.append("operatingHours", JSON.stringify(transformedOperatingHours));
    for (const key in formData) {
      if (key === "operatingHours") continue;
      if (formData[key]) form.append(key, formData[key]);
    }

    try {
      const res = await fetch("http://localhost:4000/api/pharmacies/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const result = await res.json();
      //console.log("Update result:", result);

      if (result.status === "success") {
        alert("Profile updated!");
        await fetchPharmacyProfile(); // Refresh the profile data
        setShowEditForm(false);
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);

      try {
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
          // console.log("Avatar updated successfully!", data);
          alert("Avatar updated successfully!");
          setSelectedImage(URL.createObjectURL(file));
          await fetchPharmacyProfile();
        } else {
          console.error("Failed to update avatar");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleDeleteAvatar = async () => {
    if (window.confirm("Do you want to delete your avatar?")) {
      try {
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
          alert("Avatar deleted successfully!");
          setSelectedImage(null);
        } else {
          console.error("Failed to delete avatar");
        }
      } catch (error) {
        console.error("Error while deleting avatar:", error);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!pharmacy) {
    console.log("No profile found:", pharmacy);
    return <p>No pharmacy profile found.</p>;
  }

  return (
    <div className="pharmacy-profile-container">
      {showEditForm ? (
        <form
          onSubmit={handleSubmit}
          className="edit-profile-form full-page-form"
        >
          <h2>Update Your Profile</h2>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="locationName">Location Name</label>
            <input
              type="text"
              name="locationName"
              placeholder="Location Name"
              value={formData.locationName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="formattedAddress">Formatted Address</label>
            <input
              type="text"
              name="formattedAddress"
              placeholder="Formatted Address"
              value={formData.formattedAddress}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="state">State</label>
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>

          <div className="operating-hours-edit">
            <h3>Operating Hours</h3>
            {Object.entries(formData.operatingHours).map(([day, info]) => (
              <div key={day} className="day-row">
                <label className="day-label">
                  {day.charAt(0).toUpperCase() + day.slice(1)}:
                </label>
                <input
                  type="checkbox"
                  checked={info.isOpen}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operatingHours: {
                        ...formData.operatingHours,
                        [day]: {
                          ...formData.operatingHours[day],
                          isOpen: e.target.checked,
                        },
                      },
                    })
                  }
                />

                {info.isOpen && (
                  <>
                    <input
                      type="time"
                      value={info.startTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operatingHours: {
                            ...formData.operatingHours,
                            [day]: {
                              ...formData.operatingHours[day],
                              startTime: e.target.value,
                            },
                          },
                        })
                      }
                    />
                    <input
                      type="time"
                      value={info.endTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operatingHours: {
                            ...formData.operatingHours,
                            [day]: {
                              ...formData.operatingHours[day],
                              endTime: e.target.value,
                            },
                          },
                        })
                      }
                    />
                  </>
                )}
              </div>
            ))}
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
      ) : (
        <>
          <div className="pharmacy-profile-header">
            <div className="pharmacy-header-top">
              {/* {console.log(
                "Debugging avatar source:",
                http://localhost:4000/public/uploads/users/${pharmacy.avatar}
              )} */}
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
                <div className="pharmacy-profile-info-text">
                  <h1 className="pharmacy-profile-name">
                    {pharmacy.firstName} {pharmacy.lastName}
                  </h1>
                  <p className="pharmacy-profile-usertype">Pharmacist</p>
                </div>
                <div className="top-right-buttons">
                  <p className="pharmacy-profile-email">
                    <Mail size={16} color="#1e56cf" />
                    {pharmacy.email}
                  </p>
                  <p
                    className="operating-hours-text"
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8px",
                    }}
                  >
                    <Clock size={15} color="#1e56cf" />
                    Operating Hours
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
                        <h2>Operating Hours</h2>
                        <div className="operating-hours-grid">
                          {profile?.operatingHours ? (
                            Object.entries(profile.operatingHours).map(
                              ([day, info]) => (
                                <div key={day} className="operating-hours-item">
                                  <span className="day">
                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                    :
                                  </span>
                                  <span
                                    className={`status ${
                                      info.isOpen ? "open" : "closed"
                                    }`}
                                  >
                                    {info.isOpen
                                      ? `${info.startTime} - ${info.endTime}`
                                      : "Closed"}
                                  </span>
                                </div>
                              )
                            )
                          ) : (
                            <p>No operating hours available</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
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
                <h3 className="pharmacy-profile-card-title">
                  {profile?.createdAt
                    ? (() => {
                        const now = new Date();
                        const createdDate = new Date(profile?.createdAt);
                        const years =
                          now.getFullYear() - createdDate.getFullYear();
                        const months = now.getMonth() - createdDate.getMonth();

                        if (years > 0) {
                          return years === 1
                            ? "Joined 1 year ago"
                            : `Joined ${years} years ago`;
                        } else if (months > 0) {
                          return months === 1
                            ? "Joined 1 month ago"
                            : `Joined ${months} months ago`;
                        } else {
                          return "Joined less than a month ago";
                        }
                      })()
                    : "N/A"}
                </h3>
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
                    <strong>{review.user?.name || "Anonymous"}</strong> -{" "}
                    {review.comment}
                  </p>
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

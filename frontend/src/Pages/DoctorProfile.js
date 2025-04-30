import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import "../Styles/DoctorProfile.css";

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
  const [formData, setFormData] = useState({
    city: "",
    state: "",
    country: "",
    fees: "",
    experienceYears: 0,
    avatar: "",
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
  const fetchDoctorProfile = async () => {
    try {
      let apiUrl = id
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
          city: data.data.profile?.city || "",
          state: data.data.profile?.state || "",
          country: data.data.profile?.country || "",
          fees: data.data.profile?.fees || "",
          experienceYears: data.data.profile?.experienceYears || "",
          avatar: data.data.avatar || null,
          ...formData,
          availability: data.data.profile?.availability,
        });
      } else {
        setError("Failed to fetch doctor data");
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      setError("Error fetching doctor profile");
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
        alert("Appointment booked successfully!");
        setShowModal(false);
      } else {
        alert(
          `Failed to book appointment. Reason: ${
            data.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to book appointment. Error occurred in the request.");
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

          await fetchDoctorProfile();
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

  const editHandleSubmit = async (e) => {
    e.preventDefault();
    const doctorId = profile._id;
    /* console.log("Submitting Profile Update:", {
      city: formData.city,
      state: formData.state,
      country: formData.country,
      fees: formData.fees,
      experienceYears: formData.experienceYears,
    });

    console.log("Submitting Availability Update:", {
      availability: formData.availability,
    });*/
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
            city: formData.city,
            state: formData.state,
            country: formData.country,
            fees: formData.fees,
            experienceYears: formData.experienceYears,
          }),
        }
      );

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        alert(profileData.message || "Failed to update profile");
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
          alert(availabilityData.message || "Failed to update availability");
        }
      } catch (availabilityError) {
        console.error("Error updating availability:", availabilityError);
        alert("Something went wrong while updating availability");
      }
      alert("Profile updated successfully");
      await fetchDoctorProfile();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Something went wrong");
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      const data = await res.json();
      console.log("Review added:", data);

      setShowReviewForm(false);
      setComment("");
      setRating(5);
      setProfile((prev) => ({
        ...prev,
        reviews: [data.data.review, ...prev.reviews],
      }));
    } catch (error) {
      console.error("Error adding review:", error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!doctor) return <p>No doctor profile found.</p>;

  return (
    <div className="doctor-profile-container">
      {showEditForm ? (
        <div className="edit-doctor-profile-form-overlay">
          <form
            onSubmit={editHandleSubmit}
            className="edit-doctor-profile-form"
          >
            <h2>Update Your Profile</h2>
            <div className="doctor-form-group">
              <label> City </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="doctor-form-group">
              <label>State </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            <div className="doctor-form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
            <div className="doctor-form-group">
              <label>Fees</label>
              <input
                type="number"
                name="fees"
                value={formData.fees}
                onChange={handleChange}
              />
            </div>
            <div className="doctor-form-group">
              <label>Experience Years</label>
              <input
                type="number"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
              />
            </div>
            <div className="doctor-operating-hours-edit">
              <h3>Working Hours</h3>
              {Object.entries(formData.availability).map(([day, info]) => (
                <div key={day} className="doctor-operating-hours-item">
                  <label className="doctor-operating-hours-label">
                    {day.charAt(0).toUpperCase() + day.slice(1)}:
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
                    <>
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
                {!id && (
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
                                    {info.isAvailable
                                      ? `${info.start} - ${info.end}`
                                      : "Closed"}
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
                    <div className="modal-overlay">
                      <div className="modal-container">
                        <span
                          className="close-bt"
                          onClick={() => setShowModal(false)}
                        >
                          &times;
                        </span>
                        <h2 className="appointment-form-title">
                          Book Appointment
                        </h2>
                        <form onSubmit={handleSubmit}>
                          <div>
                            <label className="appointment-form-label">
                              Date
                            </label>
                            <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="appointment-form-input"
                            />
                          </div>

                          <div>
                            <label className="appointment-form-label">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="appointment-form-input"
                            />
                          </div>

                          <div>
                            <label className="appointment-form-label">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="appointment-form-input"
                            />
                          </div>

                          <div>
                            <label className="appointment-form-label">
                              Reason
                            </label>
                            <textarea
                              value={reason}
                              onChange={(e) => setReason(e.target.value)}
                              className="appointment-form-textarea"
                              rows="4"
                            ></textarea>
                          </div>

                          <button
                            type="submit"
                            className="appointment-form-button"
                          >
                            Book Appointment
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {id ? (
                <button
                  className="add-appointment-btn"
                  onClick={() => setShowModal(true)}
                >
                  <FaRegCalendarAlt /> Add Appointment
                </button>
              ) : (
                <button
                  className="edit-doctor-profile-button"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit size={15} color="white" /> Edit Profile
                </button>
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
              {id && (
                <button
                  className="add-review-button"
                  onClick={() => setShowReviewForm(true)}
                >
                  Add Review
                </button>
              )}
            </div>
            {showReviewForm && (
              <div className="review-modal-overlay">
                <div className="review-modal">
                  <h2 className="review-modal-title">Add Your Review</h2>
                  <form onSubmit={handleReviewSubmit}>
                    <textarea
                      placeholder="Write your review..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                    <div className="rating-input">
                      <input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(parseFloat(e.target.value))}
                        step="0.1"
                        min="1"
                        max="5"
                        required
                      />
                      <span> ⭐️</span>
                      <div className="review-rating-buttons">
                        <button type="submit" className="submit-review-button">
                          Submit
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="close-modal-button"
                        >
                          Cancel
                        </button>
                      </div>
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
                  </div>
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

export default DoctorProfile;





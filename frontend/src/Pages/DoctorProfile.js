import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaRegCalendarAlt } from "react-icons/fa";
import {
  Mail,
  Clock,
  ThumbsUp,
  Star,
  UserCheck,
  BadgeCheck,
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

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No token found");
      setError("No token found");
      setLoading(false);
      return;
    }

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
        console.log("data:", data);

        if (data.status === "success" && data.data) {
          setDoctor(data.data);
          setProfile(data.data.profile);
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
      console.log("Response Status:", response.status);
      console.log("Response Data:", data);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!doctor) return <p>No doctor profile found.</p>;

  return (
    <div className="doctor-profile-container">
      {/* Doctor info */}
      <div className="doctor-profile-header">
        <div className="doctor-header-top">
          <img
            src={
              doctor.avatar
                ? `http://localhost:4000/public/uploads/users/${doctor.avatar}`
                : "http://localhost:4000/public/uploads/users/default.jpg"
            }
            alt="Doctor"
            className="doctor-profile-image"
          />

          <div className="doctor-profile-info">
            <h1 className="doctor-profile-name">
              {doctor.firstName} {doctor.lastName}
            </h1>
            <p className="doctor-profile-usertype">{doctor.specialization}</p>
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
                                {day.charAt(0).toUpperCase() + day.slice(1)}:
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
              <button
                className="add-appointment-btn"
                onClick={() => setShowModal(true)}
              >
                <FaRegCalendarAlt /> Add Appointment
              </button>

              {showModal && (
                <div className="modal-overlay">
                  <div className="modal-container">
                    <span
                      className="close-bt"
                      onClick={() => setShowModal(false)}
                    >
                      &times;
                    </span>
                    <h2 className="appointment-form-title">Book Appointment</h2>
                    <form onSubmit={handleSubmit}>
                      <div>
                        <label className="appointment-form-label">Date</label>
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
                        <label className="appointment-form-label">Reason</label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="appointment-form-textarea"
                          rows="4"
                        ></textarea>
                      </div>

                      <button type="submit" className="appointment-form-button">
                        Book Appointment
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* stats card */}
        <div className="doctor-profile-stats">
          <div className="doctor-profile-card">
            <UserCheck size={16} color="#1f61a8" />
            <span>{profile?.patients ?? 0}+</span>
            <p>Patients</p>
          </div>
          <div className="doctor-profile-card">
            <BadgeCheck size={16} color="#1f61a8" />
            <span>{profile?.yearsOfPractice ?? 0} Years</span>
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
        <h2>Patient Reviews</h2>
        {profile?.reviews?.length > 0 ? (
          profile.reviews.map((review) => (
            <div key={review._id} className="doctor-profile-review">
              <p>
                <strong>{review.user?.name || "Anonymous"}</strong> -{" "}
                {review.comment}
              </p>
              <span className="doctor-profile-rating">⭐️ {review.rating}</span>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;

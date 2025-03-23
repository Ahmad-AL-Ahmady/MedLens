import React, { useEffect, useState } from "react";
import { Mail, Clock, ThumbsUp, Star, Pill } from "lucide-react";
import "../Styles/PharmacyProfile.css";

const PharmacyProfile = () => {
  const [pharmacy, setPharmacy] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No token found");
      setError("No token found");
      setLoading(false);
      return;
    }

    const fetchPharmacyProfile = async () => {
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

        if (data.status === "success" && data.data) {
          setPharmacy(data.data);
          setProfile(data.data.profile);
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

    fetchPharmacyProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!pharmacy) {
    console.log("No profile found:", pharmacy);
    return <p>No pharmacy profile found.</p>;
  }

  return (
    <div className="pharmacy-profile-container">
      {/* ✅ Pharmacist info*/}
      <div className="pharmacy-profile-header">
        <div className="pharmacy-header-top">
          <img
            src={`http://localhost:4000/public/uploads/users/${pharmacy.avatar}`}
            alt="Pharmacy"
            className="pharmacy-profile-image"
          />

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
              <button
                onClick={() => setIsModalOpen(true)}
                className="operating-hours-title"
              >
                <Clock size={15} color="white" />
                Operating Hours
              </button>
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
                                {day.charAt(0).toUpperCase() + day.slice(1)}:
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
        </div>

        {/* ✅ stats card */}
        <div className="pharmacy-profile-stats">
          <div className="pharmacy-profile-card">
            <Pill size={16} color="#1f61a8" />
            <span>0+</span>
            <p>Prescriptions</p>
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
    </div>
  );
};

export default PharmacyProfile;

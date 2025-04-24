import React, { useEffect, useState } from "react";
import { Mail, Clock, ThumbsUp, Star, Pill, Edit } from "lucide-react";
import "../Styles/PharmacyProfile.css";

const PharmacyProfile = () => {
  const [pharmacy, setPharmacy] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState(null);

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
          avatar: data.data.profile?.avatar || null,
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
          <h2>Edit Profile</h2>
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
          <div className="form-group">
            <label htmlFor="avatar">Avatar</label>
            <input type="file" name="avatar" onChange={handleChange} />
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
              Save
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
              <img
                src={`http://localhost:4000/public/uploads/users/${pharmacy.avatar}`}
                alt="Pharmacy"
                className="pharmacy-profile-image"
              />
              <div className="pharmacy-profile-info">
                <div className="pharmacy-profile-info-row">
                  <div className="pharmacy-profile-info-text">
                    <h1 className="pharmacy-profile-name">
                      {pharmacy.firstName} {pharmacy.lastName}
                    </h1>
                    <p className="pharmacy-profile-usertype">Pharmacist</p>
                  </div>

                  <div className="top-right-buttons">
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
                                  <div
                                    key={day}
                                    className="operating-hours-item"
                                  >
                                    <span className="day">
                                      {day.charAt(0).toUpperCase() +
                                        day.slice(1)}
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
                    <button
                      className="edit-profile-btn"
                      onClick={() => setShowEditForm(true)}
                    >
                      <Edit size={15} color="white" />
                      Edit Profile
                    </button>
                  </div>
                </div>

                <p className="pharmacy-profile-email">
                  <Mail size={16} color="#1e56cf" />
                  {pharmacy.email}
                </p>
              </div>
            </div>

            {/* Stats */}
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
        </>
      )}
    </div>
  );
};

export default PharmacyProfile;

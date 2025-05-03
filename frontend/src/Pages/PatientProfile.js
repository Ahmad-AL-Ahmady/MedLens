"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  Calendar,
  User,
  Stethoscope,
  ClipboardList,
  ScanBarcode,
  Edit,
  Lock,
} from "lucide-react";
import Swal from "sweetalert2";
import "../Styles/PatientProfile.css";

export default function PatientProfile() {
  const id = localStorage.getItem("userId") || sessionStorage.getItem("userId");
  const [selectedImage, setSelectedImage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [scans, setScans] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/patients/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("Profile data:", data); // Debugging line
      if (data.status === "success" && data.data) {
        setPatientData(data.data);
        setAppointments(data.data.profile?.appointments || []);
        setFormData({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          age: data.data.age || "",
        });
      } else {
        throw new Error("No profile data found");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error; // Let the caller handle the error
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
      throw error; // Let the caller handle the error
    }
  };

  const handleUpdatePassword = async (currentPassword, newPassword) => {
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
            passwordCurrent: currentPassword,
            password: newPassword,
            passwordConfirm: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Password Updated!",
          text: "Your password has been successfully updated.",
        });
      } else {
        throw new Error(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      Swal.fire({
        icon: "error",
        title: "Password Update Failed",
        text: error.message || "Something went wrong. Please try again later.",
      });
    }
  };

  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Please Log In",
        text: "You need to log in to see your profile.",
      });
      setError("No token found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      Swal.fire({
        title: "Loading Your Info...",
        text: "Please wait a moment",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await Promise.all([fetchProfile(), fetchScans()]);
        Swal.close(); // Close the loading pop-up on success
      } catch (error) {
        setError(error.message || "Failed to load data");
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "We couldn't load your info. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Please Log In",
        text: "You need to log in to update your profile.",
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.age) {
      Swal.fire({
        icon: "warning",
        title: "Missing Info",
        text: "Please fill in all fields to update your profile.",
      });
      return;
    }

    Swal.fire({
      title: "Saving Changes...",
      text: "Please wait while we update your profile",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const res = await fetch("http://localhost:4000/api/patients/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      await res.json();
      Swal.fire({
        icon: "success",
        title: "Changes Saved!",
        text: "Your profile has been updated.",
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchProfile();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "We couldn't save your changes. Please try again.",
      });
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
          await fetchProfile();
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

  if (loading) return null; // Swal handles loading
  if (error) return null; // Swal handles errors
  if (!patientData) return null; // Swal handles no data

  return (
    <div className="patient-profile-container">
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
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter your age"
                  />
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
        </div>
      ) : (
        <div className="patient-profile">
          {/* Personal Data */}
          <div className="patient-profile-header">
            <div className="patient-header-top">
              <div className="patient-profile-image-container">
                <img
                  src={
                    selectedImage || patientData.avatar
                      ? `http://localhost:4000/public/uploads/users/${
                          selectedImage || patientData.avatar
                        }`
                      : "http://localhost:4000/public/uploads/users/default.jpg"
                  }
                  alt="Patient"
                  className="patient-profile-image"
                />
                {!id && (
                  <div className="patient-camera-menu">
                    <button
                      onClick={toggleMenu}
                      className="patient-camera-icon"
                    >
                      <img
                        src="https://img.icons8.com/ios-filled/50/000000/camera.png"
                        alt="Edit"
                      />
                    </button>

                    {menuOpen && (
                      <>
                        <div className="overlay" onClick={toggleMenu}></div>
                        <div className="patient-camera-options">
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
              <div className="patient-profile-info">
                <h1>{`${patientData.firstName} ${patientData.lastName}`}</h1>
                <p className="email">
                  <Mail size={16} color="#1e56cf" />
                  {patientData.email}
                </p>
                <div className="patient-extra-info">
                  <p>
                    <Calendar size={15} color="#505050" />
                    {patientData.age} years
                  </p>
                  <p>
                    <User size={15} color="#505050" />{" "}
                    {patientData.gender.charAt(0).toUpperCase() +
                      patientData.gender.slice(1)}
                  </p>
                </div>
              </div>
              <div className="profile-buttons">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="edit-patient-profile-button"
                >
                  <Edit size={15} color="white" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="edit-patient-profile-button update-password-btn"
                >
                  <Lock size={15} color="white" />
                  Update Password
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="patient-profile-summary-cards">
              <div className="patient-profile-card">
                <Stethoscope size={16} color="#1f61a8" />
                <h3>{appointments.length}</h3>
                <p>Visits</p>
              </div>
              <div className="patient-profile-card">
                <Calendar size={16} color="#1f61a8" />
                <h3>
                  {patientData.profile.createdAt
                    ? (() => {
                        const now = new Date();
                        const createdDate = new Date(
                          patientData.profile.createdAt
                        );
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
                <p>Patient Since</p>
              </div>
              <div className="patient-profile-card">
                <ClipboardList size={16} color="#1f61a8" />
                <h3>{scans.length}</h3>
                <p>Reports</p>
              </div>
            </div>
          </div>

          {/* Past Scans */}
          <div className="patient-profile-scan-section">
            <h2>
              <ScanBarcode size={20} color="#1e40af" />
              Scans
            </h2>
            <table className="patient-profile-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Body Part</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scans.length > 0 ? (
                  scans.map((scan) => (
                    <tr key={scan.id}>
                      <td>{scan?.date || "N/A"}</td>
                      <td>{scan?.type || "N/A"}</td>
                      <td>{scan?.bodyPart || "N/A"}</td>
                      <td className="patient-profile-status">
                        {scan?.status || "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No scans found for this patient.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Past Appointments */}
          <div className="patient-profile-scan-section">
            <h2>
              <Calendar size={20} color="#1e40af" />
              Appointments
            </h2>
            <table className="patient-profile-data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <tr key={appointment?.id}>
                      <td>{appointment?.date?.split("T")[0] || "N/A"}</td>
                      <td>
                        {appointment?.doctor
                          ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                          : "N/A"}
                      </td>
                      <td>{appointment?.doctor?.specialization || "N/A"}</td>
                      <td>{appointment?.reason || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No appointments scheduled.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
    </div>
  );
}

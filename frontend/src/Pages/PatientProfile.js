"use client";

import { useEffect, useState, useRef } from "react";
import {
  Mail,
  Calendar,
  User,
  Stethoscope,
  ClipboardList,
  ScanBarcode,
  Edit,
  Lock,
  Trash2,
} from "lucide-react";
import Swal from "sweetalert2";
import ReactDOM from "react-dom";
import "../Styles/PatientProfile.css";

// Component for Update Profile Form
const UpdateProfileForm = ({
  isOpen,
  onClose,
  formData,
  handleChange,
  handleSubmit,
}) => {
  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    console.error("Modal root element not found for UpdateProfileForm");
    return null;
  }

  return ReactDOM.createPortal(
    <div className="edit-doctor-profile-form-overlay">
      <form onSubmit={handleSubmit} className="edit-doctor-profile-form">
        <button type="button" className="close-form-btn" onClick={onClose}>
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
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>,
    modalRoot
  );
};

// Component for Update Password Form
const UpdatePasswordForm = ({
  isOpen,
  onClose,
  passwordData,
  handlePasswordChange,
  handlePasswordSubmit,
}) => {
  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    console.error("Modal root element not found for UpdatePasswordForm");
    return null;
  }

  return ReactDOM.createPortal(
    <div className="edit-doctor-profile-form-overlay">
      <form
        onSubmit={handlePasswordSubmit}
        className="edit-doctor-profile-form"
      >
        <button type="button" className="close-form-btn" onClick={onClose}>
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
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
          <button type="button" onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Update Password
          </button>
        </div>
      </form>
    </div>,
    modalRoot
  );
};

// Component for Avatar Edit Menu
const AvatarEditMenu = ({
  isOpen,
  onClose,
  onUploadClick,
  onDelete,
  avatarPosition,
}) => {
  if (!isOpen) return null;

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) {
    console.error("Modal root element not found for AvatarEditMenu");
    return null;
  }

  // Calculate menu position based on avatar container
  const menuStyle = {
    position: "absolute",
    top: avatarPosition
      ? `${avatarPosition.top + avatarPosition.height + 10}px`
      : "150px",
    left: avatarPosition ? `${avatarPosition.left}px` : "50px",
    background: "white",
    border: "1px solid #ccc",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    borderRadius: "8px",
    overflow: "hidden",
  };

  return ReactDOM.createPortal(
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="patient-camera-options" style={menuStyle}>
        <button onClick={onUploadClick}>Upload</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </>,
    modalRoot
  );
};

export default function PatientProfile() {
  const id = localStorage.getItem("userId") || sessionStorage.getItem("userId");
  console.log("User ID:", id); // Debug: Check id value
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
  const fileInputRef = useRef(null); // Ref for file input
  const avatarContainerRef = useRef(null); // Ref for avatar container
  const [avatarPosition, setAvatarPosition] = useState(null); // State for avatar position

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Update avatar position when menu opens
  useEffect(() => {
    if (menuOpen && avatarContainerRef.current) {
      const rect = avatarContainerRef.current.getBoundingClientRect();
      setAvatarPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        height: rect.height,
      });
    }
  }, [menuOpen]);

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
      console.log("Profile data:", data);
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
      throw error;
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

  const handleCancelAppointment = async (appointmentId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to cancel this appointment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/appointments/${appointmentId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to cancel appointment");
        }

        const updatedAppointments = appointments.filter(
          (appt) => appt._id !== appointmentId
        );
        setAppointments(updatedAppointments);

        Swal.fire({
          icon: "success",
          title: "Cancelled!",
          text: "The appointment has been cancelled.",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Something went wrong while cancelling the appointment. Please try again.",
        });
      }
    }
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
        Swal.close();
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
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Avatar updated successfully",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to update avatar",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while updating your avatar",
        });
      }
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleDeleteAvatar = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete your avatar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
    });

    if (result.isConfirmed) {
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
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Avatar deleted successfully",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete avatar",
          });
        }
      } catch (error) {
        console.error("Error while deleting avatar:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while deleting your avatar",
        });
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
        }).then(() => {
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
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

  const handleUploadClick = () => {
    console.log("handleUploadClick called"); // Debug
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log("File input triggered"); // Debug
    } else {
      console.error("File input ref not found");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to open file picker. Please try again.",
      });
    }
    setMenuOpen(false);
  };

  if (loading) return null;
  if (error) return null;
  if (!patientData) return null;

  // Assume logged-in user can edit their own profile; adjust logic if needed
  const canEditAvatar = true; // Replace with actual logic, e.g., compare id with token's user ID

  return (
    <div className="patient-profile-container">
      <UpdateProfileForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
      <UpdatePasswordForm
        isOpen={showPasswordForm}
        onClose={() => setShowPasswordForm(false)}
        passwordData={passwordData}
        handlePasswordChange={handlePasswordChange}
        handlePasswordSubmit={handlePasswordSubmit}
      />
      <AvatarEditMenu
        isOpen={menuOpen}
        onClose={toggleMenu}
        onUploadClick={handleUploadClick}
        onDelete={handleDeleteAvatar}
        avatarPosition={avatarPosition}
      />
      <div className="patient-profile">
        <div className="patient-profile-header">
          <div className="patient-header-top">
            <div
              className="patient-profile-image-container"
              ref={avatarContainerRef}
            >
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
              {canEditAvatar && (
                <div className="patient-camera-menu">
                  <button onClick={toggleMenu} className="patient-camera-icon">
                    <img
                      src="https://img.icons8.com/ios-filled/50/000000/camera.png"
                      alt="Edit"
                    />
                  </button>
                </div>
              )}
              <input
                type="file"
                id="upload-photo"
                accept="image/*"
                capture="user"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
                ref={fileInputRef}
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
                  <User size={15} color="#505050" />
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
                          ? scan.description.replace("AI Analysis:", "").trim()
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
                  <td colSpan="6">No scans found for this patient.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                <th>Actions</th>
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
                    <td>
                      <button
                        className="delete-appointment-button"
                        onClick={() => handleCancelAppointment(appointment._id)}
                        title="Cancel Appointment"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No appointments scheduled.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

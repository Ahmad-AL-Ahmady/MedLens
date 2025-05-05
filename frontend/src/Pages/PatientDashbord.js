import React, { useState, useEffect } from "react";
import "../Styles/PatientDashbord.css";
import { Calendar, Clock, Activity, Mail, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [scans, setScans] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Helper function to format date to "DD MMMM YYYY"
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please log in to access your dashboard.",
        });
        setLoading(false);
        return;
      }

      if (isInitialLoad) {
        Swal.fire({
          title: "Loading Dashboard...",
          text: "Please wait while we fetch your data!",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }

      try {
        setLoading(true);

        // Fetch patient profile
        const profileResponse = await fetch(
          "http://localhost:4000/api/patients/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!profileResponse.ok) {
          const contentType = profileResponse.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server response is not valid JSON");
          }
          const errorData = await profileResponse.json();
          throw new Error(
            errorData.message || "Failed to fetch patient profile"
          );
        }

        const profileData = await profileResponse.json();

        // Fetch scans
        const scansResponse = await fetch(
          "http://localhost:4000/api/medical-scans",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!scansResponse.ok) {
          const contentType = scansResponse.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server response is not valid JSON");
          }
          const errorData = await scansResponse.json();
          throw new Error(errorData.message || "Failed to fetch scans");
        }

        const scansData = await scansResponse.json();

        if (profileData.status === "success" && profileData.data) {
          setPatient(profileData.data);
          const appointmentsData = profileData.data.profile?.appointments || [];

          // Sort appointments by date and time
          const sortedAppointments = appointmentsData.sort((a, b) => {
            const aDateTime = new Date(`${a.date}T${a.startTime}`);
            const bDateTime = new Date(`${b.date}T${b.startTime}`);
            return aDateTime - bDateTime;
          });

          setAppointments(sortedAppointments);
        } else {
          throw new Error("Failed to fetch patient data");
        }

        if (scansData.status === "success" && scansData.data?.scans) {
          setScans(scansData.data.scans);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Failed to load dashboard data. Please try again.",
        });
      } finally {
        setLoading(false);
        if (isInitialLoad) {
          Swal.close();
          setIsInitialLoad(false);
        }
      }
    };

    fetchDashboardData();
  }, [token, isInitialLoad]);

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
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server response is not valid JSON");
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to cancel appointment");
        }

        // Refresh appointments
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
          text:
            error.message ||
            "Something went wrong while cancelling the appointment. Please try again.",
        });
      }
    }
  };

  if (loading) return null;
  if (!patient) {
    return <p>No patient profile found.</p>;
  }

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;
  const scanCount = scans.length;

  return (
    <div className="patient-dashboard-container">
      {/* Profile Header */}
      <div className="patient-dashboard-profile-header">
        <img
          src={
            patient.avatar
              ? `http://localhost:4000/public/uploads/users/${patient.avatar}`
              : "https://via.placeholder.com/80"
          }
          alt="Patient Avatar"
          className="patient-dashboard-profile-image"
          onError={(e) => (e.target.src = "https://via.placeholder.com/80")}
        />
        <div className="patient-dashboard-profile-info">
          <h1 className="patient-dashboard-profile-name">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="patient-dashboard-profile-email">
            <Mail size={16} color="#1e56cf" />
            {patient.email}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="patient-dashboard-stats-grid">
        <div className="patient-dashboard-card">
          <div className="patient-dashboard-card__header">
            <h3 className="patient-dashboard-card__title">Next Appointment</h3>
            <Calendar className="patient-dashboard-card__icon patient-dashboard-card__icon--blue" />
          </div>
          <div className="patient-dashboard-card__content">
            {nextAppointment ? (
              <>
                <div className="patient-dashboard-card__time">
                  <Clock className="patient-dashboard-card__time-icon" />
                  <span>
                    {formatDate(nextAppointment.date)},{" "}
                    {nextAppointment.startTime}
                  </span>
                </div>
                <p className="patient-dashboard-card__doctor">
                  Dr. {nextAppointment.doctor.firstName}{" "}
                  {nextAppointment.doctor.lastName}
                </p>
                <p className="patient-dashboard-card__service">
                  {nextAppointment.doctor.specialization || "General Checkup"}
                </p>
              </>
            ) : (
              <p>No upcoming appointments</p>
            )}
          </div>
        </div>
        <div className="patient-dashboard-card">
          <div className="patient-dashboard-card__header">
            <h3 className="patient-dashboard-card__title">Recent Scans</h3>
            <Activity className="patient-dashboard-card__icon patient-dashboard-card__icon--orange" />
          </div>
          <div className="patient-dashboard-card__content">
            <p className="patient-dashboard-card__value">{scanCount}</p>
            <p className="patient-dashboard-card__subtext">Scans this month</p>
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="patient-dashboard-section">
        <div className="patient-dashboard-header">
          <h2 className="patient-dashboard-title">Upcoming Appointments</h2>
        </div>
        <div className="patient-dashboard-appointments-grid">
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="patient-dashboard-appointment-card"
              >
                <div className="patient-dashboard-appointment-header">
                  <div className="patient-dashboard-doctor-info">
                    <img
                      src={
                        appointment.doctor.avatar
                          ? `http://localhost:4000/public/uploads/users/${appointment.doctor.avatar}`
                          : "https://via.placeholder.com/48"
                      }
                      alt="Doctor Avatar"
                      className="patient-dashboard-doctor-avatar"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/48")
                      }
                    />
                    <div>
                      <h3 className="patient-dashboard-doctor-name">
                        Dr. {appointment.doctor.firstName}{" "}
                        {appointment.doctor.lastName}
                      </h3>
                      <p className="patient-dashboard-doctor-specialization">
                        {appointment.doctor.specialization || "General Checkup"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="patient-dashboard-appointment-details">
                  <div className="patient-dashboard-appointment-info">
                    <Calendar size={20} color="var(--primary-color)" />
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className="patient-dashboard-appointment-info">
                    <Clock size={20} color="var(--primary-color)" />
                    <span>{appointment.startTime}</span>
                  </div>
                </div>
                <div className="patient-dashboard-appointment-actions">
                  <button
                    className="patient-dashboard-cancel-button"
                    onClick={() => handleCancelAppointment(appointment._id)}
                  >
                    <Trash2 size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="patient-dashboard-no-appointments">
              No upcoming appointments
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Calendar, Clock, Activity, Mail, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import "../Styles/DoctorDashboard.css";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [scanCount, setScanCount] = useState(0); // State for dynamic scan count
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

  const fetchAppointments = async () => {
    try {
      if (isInitialLoad) {
        Swal.fire({
          title: "Loading Dashboard...",
          text: "Please wait while we fetch your appointments!",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      }

      const response = await fetch(
        "http://localhost:4000/api/doctors/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(
          "We couldn't load your appointments. Please try again."
        );
      }

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setDoctor(data.data);
        setAppointments(data.data.profile?.appointments || []);
        setScanCount(data.data.profile?.scanCount || 0); // Set scan count from API
      } else {
        throw new Error("No appointments found for today.");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Swal.fire({
        icon: "error",
        title: "Oops, something went wrong!",
        text: error.message,
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Got it",
      });
    } finally {
      setLoading(false);
      if (isInitialLoad) {
        Swal.close();
        setIsInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="doctor-dashboard-container">
        <div className="doctor-dashboard-skeleton">
          <div className="doctor-dashboard-skeleton__header"></div>
          <div className="doctor-dashboard-skeleton__grid">
            <div className="doctor-dashboard-skeleton__card"></div>
            <div className="doctor-dashboard-skeleton__card"></div>
          </div>
          <div className="doctor-dashboard-skeleton__section">
            <div className="doctor-dashboard-skeleton__title"></div>
            <div className="doctor-dashboard-skeleton__appointment"></div>
            <div className="doctor-dashboard-skeleton__appointment"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-dashboard-container">
        <div className="doctor-dashboard-error">
          <p>No doctor profile found.</p>
          <button
            className="doctor-dashboard-retry-button"
            onClick={fetchAppointments}
            aria-label="Retry loading dashboard"
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  return (
    <div className="doctor-dashboard-container">
      {/* Profile Header */}
      <div
        className="doctor-dashboard-profile-header"
        aria-label="Doctor profile"
      >
        <img
          src={
            doctor.avatar
              ? `http://localhost:4000/public/uploads/users/${doctor.avatar}`
              : "https://via.placeholder.com/80"
          }
          alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
          className="doctor-dashboard-profile-image"
          onError={(e) => (e.target.src = "https://via.placeholder.com/80")}
        />
        <div className="doctor-dashboard-profile-info">
          <h1 className="doctor-dashboard-profile-name">
            Dr. {doctor.firstName} {doctor.lastName}
          </h1>
          <p className="doctor-dashboard-profile-email">
            <Mail size={16} color="#1e56cf" />
            {doctor.email}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="doctor-dashboard-stats-grid">
        <div
          className="doctor-dashboard-card"
          tabIndex={0}
          aria-label="Next appointment"
        >
          <div className="doctor-dashboard-card__header">
            <h3 className="doctor-dashboard-card__title">Next Appointment</h3>
            <Calendar className="doctor-dashboard-card__icon doctor-dashboard-card__icon--blue" />
          </div>
          <div className="doctor-dashboard-card__content">
            {nextAppointment ? (
              <>
                <div className="doctor-dashboard-card__time">
                  <Clock className="doctor-dashboard-card__time-icon" />
                  <span>
                    {formatDate(nextAppointment.date)},{" "}
                    {nextAppointment.startTime}
                  </span>
                </div>
                <p className="doctor-dashboard-card__patient">
                  {nextAppointment.patient.firstName}{" "}
                  {nextAppointment.patient.lastName}
                </p>
                <p className="doctor-dashboard-card__reason">
                  {nextAppointment.reason || "General Checkup"}
                </p>
              </>
            ) : (
              <p>No upcoming appointments</p>
            )}
          </div>
        </div>
        <div
          className="doctor-dashboard-card"
          tabIndex={0}
          aria-label="Recent scans"
        >
          <div className="doctor-dashboard-card__header">
            <h3 className="doctor-dashboard-card__title">Recent Scans</h3>
            <Activity className="doctor-dashboard-card__icon doctor-dashboard-card__icon--orange" />
          </div>
          <div className="doctor-dashboard-card__content">
            <p className="doctor-dashboard-card__value">{scanCount}</p>
            <p className="doctor-dashboard-card__subtext">Scans this month</p>
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="doctor-dashboard-section">
        <div className="doctor-dashboard-header">
          <h2 className="doctor-dashboard-title">Today's Appointments</h2>
        </div>
        <div className="doctor-dashboard-appointments-grid">
          {appointments.length > 0 ? (
            appointments.map((appointment) => {
              const patient = appointment.patient || {
                firstName: "Unknown",
                lastName: "Patient",
                avatar: "https://via.placeholder.com/48",
                age: "N/A",
                gender: "N/A",
              };

              return (
                <div
                  key={appointment._id}
                  className="doctor-dashboard-appointment-card"
                  tabIndex={0}
                  aria-label={`Appointment with ${patient.firstName} ${patient.lastName}`}
                >
                  <div className="doctor-dashboard-appointment-header">
                    <div className="doctor-dashboard-patient-info">
                      <img
                        src={
                          patient.avatar
                            ? `http://localhost:4000/public/uploads/users/${patient.avatar}`
                            : "https://via.placeholder.com/48"
                        }
                        alt={`${patient.firstName} ${patient.lastName}`}
                        className="doctor-dashboard-patient-avatar"
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/48")
                        }
                      />
                      <div>
                        <h3 className="doctor-dashboard-patient-name">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="doctor-dashboard-patient-reason">
                          {appointment.reason || "General Checkup"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="doctor-dashboard-appointment-details">
                    <div className="doctor-dashboard-appointment-info">
                      <Calendar size={20} color="var(--primary-color)" />
                      <span>{formatDate(appointment.date)}</span>
                    </div>
                    <div className="doctor-dashboard-appointment-info">
                      <Clock size={20} color="var(--primary-color)" />
                      <span>{appointment.startTime}</span>
                    </div>
                    <div className="doctor-dashboard-appointment-info">
                      <span>
                        Age: {patient.age || "N/A"} | Gender:{" "}
                        {patient.gender || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="doctor-dashboard-no-appointments">
              No appointments today
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

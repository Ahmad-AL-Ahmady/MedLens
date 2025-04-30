import { useState, useEffect } from "react";
import { Users, Activity, Calendar } from "lucide-react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import "../Styles/DoctorDashboard.css";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const fetchAppointments = async () => {
    try {
      Swal.fire({
        title: "Hang on...",
        text: "We're getting your schedule...",
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      });

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
      console.log(data);
      if (data.status === "success" && data.data) {
        setAppointments(data.data.profile?.appointments || []);
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
      Swal.close();
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="doctor-dashboard-container">
      {loading ? null : (
        <>
          <div className="doctor-dashboard-stats-grid">
            <div className="doctor-dashboard-card">
              <div className="doctor-dashboard-card__header">
                <h3 className="doctor-dashboard-card__title">
                  Today's Patients
                </h3>
                <Users className="doctor-dashboard-card__icon doctor-dashboard-card__icon--blue" />
              </div>
              <div className="doctor-dashboard-card__content">
                <p className="doctor-dashboard-card__value">
                  {appointments.length}
                </p>
                <p className="doctor-dashboard-card__subtext">
                  {appointments.length} appointments today
                </p>
              </div>
            </div>

            <div className="doctor-dashboard-card">
              <div className="doctor-dashboard-card__header">
                <h3 className="doctor-dashboard-card__title">Scans</h3>
                <Activity className="doctor-dashboard-card__icon doctor-dashboard-card__icon--blue" />
              </div>
              <div className="doctor-dashboard-card__content">
                <p className="doctor-dashboard-card__value">28</p>
              </div>
            </div>
          </div>

          <div className="doctor-dashboard-schedule">
            <h3 className="doctor-dashboard-schedule__title">
              <Calendar className="doctor-dashboard-schedule__icon" />
              Today's Schedule
            </h3>
            <div className="doctor-dashboard-schedule__list">
              {appointments.length === 0 ? (
                <p>No appointments today</p>
              ) : (
                appointments.map((appointment) => {
                  const patient = appointment.patient || {
                    firstName: "Unknown",
                    lastName: "Patient",
                    avatar:
                      "https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                    age: "N/A",
                    gender: "N/A",
                  };

                  return (
                    <div
                      key={appointment.id}
                      className="doctor-dashboard-appointment"
                    >
                      <div className="doctor-dashboard-appointment__details">
                        <div className="doctor-dashboard-appointment__patient">
                          <img
                            src={patient.avatar}
                            alt={`${patient.firstName} ${patient.lastName}`}
                            className="doctor-dashboard-patient-avatar"
                          />
                          <div className="doctor-dashboard-appointment__patient-info">
                            <p className="doctor-dashboard-appointment__name">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="doctor-dashboard-appointment__reason">
                              {appointment.reason || "N/A"}
                            </p>
                            <p className="doctor-dashboard-appointment__meta">
                              Age: {patient.age || "N/A"} | Gender:{" "}
                              {patient.gender || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="doctor-dashboard-appointment__time">
                        {appointment.startTime} - {appointment.endTime}
                        {appointment.data && (
                          <span className="doctor-dashboard-appointment__data">
                            {" "}
                            | {appointment.data}
                          </span>
                        )}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;

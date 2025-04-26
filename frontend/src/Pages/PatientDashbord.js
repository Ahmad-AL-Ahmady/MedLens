import React, { useState, useEffect } from "react";
import "../Styles/PatientDashbord.css";
import { Calendar, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import Swal from "sweetalert2";

export default function PatientDashbord() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage or sessionStorage
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Show SweetAlert2 loading modal with user-friendly text
      Swal.fire({
        title: "Loading Your Dashboard",
        text: "Getting your information, please wait...",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading(); // Show loading spinner
        },
      });

      if (!token) {
        console.error("No token found");
        setError("We couldn't find your login details. Please log in again.");
        setLoading(false);
        Swal.close();
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:4000/api/patients/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();

        if (data.status === "success" && data.data) {
          setDashboardData(data.data);
        } else {
          throw new Error("We couldn't load your dashboard. Please try again.");
        }
        setLoading(false);
        Swal.close();
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        setLoading(false);
        Swal.close();
      }
    };

    fetchDashboardData();
  }, [token]);

  // Handle error state with SweetAlert2
  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        text: error, // Error message is already user-friendly
        confirmButtonText: "OK",
        confirmButtonColor: "#1f61a8",
      });
    }
  }, [error]);

  // Render nothing while loading (Swal handles the UI)
  if (loading) {
    return null;
  }

  if (!dashboardData) {
    return null; // Error modal will be shown by Swal
  }

  // Get the next appointment (first upcoming appointment)
  const nextAppointment = dashboardData.appointments.upcoming[0] || null;

  // Placeholder for scans data (until backend provides it)
  const scanCount = 5; // Replace with actual API data when available

  return (
    <div className="ph-container">
      <div className="ph-dashboard-grid">
        {/* Appointment Card */}
        <div className="ph-card ph-card--appointment">
          <div className="ph-card__header">
            <h3 className="ph-card__title">Next Appointment</h3>
            <Calendar className="ph-card__icon ph-card__icon--calendar" />
          </div>
          <div className="ph-card__content">
            {nextAppointment ? (
              <>
                <div className="ph-card__time">
                  <Clock className="ph-card__time-icon" />
                  <span>
                    {format(new Date(nextAppointment.date), "MMM d, yyyy")},{" "}
                    {nextAppointment.startTime}
                  </span>
                </div>
                <p className="ph-card__doctor">
                  Dr. {nextAppointment.doctor.firstName}{" "}
                  {nextAppointment.doctor.lastName}
                </p>
                <p className="ph-card__service">
                  {nextAppointment.doctor.specialization || "General Checkup"}
                </p>
              </>
            ) : (
              <p>No upcoming appointments</p>
            )}
          </div>
        </div>

        {/* Scans Card */}
        <div className="ph-card ph-card--scans">
          <div className="ph-card__header">
            <h3 className="ph-card__title">Recent Scans</h3>
            <Activity className="ph-card__icon ph-card__icon--activity" />
          </div>
          <div className="ph-card__content">
            <p className="ph-card__scan-count">{scanCount}</p>
            <p className="ph-card__scan-label">Scans this month</p>
            <div className="ph-progress-bar">
              <div
                className="ph-progress-bar__fill"
                style={{ width: `${(scanCount / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="ph-appointments">
        <h3 className="ph-appointments__title">Upcoming Appointments</h3>
        <div className="ph-appointments__list">
          {dashboardData.appointments.upcoming.length > 0 ? (
            dashboardData.appointments.upcoming.map((appointment, index) => (
              <div key={index} className="ph-appointment">
                <div className="ph-appointment__details">
                  <p className="ph-appointment__doctor">
                    Dr. {appointment.doctor.firstName}{" "}
                    {appointment.doctor.lastName}
                  </p>
                  <p className="ph-appointment__service">
                    {appointment.doctor.specialization || "General Checkup"}
                  </p>
                </div>
                <p className="ph-appointment__time">
                  {format(new Date(appointment.date), "MMM d, yyyy")},{" "}
                  {appointment.startTime}
                </p>
              </div>
            ))
          ) : (
            <p>No upcoming appointments</p>
          )}
        </div>
      </div>
    </div>
  );
}

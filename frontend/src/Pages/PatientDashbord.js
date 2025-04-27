import React, { useState, useEffect } from "react";
import "../Styles/PatientDashbord.css";
import { Calendar, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import Swal from "sweetalert2";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileResponse = await fetch(
          "http://localhost:4000/api/patients/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const profileData = await profileResponse.json();

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
        const scansData = await scansResponse.json();

        if (profileData.status === "success" && profileData.data) {
          const appointmentsData = profileData.data.profile?.appointments || [];

          // ترتيب المواعيد حسب التاريخ والساعة
          const sortedAppointments = appointmentsData.sort((a, b) => {
            const aDateTime = new Date(`${a.date}T${a.startTime}`);
            const bDateTime = new Date(`${b.date}T${b.startTime}`);
            return aDateTime - bDateTime;
          });

          setAppointments(sortedAppointments);
        }

        if (scansData.status === "success" && scansData.data?.scans) {
          setScans(scansData.data.scans);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "Failed to load dashboard data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) return null; // you can also add a loading spinner if you want

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;
  const scanCount = scans.length;

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
          {appointments.length > 0 ? (
            appointments.map((appointment, index) => (
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

// DoctorDashboard.jsx
import React from "react";
import { Users, Activity } from "lucide-react";
import "../Styles/DoctorDashboard.css";

export default function DoctorDashboard() {
  return (
    <div className="doctor-dashboard-container">
      <div className="doctor-dashboard-stats-grid">
        {/* Today's Patients Card */}
        <div className="doctor-dashboard-card">
          <div className="doctor-dashboard-card__header">
            <h3 className="doctor-dashboard-card__title">Today's Patients</h3>
            <Users className="doctor-dashboard-card__icon doctor-dashboard-card__icon--blue" />
          </div>
          <div className="doctor-dashboard-card__content">
            <p className="doctor-dashboard-card__value">12</p>
            <p className="doctor-dashboard-card__subtext">
              4 appointments remaining
            </p>
          </div>
        </div>

        {/* Scans Reviewed Card */}
        <div className="doctor-dashboard-card">
          <div className="doctor-dashboard-card__header">
            <h3 className="doctor-dashboard-card__title">Scans </h3>
            <Activity className="doctor-dashboard-card__icon doctor-dashboard-card__icon--blue" />
          </div>
          <div className="doctor-dashboard-card__content">
            <p className="doctor-dashboard-card__value">28</p>
          </div>
        </div>
      </div>

      {/* Today's Schedule Section */}
      <div className="doctor-dashboard-schedule">
        <h3 className="doctor-dashboard-schedule__title">Today's Schedule</h3>
        <div className="doctor-dashboard-schedule__list">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="doctor-dashboard-appointment">
              <div className="doctor-dashboard-appointment__details">
                <p className="doctor-dashboard-appointment__name">
                  {
                    [
                      "John Doe",
                      "Jane Smith",
                      "Mike Johnson",
                      "Sarah Williams",
                    ][i]
                  }
                </p>
              </div>
              <p className="doctor-dashboard-appointment__time">
                {["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"][i]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

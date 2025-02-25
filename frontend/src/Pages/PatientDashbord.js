// HomePage.jsx
import React from "react";
import "../Styles/PatientDashbord.css";
import { Calendar, Clock, Activity } from "lucide-react";

export default function PatientDashbord() {
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
            <div className="ph-card__time">
              <Clock className="ph-card__time-icon" />
              <span>Today, 2:30 PM</span>
            </div>
            <p className="ph-card__doctor">Dr. Sarah Wilson</p>
            <p className="ph-card__service">General Checkup</p>
          </div>
        </div>

        {/* Scans Card */}
        <div className="ph-card ph-card--scans">
          <div className="ph-card__header">
            <h3 className="ph-card__title">Recent Scans</h3>
            <Activity className="ph-card__icon ph-card__icon--activity" />
          </div>
          <div className="ph-card__content">
            <p className="ph-card__scan-count">5</p>
            <p className="ph-card__scan-label">Scans this month</p>
            <div className="ph-progress-bar">
              <div className="ph-progress-bar__fill"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Section */}
      <div className="ph-appointments">
        <h3 className="ph-appointments__title">Upcoming Appointments</h3>
        <div className="ph-appointments__list">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="ph-appointment">
              <div className="ph-appointment__details">
                <p className="ph-appointment__doctor">
                  Dr. {["Sarah Wilson", "John Smith", "Emily Brown"][i]}
                </p>
                <p className="ph-appointment__service">
                  {["General Checkup", "X-Ray Review", "Follow-up"][i]}
                </p>
              </div>
              <p className="ph-appointment__time">
                {["Today, 2:30 PM", "Tomorrow, 10:00 AM", "Next Week"][i]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

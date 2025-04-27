import React, { useEffect, useState } from "react";
import { Users, Activity } from "lucide-react";
import "../Styles/DoctorDashboard.css";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patientNames, setPatientNames] = useState({}); // تخزين أسماء المرضى
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  // دالة لجلب قائمة المواعيد
  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/doctors/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch appointments");

      const data = await response.json();
      console.log(data);
      if (data.status === "success" && data.data) {
        setAppointments(data.data.profile?.appointments || []);
      } else {
        setError("No appointments found");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Error fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  // دالة لجلب اسم المريض باستخدام الـ patientId
  const fetchPatientName = async (patientId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/patients/profile/${patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      console.log("Fetched patient data:", data); // إضافة هذا السطر
      if (data.status === "success" && data.data) {
        setPatientNames((prev) => ({
          ...prev,
          [patientId]: `${data.data.firstName} ${data.data.lastName}`,
        }));
      } else {
        setPatientNames((prev) => ({
          ...prev,
          [patientId]: "Unknown Patient",
        }));
      }
    } catch (error) {
      console.error("Error fetching patient name:", error);
      setPatientNames((prev) => ({
        ...prev,
        [patientId]: "Unknown Patient",
      }));
    }
  };

  useEffect(() => {
    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }
    fetchAppointments();
  }, []);

  // عندما تتغير قائمة المواعيد، استدعي دالة `fetchPatientName` لكل مريض
  useEffect(() => {
    if (appointments.length > 0) {
      appointments.forEach((appointment) => {
        if (!patientNames[appointment.patientId]) {
          fetchPatientName(appointment.patientId); // جلب اسم المريض باستخدام الـ patientId
        }
      });
    }
  }, [appointments, patientNames]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

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
            <p className="doctor-dashboard-card__value">
              {appointments.length}
            </p>
            <p className="doctor-dashboard-card__subtext">
              {appointments.length} appointments today
            </p>
          </div>
        </div>

        {/* Scans Reviewed Card */}
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

      {/* Today's Schedule Section */}
      <div className="doctor-dashboard-schedule">
        <h3 className="doctor-dashboard-schedule__title">Today's Schedule</h3>
        <div className="doctor-dashboard-schedule__list">
          {appointments.length === 0 ? (
            <p>No appointments today</p>
          ) : (
            appointments.map((appointment, index) => (
              <div key={index} className="doctor-dashboard-appointment">
                <div className="doctor-dashboard-appointment__details">
                  <p className="doctor-dashboard-appointment__name">
                    {patientNames[appointment.patientId] || "Loading..."}
                  </p>{" "}
                  {/* عرض اسم المريض هنا */}
                </div>
                <p className="doctor-dashboard-appointment__time">
                  {appointment.startTime} - {appointment.endTime}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

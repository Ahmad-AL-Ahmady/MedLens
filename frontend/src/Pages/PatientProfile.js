import { useEffect, useState } from "react";
import {
  Mail,
  Calendar,
  User,
  Activity,
  Stethoscope,
  ClipboardList,
  ScanBarcode,
} from "lucide-react";
import "../Styles/PatientProfile.css";

export default function PatientProfile() {
  const [patientData, setPatientData] = useState(null);
  const [scans, setScans] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No token found");
      setError("No token found");
      setLoading(false);
      return;
    }

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

        if (data.status === "success" && data.data?.profile) {
          setPatientData(data.data);
          setAppointments(data.data.profile.appointments || []);
        } else {
          setError("Failed to fetch patient data");
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchScans = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/api/medical-scans",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await response.json();
        if (data.status === "success") {
          setScans(data.data.scans || []);
        } else {
          setScans([]);
        }
      } catch (error) {
        console.error("Error fetching medical scans:", error);
        setScans([]);
      }
    };

    fetchProfile();
    fetchScans();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!patientData) return <p>No patient data available</p>;
  //console.log(" rendring Patient Data:", patientData);

  return (
    <div className="patient-profile">
      {/* Personal Data */}
      <div className="patient-profile-header">
        <img
          src={`http://localhost:4000/public/uploads/users/${patientData.avatar}`}
          alt="Profile"
          className="patient-profile-img"
        />
        <div className="patient-profile-info">
          <h1>{`${patientData.firstName} ${patientData.lastName}`}</h1>
          <p className="email">
            <Mail size={16} color="#1f61a8" />
            {patientData.email}
          </p>
          <div className="patient-extra-info">
            <p>
              <Calendar size={15} color="#505050" />
              {patientData.age} years
            </p>
            <p>
              <User size={15} color="#505050" /> {patientData.gender}
            </p>
            <p>
              <Activity size={15} color="#505050" /> Status:{" "}
              {patientData.userType}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="patient-profile-summary-cards">
        <div className="patient-profile-card">
          <Stethoscope size={16} color="#1f61a8" />
          <h3>{patientData.visits || 0}</h3>
          <p>Visits</p>
        </div>
        <div className="patient-profile-card">
          <Calendar size={16} color="green" />
          <h3>
            {patientData.patientSince
              ? `${patientData.patientSince} Years`
              : "N/A"}
          </h3>
          <p>Patient Since</p>
        </div>
        <div className="patient-profile-card">
          <ClipboardList size={16} color="green" />
          <h3>{patientData.reports || 0}</h3>
          <p>Reports</p>
        </div>
      </div>

      {/* Past Scans */}
      <div className="patient-profile-scan-section">
        <h2>
          <ScanBarcode size={15} color="#1f61a8" />
          Past Scans
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
                  <td>{scan?.date}</td>
                  <td>{scan?.type}</td>
                  <td>{scan?.bodyPart}</td>
                  <td className="patient-profile-status">{scan?.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No scans found for this patient.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Past Appointments */}
      <div className="patient-profile-scan-section">
        <h2>
          <Calendar size={15} color="#1f61a8" />
          Past Appointments
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
                  <td>{appointment?.date}</td>
                  <td>{appointment?.doctor}</td>
                  <td>{appointment?.department}</td>
                  <td>{appointment?.notes}</td>
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
  );
}

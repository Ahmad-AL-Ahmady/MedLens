import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PatientProfile() {
  const location = useLocation();
  const patient = location.state?.patient;
  const [scans, setScans] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return; // تأكد من وجود patientId قبل جلب البيانات

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/patients/${patientId}`
        );
        const data = await response.json();
        setPatientData(data);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchData();
  }, [patientId]); // تأكدي أن المتغيرات الضرورية فقط في الـ dependency array
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="patient-profile">
      <img src={patient.image} alt={patient.name} className="profile-img" />
      <h1>{patient.name}</h1>
      <p>Email: {patient.email}</p>
      <p>Born: {patient.dob}</p>
      <p>Status: {patient.status}</p>

      {/* Past Scans */}
      <div className="section">
        <h2>Past Scans</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Body Part</th>
              <th>Doctor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {scans.length > 0 ? (
              scans.map((scan) => (
                <tr key={scan.id}>
                  <td>{scan.date}</td>
                  <td>{scan.type}</td>
                  <td>{scan.bodyPart}</td>
                  <td>{scan.doctor}</td>
                  <td className="status">{scan.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No scans available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Past Appointments */}
      <div className="section">
        <h2>Past Appointments</h2>
        <table className="data-table">
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
                <tr key={appointment.id}>
                  <td>{appointment.date}</td>
                  <td>{appointment.doctor}</td>
                  <td>{appointment.department}</td>
                  <td>{appointment.notes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No appointments available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

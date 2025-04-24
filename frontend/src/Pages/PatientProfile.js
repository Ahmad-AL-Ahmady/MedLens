import { useEffect, useState } from "react";
import {
  Mail,
  Calendar,
  User,
  Activity,
  Stethoscope,
  ClipboardList,
  ScanBarcode,
  Edit,
} from "lucide-react";
import "../Styles/PatientProfile.css";

export default function PatientProfile() {
  const [patientData, setPatientData] = useState(null);
  const [scans, setScans] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
  });

  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No token found");
      setError("No token found");
      setLoading(false);
      return;
    }

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
      //console.log("Patient Data:", data);

      if (data.status === "success" && data.data?.profile) {
        setPatientData(data.data);
        setAppointments(data.data.profile.appointments || []);
        setFormData({
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          gender: data.data.gender,
          age: data.data.age,
        });
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //console.log("Form Data:", formData);
    if (!token) {
      console.error("No token found");
      setError("No token found");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/api/patients/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      alert("Profile updated successfully!");
      await fetchProfile();
      setShowEditForm(false);
    } catch (error) {
      alert("Error updating profile");
      console.error(error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!patientData) return <p>No patient data available</p>;
  //console.log(" rendring Patient Data:", patientData);

  return (
    <div className="patient-profile-container">
      {showEditForm ? (
        <div className="edit-patient-form-background">
          <div className="edit-patient-form-wrapperr">
            <form onSubmit={handleSubmit} className="edit-patient-profile-form">
              <h2>Edit Patient Profile</h2>
              <div>
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Gender</label>
                <select value={formData.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
              <div className="form-patient-profile-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="patient-profile">
          {/* Personal Data */}
          <div className="patient-profile-edit-icon">
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
              </div>{" "}
              <div className="patient-profile-edit-btn">
                <button
                  onClick={() => setShowEditForm(true)}
                  className="edit-patient-profile-button"
                >
                  <Edit size={15} color="white" />
                  Edit Profile
                </button>
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
                      <td>{appointment?.date?.split("T")[0]}</td>
                      <td>
                        {appointment?.doctor?.firstName}{" "}
                        {appointment?.doctor?.lastName}
                      </td>
                      <td>{appointment?.doctor?.specialization}</td>
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
      )}
    </div>
  );
}

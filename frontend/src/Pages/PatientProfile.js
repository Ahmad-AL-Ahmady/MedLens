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
import Swal from "sweetalert2";
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
      if (data.status === "success" && data.data) {
        setPatientData(data.data);
        setAppointments(data.data.profile?.appointments || []);
        setFormData({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          gender: data.data.gender || "",
          age: data.data.age || "",
        });
      } else {
        throw new Error("No profile data found");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error; // Let the caller handle the error
    }
  };

  const fetchScans = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/medical-scans", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      if (data.status === "success" && data.data?.scans) {
        setScans(data.data.scans);
      } else {
        setScans([]);
      }
    } catch (error) {
      console.error("Error fetching scans:", error);
      throw error; // Let the caller handle the error
    }
  };

  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Please Log In",
        text: "You need to log in to see your profile.",
      });
      setError("No token found");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      Swal.fire({
        title: "Loading Your Info...",
        text: "Please wait a moment",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        await Promise.all([fetchProfile(), fetchScans()]);
        Swal.close(); // Close the loading pop-up on success
      } catch (error) {
        setError(error.message || "Failed to load data");
        Swal.fire({
          icon: "error",
          title: "Oops!",
          text: "We couldn't load your info. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Please Log In",
        text: "You need to log in to update your profile.",
      });
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.gender ||
      !formData.age
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing Info",
        text: "Please fill in all fields to update your profile.",
      });
      return;
    }

    Swal.fire({
      title: "Saving Changes...",
      text: "Please wait while we update your profile",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

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

      await res.json();
      Swal.fire({
        icon: "success",
        title: "Changes Saved!",
        text: "Your profile has been updated.",
        timer: 1500,
        showConfirmButton: false,
      });
      await fetchProfile();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "We couldn't save your changes. Please try again.",
      });
    }
  };

  if (loading) return null; // Swal handles loading
  if (error) return null; // Swal handles errors
  if (!patientData) return null; // Swal handles no data

  return (
    <div className="patient-profile-container">
      {showEditForm ? (
        <div className="edit-patient-form-background">
          <div className="edit-patient-form-wrapperr">
            <form onSubmit={handleSubmit} className="edit-patient-profile-form">
              <h2>Update Your Profile</h2>
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
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
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
                <button type="submit">Save Changes</button>
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
              {patientData.avatar ? (
                <img
                  src={`http://localhost:4000/public/uploads/users/${patientData.avatar}`}
                  alt="Profile"
                  className="patient-profile-img"
                />
              ) : (
                <img
                  src="https://via.placeholder.com/100"
                  alt="Default Profile"
                  className="patient-profile-img"
                />
              )}
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
                      <td>{scan?.date || "N/A"}</td>
                      <td>{scan?.type || "N/A"}</td>
                      <td>{scan?.bodyPart || "N/A"}</td>
                      <td className="patient-profile-status">
                        {scan?.status || "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No scans found for this patient.</td>
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
                      <td>{appointment?.date?.split("T")[0] || "N/A"}</td>
                      <td>
                        {appointment?.doctor
                          ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                          : "N/A"}
                      </td>
                      <td>{appointment?.doctor?.specialization || "N/A"}</td>
                      <td>{appointment?.notes || "N/A"}</td>
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

import React, { useState, useEffect } from "react";
import { Activity, Plus, Edit2, X, Mail, Trash2 } from "lucide-react";
import "../Styles/PharmacyDashboard.css";

export default function PharmacyDashboard() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [addMode, setAddMode] = useState("new");
  const [medicines, setMedicines] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const authToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const fetchPharmacyProfile = async () => {
    if (!authToken) {
      setError("No token found");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:4000/api/pharmacies/profile",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pharmacy profile");
      }

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setPharmacy(data.data);
        setMedicines(data.data.profile?.inventory || []);
      } else {
        setError("Failed to fetch pharmacy data");
      }
    } catch (error) {
      setError("Error fetching pharmacy profile");
    }
  };

  const fetchMedications = async () => {
    try {
      const medicationsResponse = await fetch(
        "http://localhost:4000/api/medications",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!medicationsResponse.ok) {
        throw new Error("Failed to fetch medications");
      }
      const medicationsData = await medicationsResponse.json();
      setAllMedicines(medicationsData.data.medications || []);
    } catch (error) {
      setError("An error occurred while fetching medications");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPharmacyProfile(), fetchMedications()]);
      setLoading(false);
    };

    fetchData();
  }, [authToken]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const formData = new FormData(e.target);

    try {
      if (addMode === "new") {
        // Create new medication
        const name = formData.get("name");
        const strength = formData.get("strength");
        const description =
          formData.get("description") || `${name} ${strength}`;

        // Client-side validation
        if (!name.trim()) throw new Error("Name is required");
        if (!strength.trim()) throw new Error("Strength is required");

        const medicationResponse = await fetch(
          "http://localhost:4000/api/medications",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ name, description, strength }),
          }
        );

        if (!medicationResponse.ok) {
          const errorData = await medicationResponse.json();
          throw new Error(
            errorData.message || "Failed to create new medication"
          );
        }

        const medicationData = await medicationResponse.json();
        // Update allMedicines to include the new medication
        setAllMedicines([...allMedicines, medicationData.data.medication]);
        setSuccess("Medication created successfully!");
      } else {
        // Add existing medication to inventory
        const medicationId = formData.get("medicineId");
        const price = parseFloat(formData.get("price"));
        const stock = parseInt(formData.get("stock"));
        const expiryDate = formData.get("expiryDate");

        // Client-side validation
        if (!medicationId) throw new Error("Please select a medicine");
        if (price <= 0) throw new Error("Price must be positive");
        if (stock < 0) throw new Error("Stock cannot be negative");

        const inventoryResponse = await fetch(
          "http://localhost:4000/api/pharmacies/inventory",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              medicationId,
              stock,
              price,
              expiryDate,
            }),
          }
        );

        if (!inventoryResponse.ok) {
          const errorData = await inventoryResponse.json();
          throw new Error(errorData.message || "Failed to add to inventory");
        }

        // Refresh pharmacy profile
        await fetchPharmacyProfile();
        setSuccess("Medicine added to inventory successfully!");
      }

      setShowAddForm(false);
    } catch (error) {
      setError(
        error.message || "An error occurred while processing the request"
      );
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.target);
    const price = parseFloat(formData.get("price"));
    const isAvailable = formData.get("available") !== "on";
    const stock = isAvailable ? parseInt(formData.get("stock")) : 0;
    const expiryDate = formData.get("expiryDate");

    try {
      const updateData = {
        medicationId: editingMedicine.medication._id,
        stock,
        price,
        expiryDate,
      };

      const response = await fetch(
        "http://localhost:4000/api/pharmacies/inventory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update inventory");
      }

      await fetchPharmacyProfile();
      setEditingMedicine(null);
      setSuccess("Inventory updated successfully!");
    } catch (error) {
      setError(
        error.message || "An error occurred while updating the inventory"
      );
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleDelete = async (medicationId) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      setError(null);
      setSubmitting(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/pharmacies/inventory/${medicationId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete medicine");
        }

        await fetchPharmacyProfile();
        setSuccess("Medicine deleted successfully!");
      } catch (error) {
        setError(
          error.message || "An error occurred while deleting the medicine"
        );
      } finally {
        setSubmitting(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!pharmacy) {
    return <p>No pharmacy profile found.</p>;
  }

  return (
    <div className="pharmacy-dashboard-container">
      <div className="pharmacy-dashboard-profile-header">
        <img
          src={
            pharmacy.avatar
              ? `http://localhost:4000/public/uploads/users/${pharmacy.avatar}`
              : "https://via.placeholder.com/80"
          }
          alt="Pharmacy Avatar"
          className="pharmacy-dashboard-profile-image"
          onError={(e) => (e.target.src = "https://via.placeholder.com/80")}
        />
        <div className="pharmacy-dashboard-profile-info">
          <h1 className="pharmacy-dashboard-profile-name">
            {pharmacy.firstName} {pharmacy.lastName}
          </h1>
          <p className="pharmacy-dashboard-profile-email">
            <Mail size={16} color="#1e56cf" />
            {pharmacy.email}
          </p>
        </div>
      </div>

      <div className="pharmacy-dashboard-stats-grid">
        <div className="pharmacy-dashboard-card">
          <div className="pharmacy-dashboard-card__header">
            <h3 className="pharmacy-dashboard-card__title">Inventory Status</h3>
            <div className="pharmacy-dashboard-card__icon pharmacy-dashboard-card__icon--blue" />
          </div>
          <div className="pharmacy-dashboard-card__content">
            <p className="pharmacy-dashboard-card__value">{medicines.length}</p>
            <p className="pharmacy-dashboard-card__subtext">Items in stock</p>
          </div>
        </div>
        <div className="pharmacy-dashboard-card">
          <div className="pharmacy-dashboard-card__header">
            <h3 className="pharmacy-dashboard-card__title">Low Stock Alert</h3>
            <Activity className="pharmacy-dashboard-card__icon pharmacy-dashboard-card__icon--orange" />
          </div>
          <div className="pharmacy-dashboard-card__content">
            <p className="pharmacy-dashboard-card__value pharmacy-dashboard-card__value--warning">
              {medicines.filter((m) => m.stock < 10).length}
            </p>
            <p className="pharmacy-dashboard-card__subtext">
              Items need restock
            </p>
          </div>
        </div>
      </div>

      <div className="pharmacy-dashboard-section">
        <div className="pharmacy-dashboard-header">
          <h2 className="pharmacy-dashboard-title">Manage Medicines</h2>
          <button
            className="pharmacy-dashboard-add-button"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            <span>Add Medicine</span>
          </button>
        </div>
        <table className="pharmacy-dashboard-table">
          <thead>
            <tr className="pharmacy-dashboard-table-header">
              <th className="pharmacy-dashboard-table-heading">NAME</th>
              <th className="pharmacy-dashboard-table-heading">DESCRIPTION</th>
              <th className="pharmacy-dashboard-table-heading">STRENGTH</th>
              <th className="pharmacy-dashboard-table-heading">STOCK</th>
              <th className="pharmacy-dashboard-table-heading">PRICE</th>
              <th className="pharmacy-dashboard-table-heading">EXPIRY DATE</th>
              <th className="pharmacy-dashboard-table-heading">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine._id} className="pharmacy-dashboard-table-row">
                <td className="pharmacy-dashboard-table-data">
                  {medicine.medication?.name || "N/A"}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  {medicine.medication?.description || "N/A"}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  {medicine.medication?.strength || "N/A"}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  {medicine.stock}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  ${medicine.price.toFixed(2)}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  {medicine.expiryDate || "N/A"}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  <button
                    className="pharmacy-dashboard-edit-button"
                    onClick={() => setEditingMedicine(medicine)}
                  >
                    <Edit2 className="pharmacy-dashboard-edit-icon" size={18} />
                  </button>
                  <button
                    className="pharmacy-dashboard-delete-button"
                    onClick={() => handleDelete(medicine.medication._id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingMedicine && (
        <div className="pharmacy-dashboard-form-overlay">
          <div className="pharmacy-dashboard-form-container">
            <div className="pharmacy-dashboard-form-header">
              <h2>Edit {editingMedicine.medication?.name || "Medicine"}</h2>
              <button
                className="pharmacy-dashboard-form-close"
                onClick={() => setEditingMedicine(null)}
              >
                <X size={24} />
              </button>
            </div>
            <form
              className="pharmacy-dashboard-form-content"
              onSubmit={handleEditSubmit}
            >
              {error && <div className="pharmacy-dashboard-error">{error}</div>}
              {success && (
                <div className="pharmacy-dashboard-success">{success}</div>
              )}
              <div className="pharmacy-dashboard-form-column">
                <div className="pharmacy-dashboard-form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    defaultValue={editingMedicine.price}
                    required
                  />
                </div>
                <div className="pharmacy-dashboard-form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingMedicine.stock}
                    disabled={editingMedicine.stock === 0}
                    required
                  />
                </div>
                <div className="pharmacy-dashboard-form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    defaultValue={
                      editingMedicine.expiryDate
                        ? editingMedicine.expiryDate.split("T")[0]
                        : ""
                    }
                  />
                </div>
              </div>
              <div className="pharmacy-dashboard-form-fullwidth">
                <div className="pharmacy-dashboard-form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="available"
                      defaultChecked={editingMedicine.stock === 0}
                      onChange={(e) => {
                        const stockInput = e.target.form.elements.stock;
                        stockInput.disabled = e.target.checked;
                        if (e.target.checked) stockInput.value = 0;
                      }}
                    />
                    Mark as Unavailable
                  </label>
                </div>
              </div>
              <div className="pharmacy-dashboard-form-actions">
                <button
                  type="button"
                  className="pharmacy-dashboard-form-cancel"
                  onClick={() => setEditingMedicine(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pharmacy-dashboard-form-submit"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="pharmacy-dashboard-form-overlay">
          <div className="pharmacy-dashboard-form-container">
            <div className="pharmacy-dashboard-form-header">
              <h2>Add Medicine</h2>
              <button
                className="pharmacy-dashboard-form-close"
                onClick={() => setShowAddForm(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form
              className="pharmacy-dashboard-form-content"
              onSubmit={handleAddSubmit}
            >
              {error && <div className="pharmacy-dashboard-error">{error}</div>}
              {success && (
                <div className="pharmacy-dashboard-success">{success}</div>
              )}
              <div className="pharmacy-dashboard-form-group pharmacy-dashboard-form-group--radio">
                <label>
                  <input
                    type="radio"
                    name="addMode"
                    value="new"
                    checked={addMode === "new"}
                    onChange={() => setAddMode("new")}
                  />
                  <span>Add New Medicine Manually</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="addMode"
                    value="existing"
                    checked={addMode === "existing"}
                    onChange={() => setAddMode("existing")}
                  />
                  <span>Add from Database</span>
                </label>
              </div>

              {addMode === "new" && (
                <>
                  <div className="pharmacy-dashboard-form-column">
                    <div className="pharmacy-dashboard-form-group">
                      <label>Name</label>
                      <input type="text" name="name" required />
                    </div>
                    <div className="pharmacy-dashboard-form-group">
                      <label>Strength</label>
                      <input type="text" name="strength" required />
                    </div>
                  </div>
                  <div className="pharmacy-dashboard-form-group pharmacy-dashboard-form-fullwidth">
                    <label>Description</label>
                    <input type="text" name="description" />
                  </div>
                </>
              )}

              {addMode === "existing" && (
                <>
                  <div className="pharmacy-dashboard-form-group">
                    <label>Medicine</label>
                    <select
                      name="medicineId"
                      className="pharmacy-dashboard-select"
                      required
                    >
                      <option value="">Select Medicine</option>
                      {allMedicines.map((med) => (
                        <option key={med._id} value={med._id}>
                          {med.name} ({med.strength})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="pharmacy-dashboard-form-column">
                    <div className="pharmacy-dashboard-form-group">
                      <label>Price</label>
                      <input type="number" step="0.01" name="price" required />
                    </div>
                    <div className="pharmacy-dashboard-form-group">
                      <label>Stock</label>
                      <input type="number" name="stock" required />
                    </div>
                    <div className="pharmacy-dashboard-form-group">
                      <label>Expiry Date</label>
                      <input type="date" name="expiryDate" required />
                    </div>
                  </div>
                </>
              )}

              <div className="pharmacy-dashboard-form-actions">
                <button
                  type="button"
                  className="pharmacy-dashboard-form-cancel"
                  onClick={() => setShowAddForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pharmacy-dashboard-form-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Processing..."
                    : addMode === "new"
                    ? "Create Medicine"
                    : "Add Medicine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const [error, setError] = useState(null);

  const authToken =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const fetchPharmacyProfile = async () => {
    if (!authToken) {
      console.error("No token found");
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
      console.log("PHARMACY ", data);
      if (data.status === "success" && data.data) {
        setPharmacy(data.data);
        setMedicines(data.data.profile?.inventory || []);
      } else {
        setError("Failed to fetch pharmacy data");
      }
    } catch (error) {
      console.error("Error fetching pharmacy profile:", error);
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
      console.error("Error fetching medications:", error);
      setError(error.message || "An error occurred while fetching medications");
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

  const availableMedicines = allMedicines.filter(
    (med) =>
      !medicines.some((m) => m.medication._id.toString() === med._id.toString())
  );

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target);
    const price = parseFloat(formData.get("price"));
    const stock = parseInt(formData.get("stock"));
    const expiryDate = formData.get("expiryDate");

    try {
      let medication;
      if (addMode === "new") {
        const name = formData.get("name");
        const strength = formData.get("strength");
        const description =
          formData.get("description") || `${name} ${strength}`;
        medication = { name, description, strength };
      } else {
        const medicationId = formData.get("medicineId");
        const selectedMedicine = allMedicines.find(
          (med) => med._id === medicationId
        );
        if (!selectedMedicine) {
          throw new Error("Selected medicine not found");
        }
        medication = {
          _id: selectedMedicine._id,
          name: selectedMedicine.name,
          description: selectedMedicine.description,
          strength: selectedMedicine.strength,
        };
      }

      // Prepare the new inventory item
      const newInventoryItem = {
        medication,
        stock,
        price,
        expiryDate,
      };

      // Update the profile with the new inventory item
      const updatedProfile = {
        ...pharmacy,
        profile: {
          ...pharmacy.profile,
          inventory: [...medicines, newInventoryItem],
        },
      };

      const response = await fetch(
        "http://localhost:4000/api/pharmacies/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add medicine to profile");
      }

      const data = await response.json();
      if (data.status === "success") {
        await fetchPharmacyProfile(); // Refresh data
        setShowAddForm(false);
        if (addMode === "new") {
          // Optionally update allMedicines if a new medicine was added
          setAllMedicines([...allMedicines, medication]);
        }
      } else {
        throw new Error("Failed to update profile with new medicine");
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
      setError(error.message || "An error occurred while adding the medicine");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target);
    const updatedMedicine = {
      price: parseFloat(formData.get("price")),
      stock:
        formData.get("available") === "on"
          ? 0
          : parseInt(formData.get("stock")),
    };

    try {
      // Update the specific medicine in the inventory
      const updatedInventory = medicines.map((med) =>
        med._id === editingMedicine._id
          ? {
              ...med,
              price: updatedMedicine.price,
              stock: updatedMedicine.stock,
            }
          : med
      );

      // Prepare the updated profile
      const updatedProfile = {
        ...pharmacy,
        profile: {
          ...pharmacy.profile,
          inventory: updatedInventory,
        },
      };

      const response = await fetch(
        "http://localhost:4000/api/pharmacies/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update medicine in profile");
      }

      const data = await response.json();
      if (data.status === "success") {
        await fetchPharmacyProfile(); // Refresh data
        setEditingMedicine(null);
      } else {
        throw new Error("Failed to update medicine in profile");
      }
    } catch (error) {
      console.error("Error updating medicine:", error);
      setError(
        error.message || "An error occurred while updating the medicine"
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/inventory/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete medicine");
        }
        await fetchPharmacyProfile();
      } catch (error) {
        console.error("Error deleting medicine:", error);
        setError(
          error.message || "An error occurred while deleting the medicine"
        );
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!pharmacy) {
    console.log("No profile found:", pharmacy);
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
                  {medicine.expiryDate}
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
                    onClick={() => handleDelete(medicine._id)}
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pharmacy-dashboard-form-submit"
                >
                  Save Changes
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
                <div className="pharmacy-dashboard-form-group">
                  <label>Medicine</label>
                  <select
                    name="medicineId"
                    className="pharmacy-dashboard-select"
                    required
                  >
                    <option value="">Select Medicine</option>
                    {availableMedicines.map((med) => (
                      <option key={med._id} value={med._id}>
                        {med.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

              <div className="pharmacy-dashboard-form-actions">
                <button
                  type="button"
                  className="pharmacy-dashboard-form-cancel"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pharmacy-dashboard-form-submit"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

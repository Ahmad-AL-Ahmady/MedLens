import React, { useState } from "react";
import { Activity, Plus, Edit2, X } from "lucide-react";
import "../Styles/PharmacyDashboard.css";

export default function PharmacyDashboard() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [addMode, setAddMode] = useState("new");
  const [medicines, setMedicines] = useState([
    {
      _id: "1",
      medication: {
        _id: "m1",
        name: "Amoxicillin",
        category: "Antibiotics",
        strength: "500mg",
        description: "Amoxicillin 500mg capsules",
      },
      stock: 100,
      price: 12.99,
      expiryDate: "2026-04-01",
    },
    {
      _id: "2",
      medication: {
        _id: "m2",
        name: "Ibuprofen",
        category: "Pain Relief",
        strength: "200mg",
        description: "Ibuprofen 200mg tablets",
      },
      stock: 50,
      price: 8.49,
      expiryDate: "2025-12-15",
    },
    {
      _id: "3",
      medication: {
        _id: "m3",
        name: "Lisinopril",
        category: "Cardiology",
        strength: "10mg",
        description: "Lisinopril 10mg tablets",
      },
      stock: 75,
      price: 15.75,
      expiryDate: "2026-03-10",
    },
    {
      _id: "4",
      medication: {
        _id: "m4",
        name: "Hydrocortisone",
        category: "Dermatology",
        strength: "1% cream",
        description: "Hydrocortisone 1% cream",
      },
      stock: 20,
      price: 9.99,
      expiryDate: "2025-11-20",
    },
    {
      _id: "5",
      medication: {
        _id: "m5",
        name: "Paracetamol",
        category: "Pediatrics",
        strength: "120mg/5ml",
        description: "Paracetamol 120mg/5ml syrup",
      },
      stock: 30,
      price: 6.99,
      expiryDate: "2025-10-05",
    },
  ]);
  const [allMedicines, setAllMedicines] = useState([
    {
      _id: "m1",
      name: "Amoxicillin",
      category: "Antibiotics",
      strength: "500mg",
      description: "Amoxicillin 500mg capsules",
    },
    {
      _id: "m2",
      name: "Ibuprofen",
      category: "Pain Relief",
      strength: "200mg",
      description: "Ibuprofen 200mg tablets",
    },
    {
      _id: "m3",
      name: "Lisinopril",
      category: "Cardiology",
      strength: "10mg",
      description: "Lisinopril 10mg tablets",
    },
    {
      _id: "m4",
      name: "Hydrocortisone",
      category: "Dermatology",
      strength: "1% cream",
      description: "Hydrocortisone 1% cream",
    },
    {
      _id: "m5",
      name: "Paracetamol",
      category: "Pediatrics",
      strength: "120mg/5ml",
      description: "Paracetamol 120mg/5ml syrup",
    },
    {
      _id: "m6",
      name: "Metformin",
      category: "Endocrinology",
      strength: "500mg",
      description: "Metformin 500mg tablets",
    },
    {
      _id: "m7",
      name: "Salbutamol",
      category: "Respiratory",
      strength: "100mcg",
      description: "Salbutamol 100mcg inhaler",
    },
  ]);
  const [categories] = useState([
    "Antibiotics",
    "Pain Relief",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Endocrinology",
    "Respiratory",
  ]);
  const [error, setError] = useState(null);

  // Filter medicines not already in inventory for the "existing" mode dropdown
  const availableMedicines = allMedicines.filter(
    (med) =>
      !medicines.some((m) => m.medication._id.toString() === med._id.toString())
  );

  // Handle submission for adding a new or existing medicine
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target);
    const price = parseFloat(formData.get("price"));
    const stock = parseInt(formData.get("stock"));
    let medicationId;

    try {
      if (addMode === "new") {
        // Simulate creating a new medication
        const name = formData.get("name");
        const category = formData.get("category");
        const strength = formData.get("strength");
        const description =
          formData.get("description") || `${name} ${strength}`;
        const newMedication = {
          _id: `m${allMedicines.length + 1}`,
          name,
          description,
          strength,
          category,
        };
        setAllMedicines([...allMedicines, newMedication]);
        medicationId = newMedication._id;
      } else {
        // Use existing medication ID
        medicationId = formData.get("medicineId");
      }

      // Add to inventory
      const newInventoryItem = {
        _id: `i${medicines.length + 1}`,
        medication: allMedicines.find((m) => m._id === medicationId),
        stock,
        price,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      };
      setMedicines([...medicines, newInventoryItem]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding medicine:", error);
      setError(error.message || "An error occurred while adding the medicine");
    }
  };

  // Handle submission for editing an existing medicine
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
      const updatedInventoryItem = {
        ...editingMedicine,
        price: updatedMedicine.price,
        stock: updatedMedicine.stock,
      };
      setMedicines(
        medicines.map((m) =>
          m._id === editingMedicine._id ? updatedInventoryItem : m
        )
      );
      setEditingMedicine(null);
    } catch (error) {
      console.error("Error updating medicine:", error);
      setError(
        error.message || "An error occurred while updating the medicine"
      );
    }
  };

  return (
    <div className="pharmacy-dashboard-container">
      {/* Stats Section */}
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

      {/* Medicines Table */}
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
              <th className="pharmacy-dashboard-table-heading">CATEGORY</th>
              <th className="pharmacy-dashboard-table-heading">STRENGTH</th>
              <th className="pharmacy-dashboard-table-heading">STOCK</th>
              <th className="pharmacy-dashboard-table-heading">PRICE</th>
              <th className="pharmacy-dashboard-table-heading">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine._id} className="pharmacy-dashboard-table-row">
                <td className="pharmacy-dashboard-table-data">
                  {medicine.medication.name}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  {medicine.medication.category || "N/A"}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  {medicine.medication.strength}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  {medicine.stock}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  ${medicine.price.toFixed(2)}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  <button
                    className="pharmacy-dashboard-edit-button"
                    onClick={() => setEditingMedicine(medicine)}
                  >
                    <Edit2 className="pharmacy-dashboard-edit-icon" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Medicine Form */}
      {editingMedicine && (
        <div className="pharmacy-dashboard-form-overlay">
          <div className="pharmacy-dashboard-form-container">
            <div className="pharmacy-dashboard-form-header">
              <h2>Edit {editingMedicine.medication.name}</h2>
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
                <div class Ted className="pharmacy-dashboard-form-group">
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

      {/* Add Medicine Form */}
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
                <div className="pharmacy-dashboard-form-column">
                  <div className="pharmacy-dashboard-form-group">
                    <label>Name</label>
                    <input type="text" name="name" required />
                  </div>
                  <div className="pharmacy-dashboard-form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      className="pharmacy-dashboard-select"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="pharmacy-dashboard-form-group">
                    <label>Strength</label>
                    <input type="text" name="strength" required />
                  </div>
                  <div className="pharmacy-dashboard-form-group">
                    <label>Description</label>
                    <input type="text" name="description" />
                  </div>
                </div>
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
                        {med.name} - {med.strength} ({med.category || "N/A"})
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

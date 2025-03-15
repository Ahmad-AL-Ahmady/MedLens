// PharmacyDashboard.jsx
import React, { useState } from "react";
import { Activity, Plus, Edit2, X } from "lucide-react";
import "../Styles/PharmacyDashboard.css";

export default function PharmacyDashboard() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "Amoxicillin",
      category: "Antibiotics",
      stock: 150,
      price: 15.99,
    },
    {
      id: 2,
      name: "Ibuprofen",
      category: "Pain Relief",
      stock: 200,
      price: 8.99,
    },
  ]);
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedMedicine = {
      ...editingMedicine,
      price: parseFloat(formData.get("price")),
      stock:
        formData.get("available") === "on"
          ? 0
          : parseInt(formData.get("stock")),
    };

    setMedicines(
      medicines.map((m) => (m.id === updatedMedicine.id ? updatedMedicine : m))
    );
    setEditingMedicine(null);
  };
  return (
    <div className="pharmacy-dashboard-container">
      <div className="pharmacy-dashboard-stats-grid">
        {/* Inventory Card */}
        <div className="pharmacy-dashboard-card">
          <div className="pharmacy-dashboard-card__header">
            <h3 className="pharmacy-dashboard-card__title">Inventory Status</h3>
            <div className="pharmacy-dashboard-card__icon pharmacy-dashboard-card__icon--blue" />
          </div>
          <div className="pharmacy-dashboard-card__content">
            <p className="pharmacy-dashboard-card__value">1,234</p>
            <p className="pharmacy-dashboard-card__subtext">Items in stock</p>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="pharmacy-dashboard-card">
          <div className="pharmacy-dashboard-card__header">
            <h3 className="pharmacy-dashboard-card__title">Low Stock Alert</h3>
            <Activity className="pharmacy-dashboard-card__icon pharmacy-dashboard-card__icon--orange" />
          </div>
          <div className="pharmacy-dashboard-card__content">
            <p className="pharmacy-dashboard-card__value pharmacy-dashboard-card__value--warning">
              8
            </p>
            <p className="pharmacy-dashboard-card__subtext">
              Items need restock
            </p>
          </div>
        </div>
      </div>

      {/* Medications Section */}
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
              <th className="pharmacy-dashboard-table-heading">STOCK</th>
              <th className="pharmacy-dashboard-table-heading">PRICE</th>
              <th className="pharmacy-dashboard-table-heading">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine.id} className="pharmacy-dashboard-table-row">
                <td className="pharmacy-dashboard-table-data">
                  {medicine.name}
                </td>
                <td className="pharmacy-dashboard-table-data">
                  {medicine.category}
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

      {/* Edit Medicine Form Overlay */}
      {editingMedicine && (
        <div className="pharmacy-dashboard-form-overlay">
          <div className="pharmacy-dashboard-form-container">
            <div className="pharmacy-dashboard-form-header">
              <h2>Edit {editingMedicine.name}</h2>
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

      {/* Add Medicine Form Overlay */}
      {showAddForm && (
        <div className="pharmacy-dashboard-form-overlay">
          <div className="pharmacy-dashboard-form-container">
            <div className="pharmacy-dashboard-form-header">
              <h2>Add New Medicine</h2>
              <button
                className="pharmacy-dashboard-form-close"
                onClick={() => setShowAddForm(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form className="pharmacy-dashboard-form-content">
              <div className="pharmacy-dashboard-form-column">
                <div className="pharmacy-dashboard-form-group">
                  <label>Name</label>
                  <input type="text" required />
                </div>
                <div className="pharmacy-dashboard-form-group floating-label">
                  <select id="category" className="pharmacy-dashboard-select">
                    <option value="">Select Category</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                  <label htmlFor="category">Category</label>
                </div>
              </div>

              <div className="pharmacy-dashboard-form-column">
                <div className="pharmacy-dashboard-form-group">
                  <label>Price</label>
                  <input type="number" step="0.01" required />
                </div>
                <div className="pharmacy-dashboard-form-group">
                  <label>Stock</label>
                  <input type="number" required />
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

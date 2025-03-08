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
        <div className="medications-header">
          <h2 className="section-title">Manage Medicines</h2>
          <button
            className="add-medicine-btn"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            <span>Add Medicine</span>
          </button>
        </div>

        <table className="medicines-table">
          <thead>
            <tr className="table-header-row">
              <th className="table-header">NAME</th>
              <th className="table-header">CATEGORY</th>
              <th className="table-header">STOCK</th>
              <th className="table-header">PRICE</th>
              <th className="table-header">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine.id} className="table-row">
                <td className="table-data">{medicine.name}</td>
                <td className="table-data">{medicine.category}</td>
                <td className="table-data">{medicine.stock}</td>
                <td className="table-data">${medicine.price.toFixed(2)}</td>
                <td className="table-data">
                  <button
                    className="edit-button"
                    onClick={() => setEditingMedicine(medicine)}
                  >
                    <Edit2 className="edit-icon" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Medicine Form Overlay */}
      {editingMedicine && (
        <div className="medcien-add-form-overlay">
          <div className="medcien-add-form-container">
            <div className="medcien-add-form-header">
              <h2>Edit {editingMedicine.name}</h2>
              <button
                className="medcien-add-form-close"
                onClick={() => setEditingMedicine(null)}
              >
                <X size={24} />
              </button>
            </div>

            <form
              className="medcien-add-form-content"
              onSubmit={handleEditSubmit}
            >
              <div className="medcien-form-column">
                <div className="medcien-form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    defaultValue={editingMedicine.price}
                    required
                  />
                </div>

                <div className="medcien-form-group">
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

              <div className="medcien-form-fullwidth">
                <div className="medcien-form-group availability-toggle">
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

              <div className="medcien-form-actions">
                <button
                  type="button"
                  className="medcien-form-cancel"
                  onClick={() => setEditingMedicine(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="medcien-form-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Medicine Form Overlay */}
      {showAddForm && (
        <div className="medcien-add-form-overlay">
          <div className="medcien-add-form-container">
            <div className="medcien-add-form-header">
              <h2>Add New Medicine</h2>
              <button
                className="medcien-add-form-close"
                onClick={() => setShowAddForm(false)}
              >
                <Plus size={24} />
              </button>
            </div>

            <form className="medcien-add-form-content">
              <div className="medcien-form-column">
                <div className="medcien-form-group">
                  <label>Name</label>
                  <input type="text" required />
                </div>
                <div className="medcien-form-group">
                  <label>Category</label>
                  <input type="text" required />
                </div>
              </div>

              <div className="medcien-form-column">
                <div className="medcien-form-group">
                  <label>Price</label>
                  <input type="number" step="0.01" required />
                </div>
                <div className="medcien-form-group">
                  <label>Stock</label>
                  <input type="number" required />
                </div>
              </div>

              <div className="medcien-form-actions">
                <button
                  type="button"
                  className="medcien-form-cancel"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="medcien-form-submit">
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

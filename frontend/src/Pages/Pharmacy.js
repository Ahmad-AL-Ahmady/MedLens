import React, { useState } from "react";
import "../Styles/Pharmacy.css";
import { useNavigate } from "react-router-dom";
export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const medicines = [
    {
      name: "Amoxicillin",
      category: "Antibiotics",
      description: "Antibiotic medication used to treat bacterial infections",
      price: "From $15.99",
      stock: "150 in stock",
    },
    {
      name: "Ibuprofen",
      category: "Pain Relief",
      description: "Pain reliever and fever reducer",
      price: "From $8.99",
      stock: "200 in stock",
    },
    {
      name: "Omeprazole",
      category: "Antacids",
      description: "Treats stomach acid problems",
      price: "From $12.99",
      stock: "90 in stock",
    },
    {
      name: "Cetirizine",
      category: "Antihistamines",
      description: "Relieves allergy symptoms",
      price: "From $10.50",
      stock: "120 in stock",
    },
  ];

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pharmacy-page">
      <h1 className="pharmacy-page__title">Search for medicines</h1>

      <div className="pharmacy-page__search-container">
        <input
          type="text"
          placeholder="Search medicine or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pharmacy-page__search-input"
        />
      </div>

      <div className="pharmacy-page__medicine-grid">
        {filteredMedicines.map((medicine) => (
          <div
            key={medicine.id}
            className="pharmacy-page__medicine-card"
            onClick={() => navigate(`/medicines/${medicine.id}`)}
            role="button"
            tabIndex={0}
          >
            <div className="pharmacy-page__medicine-header">
              <h2 className="pharmacy-page__medicine-name">{medicine.name}</h2>
              <span className="pharmacy-page__medicine-category">
                {medicine.category}
              </span>
            </div>
            <p className="pharmacy-page__medicine-description">
              {medicine.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

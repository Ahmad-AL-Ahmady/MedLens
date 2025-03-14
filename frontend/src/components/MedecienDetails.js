import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../Styles/Medeciendetails.css";

export default function MedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // In real app, fetch from API using the id
  const medicine = {
    id: 1,
    name: "Amoxicillin",
    category: "Antibiotics",
    description: "Antibiotic medication used to treat bacterial infections",
    pharmacies: [
      {
        name: "Central Pharmacy",
        distance: "0.5 miles away",
        stock: 45,
        address: "123 Medical St, City",
        price: 15.99,
      },
      {
        name: "MediCare Plus",
        distance: "1.2 miles away",
        stock: 30,
        address: "456 Health Ave, City",
        price: 17.99,
      },
      {
        name: "HealthPlus Pharmacy",
        distance: "0.8 miles away",
        stock: 25,
        address: "789 Wellness Rd, City",
        price: 16.49,
      },
      {
        name: "QuickCare Drugs",
        distance: "2.1 miles away",
        stock: 50,
        address: "321 Care Blvd, City",
        price: 14.99,
      },
      {
        name: "City Health Center",
        distance: "1.5 miles away",
        stock: 15,
        address: "654 Treatment Ln, City",
        price: 18.25,
      },
    ],
  };

  return (
    <div className="medecien-details">
      <button
        className="medecien-details__back-button"
        onClick={() => navigate(-1)}
      >
        ← Back to medicines
      </button>

      <div className="medecien-details__header">
        <h1 className="medecien-details__title">{medicine.name}</h1>
        <span className="medecien-details__category">{medicine.category}</span>
      </div>

      <p className="medecien-details__description">{medicine.description}</p>

      <h2 className="medecien-details__subtitle">
        Available at Nearby Pharmacies
      </h2>

      <div className="medecien-details__pharmacy-list">
        {medicine.pharmacies.map((pharmacy, index) => (
          <div key={index} className="medecien-details__pharmacy-item">
            <div className="medecien-details__pharmacy-info">
              <h3 className="medecien-details__pharmacy-name">
                {pharmacy.name}
              </h3>
              <p className="medecien-details__pharmacy-distance">
                {pharmacy.distance} • {pharmacy.stock} in stock
              </p>
              <p className="medecien-details__pharmacy-address">
                {pharmacy.address}
              </p>
            </div>

            <div className="medecien-details__pharmacy-pricing">
              <span className="medecien-details__pharmacy-price">
                ${pharmacy.price.toFixed(2)}
              </span>
              <button className="medecien-details__view-map-button">
                View Map
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

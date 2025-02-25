// PharmacyDashboard.jsx
import React from "react";
import { Activity } from "lucide-react";
import "../Styles/PharmacyDashboard.css";

export default function PharmacyDashboard() {
  return (
    <div className="pharmacy-dashboard-container">
      <div className="pharmacy-dashboard-stats-grid">
        {/* Total Sales Card */}
        <div className="pharmacy-dashboard-card">
          <div className="pharmacy-dashboard-card__header">
            <h3 className="pharmacy-dashboard-card__title">Total Sales</h3>
            <div className="pharmacy-dashboard-card__icon pharmacy-dashboard-card__icon--blue" />
          </div>
          <div className="pharmacy-dashboard-card__content">
            <p className="pharmacy-dashboard-card__value">$2,845</p>
            <p className="pharmacy-dashboard-card__trend pharmacy-dashboard-card__trend--positive">
              ↑ 12% from last week
            </p>
          </div>
        </div>

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
      <div className="pharmacy-dashboard-medications">
        <h3 className="pharmacy-dashboard-medications__title">
          Popular Medications
        </h3>
        <div className="pharmacy-dashboard-medications__list">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="pharmacy-dashboard-medication">
              <div className="pharmacy-dashboard-medication__details">
                <p className="pharmacy-dashboard-medication__name">
                  {["Amoxicillin", "Ibuprofen", "Omeprazole", "Cetirizine"][i]}
                </p>
                <p className="pharmacy-dashboard-medication__dosage">
                  {
                    [
                      "250mg Capsules",
                      "400mg Tablets",
                      "20mg Capsules",
                      "10mg Tablets",
                    ][i]
                  }
                </p>
              </div>
              <div className="pharmacy-dashboard-medication__stats">
                <p className="pharmacy-dashboard-medication__sales">
                  {["124", "98", "76", "65"][i]} units sold
                </p>
                <p
                  className="pharmacy-dashboard-medication__stock"
                  data-stock-status={["high", "medium", "low", "medium"][i]}
                >
                  {
                    ["High Stock", "Medium Stock", "Low Stock", "Medium Stock"][
                      i
                    ]
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import PropTypes from "prop-types";
import { FileText, Printer } from "lucide-react";
import "../Styles/MedicalReport.css";

export default function MedicalReport({ scanResult, date }) {
  return (
    <div className="medical-report">
      <div className="report-header">
        <h3 className="report-title">
          <FileText className="title-icon" />
          Medical Report
        </h3>
        <button onClick={() => window.print()} className="print-button">
          <Printer className="button-icon" />
          Print Report
        </button>
      </div>
      <div className="report-content">
        <div className="info-grid">
          <div className="info-item">
            <p className="info-label">Date</p>
            <p className="info-value">{date}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Report ID</p>
            <p className="info-value">
              {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="section-divider">
          <h4 className="section-title">Diagnosis</h4>
          <div
            className={`diagnosis-box ${
              scanResult === "infected"
                ? "diagnosis-infected"
                : "diagnosis-healthy"
            }`}
          >
            <p
              className={`diagnosis-text ${
                scanResult === "infected" ? "text-infected" : "text-healthy"
              }`}
            >
              {scanResult === "infected"
                ? "Infection Detected"
                : "No Infection Detected"}
            </p>
          </div>
        </div>
        <div className="section-divider">
          <h4 className="section-title">Findings</h4>
          <p className="findings-text">
            {scanResult === "infected"
              ? "Analysis indicates presence of abnormal patterns consistent with infection. Further clinical correlation is recommended."
              : "No significant abnormalities detected. Normal anatomical structures are preserved."}
          </p>
        </div>
        <div className="section-divider">
          <h4 className="section-title">Recommendations</h4>
          <ul className="recommendations-list">
            {scanResult === "infected" ? (
              <>
                <li>Schedule follow-up examination in 2 weeks</li>
                <li>Consider additional diagnostic tests</li>
                <li>Consultation with specialist recommended</li>
              </>
            ) : (
              <>
                <li>Routine follow-up as scheduled</li>
                <li>Maintain regular check-ups</li>
                <li>No immediate additional testing required</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Add PropTypes for type checking in JavaScript
MedicalReport.propTypes = {
  scanResult: PropTypes.oneOf(["infected", "healthy"]).isRequired,
  date: PropTypes.string.isRequired,
};

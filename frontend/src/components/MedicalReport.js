import React from "react";
import PropTypes from "prop-types";
import { FileText, Printer } from "lucide-react";
import "../Styles/MedicalReport.css";

export default function MedicalReport({ imageUrl, scanResult, confidence, date }) {
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
          <div className="diagnosis-box">
            <p className="diagnosis-text">
              Prediction: <strong>{scanResult}</strong>
            </p>
            <p className="confidence-text">
              Confidence: <strong>{confidence}%</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// PropTypes for type checking
MedicalReport.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  scanResult: PropTypes.string.isRequired,
  confidence: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
};

import React, { useState } from "react";
import { Upload } from "lucide-react";
import MedicalReport from "../components/MedicalReport";
import ChatBot from "../components/ChatBot";
import "../Styles/Scan.css";

export default function ScanPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const isInfected = Math.random() > 0.5;
      setScanResult(isInfected ? "infected" : "not infected");
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="scan-container">
      <div className="upload-card">
        <div className="upload-header">
          <h2 className="scan-title">X-Ray Scan</h2>
          <p className="scan-subtitle">Upload an X-ray image for analysis</p>
        </div>

        <div className="upload-area">
          {!previewUrl ? (
            <div className="upload-content">
              <div className="upload-icon">
                <Upload className="icon" />
              </div>
              <p className="upload-text">Drag and drop your X-ray image here</p>
              <p className="upload-or">or</p>
              <label className="file-label">
                Browse Files
                <input
                  type="file"
                  className="file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <div className="preview-container">
              <img
                src={previewUrl}
                alt="X-ray preview"
                className="preview-image"
              />
              <button
                className="remove-button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setScanResult(null);
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <button
          className={`scan-button ${
            selectedFile && !isScanning ? "active" : "disabled"
          }`}
          onClick={handleScan}
          disabled={!selectedFile || isScanning}
        >
          {isScanning ? "Scanning..." : "Scan X-Ray"}
        </button>
      </div>

      {scanResult && (
        <MedicalReport
          scanResult={scanResult}
          date={new Date().toLocaleDateString()}
        />
      )}
      <ChatBot />
    </div>
  );
}

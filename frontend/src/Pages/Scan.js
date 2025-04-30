import React, { useState } from "react";
import { Upload } from "lucide-react";
import MedicalReport from "../components/MedicalReport";
import ChatBot from "../components/ChatBot";
import "../Styles/Scan.css";

export default function ScanPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [bodyArea, setBodyArea] = useState("Chest");
  const [isScanning, setIsScanning] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);
      setConfidence(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("bodyPart", bodyArea);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setScanResult(data.classification_result || "Unknown");
      setConfidence(data.confidence_score || "N/A");
    } catch (error) {
      setScanResult("Failed to connect to the server.");
      setConfidence(null);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="scan-container">
      <div className="upload-card">
        <div className="upload-header">
          <h2 className="scan-title">X-Ray Scan Analysis</h2>
          <p className="scan-subtitle">
            Upload an X-ray image for AI-powered analysis
          </p>
        </div>

        <div className="scan-controls">
          <div className="body-part-selection">
            <label className="dropdown-label">Select Body Part</label>
            <select
              className="body-part-select"
              value={bodyArea}
              onChange={(e) => setBodyArea(e.target.value)}
            >
              <option value="Chest">Chest</option>
              <option value="Eye">Eye</option>
              <option value="Brain">Brain</option>
              <option value="Bones">Bones</option>
              <option value="Lung">Lung</option>
              <option value="Kidney">Kidney</option>
              <option value="Nail">Nail</option>
              <option value="Skin">Skin</option>
            </select>
          </div>

          <div className="upload-area">
            {!previewUrl ? (
              <div className="upload-content">
                <div className="upload-icon">
                  <Upload className="icon" />
                </div>
                <p className="upload-text">
                  Drag and drop your X-ray image here
                </p>
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
                    setConfidence(null);
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
            {isScanning ? "Analyzing..." : "Analyze X-Ray"}
          </button>
        </div>
      </div>

      {scanResult && (
        <div className="results-section">
          <MedicalReport
            imageUrl={previewUrl}
            scanResult={scanResult}
            confidence={confidence}
            date={new Date().toLocaleDateString()}
          />
          <ChatBot classificationResult={scanResult} />
        </div>
      )}
    </div>
  );
}

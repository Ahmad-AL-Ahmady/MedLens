import React, { useState } from "react";
import { Upload, Info, ChevronDown, ChevronUp } from "lucide-react";
import MedicalReport from "../components/MedicalReport";
import ChatBot from "../components/ChatBot";
import "../Styles/Scan.css";

export default function ScanPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [bodyArea, setBodyArea] = useState("Chest"); // Default value set to Chest
  const [isScanning, setIsScanning] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  // X-ray types information
  const xrayTypes = [
    {
      bodyPart: "Chest",
      description:
        "Used to detect pneumonia, lung cancer, heart conditions, and pulmonary disorders",
      aiAccuracy: "95%",
    },
    {
      bodyPart: "Eye",
<<<<<<< HEAD
      description: "Helps diagnose eye diseases, detect foreign bodies, and eye injuries",
      aiAccuracy: "98%"
    },
    {
      bodyPart: "Brain",
      description: "Helps identify tumors, hemorrhages, and structural abnormalities",
      aiAccuracy: "95%"
    },
    {
      bodyPart: "Bones",
      description: "Detects fractures, dislocations, arthritis, and bone diseases",
      aiAccuracy: "95%"
    },
    {
      bodyPart: "Lung",
      description: "Used to detect tuberculosis, infections, and chronic lung diseases",
      aiAccuracy: "95%"
    },
    {
      bodyPart: "Kidney",
      description: "Helps diagnose kidney stones, structural abnormalities, and kidney diseases",
      aiAccuracy: "99%"
=======
      description:
        "Helps diagnose eye diseases, detect foreign bodies, and eye injuries",
      aiAccuracy: "91%",
    },
    {
      bodyPart: "Brain",
      description:
        "Helps identify tumors, hemorrhages, and structural abnormalities",
      aiAccuracy: "92%",
    },
    {
      bodyPart: "Bones",
      description:
        "Detects fractures, dislocations, arthritis, and bone diseases",
      aiAccuracy: "97%",
    },
    {
      bodyPart: "Lung",
      description:
        "Used to detect tuberculosis, infections, and chronic lung diseases",
      aiAccuracy: "93%",
    },
    {
      bodyPart: "Kidney",
      description:
        "Helps diagnose kidney stones, structural abnormalities, and kidney diseases",
      aiAccuracy: "90%",
>>>>>>> 538e6f709bc8b311db03bc3fdb1e604e3c6caccf
    },
    {
      bodyPart: "Nail",
      description: "Helps identify nail infections, tumors, and deformities",
      aiAccuracy: "89%",
    },
    {
      bodyPart: "Skin",
      description:
        "Aids in detecting skin cancer, infections, and other dermatological conditions",
      aiAccuracy: "92%",
    },
  ];

  const toggleInfo = () => {
    setIsInfoExpanded(!isInfoExpanded);
  };

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

  // Updated handleScan function for Scan.js
  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("bodyPart", bodyArea);

    try {
      // First, send to AI service for analysis
      const aiResponse = await fetch("http://127.0.0.1:8000/predict/", {
        method: "POST",
        body: formData,
      });

      const aiData = await aiResponse.json();
      setScanResult(aiData.classification_result || "Unknown");
      setConfidence(aiData.confidence_score || 0); // Set to 0 instead of null to avoid prop type error

      // Now save to your main application database
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        console.warn("User not authenticated. Scan not saved to profile.");
        return;
      }

      // Step 1: Create the scan record
      const createScanResponse = await fetch(
        "http://localhost:4000/api/medical-scans",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bodyPart: bodyArea,
            description: `AI Analysis: ${
              aiData.classification_result || "Unknown"
            }`,
          }),
          credentials: "include",
        }
      );

      const scanData = await createScanResponse.json();

      if (scanData.status === "success" && scanData.data.uploadUrl) {
        // Step 2: Upload the image for this scan record
        const imageFormData = new FormData();
        imageFormData.append("image", selectedFile);

        // Fix the URL by using the full absolute URL
        const uploadUrl = `http://localhost:4000${scanData.data.uploadUrl}`;
        console.log("Uploading image to:", uploadUrl);

        const uploadImageResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imageFormData,
          credentials: "include",
        });

        if (uploadImageResponse.ok) {
          const finalData = await uploadImageResponse.json();
          console.log("Scan saved successfully:", finalData);
        } else {
          console.error(
            "Failed to upload image:",
            await uploadImageResponse.text()
          );
        }
      } else {
        console.error("Failed to create scan record:", scanData);
      }
    } catch (error) {
      console.error("Error during scan process:", error);
      // Ensure confidence is not null to avoid prop type error
      setScanResult("Failed to process or save the scan.");
      setConfidence(0); // Set to 0 instead of null
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="scan-container">
      {/* X-Ray Information Section */}
      <div className="info-card">
        <div className="info-header" onClick={toggleInfo}>
          <div className="info-title-container">
            <Info className="info-icon" />
            <h2 className="info-title">X-Ray Types & AI Analysis</h2>
          </div>
          {isInfoExpanded ? (
            <ChevronUp className="chevron-icon" />
          ) : (
            <ChevronDown className="chevron-icon" />
          )}
        </div>

        {isInfoExpanded && (
          <div className="info-content">
            <p className="info-description">
              Our advanced AI system analyzes various types of X-ray images with
              high accuracy. Select the appropriate body part for the most
              accurate results.
            </p>

            <div className="info-ai-capabilities">
              <h3 className="capabilities-title">AI Analysis Capabilities:</h3>
              <ul className="capabilities-list">
                <li>Advanced pattern recognition for abnormality detection</li>
                <li>Comparative analysis with thousands of medical cases</li>
                <li>Real-time assessment with high confidence scoring</li>
                <li>Support for multiple body areas and medical conditions</li>
              </ul>
            </div>

            <div className="xray-types-cards">
              <h3 className="cards-title">X-Ray Types by Body Part</h3>
              <div className="cards-container">
                {xrayTypes.map((type, index) => (
                  <div key={index} className="xray-type-card">
                    <div className="card-header">
                      <h4 className="body-part-title">{type.bodyPart}</h4>
                      <span className="accuracy-badge">{type.aiAccuracy}</span>
                    </div>
                    <p className="card-description">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Original Upload Card - Kept unchanged */}
      <div className="upload-card">
        <div className="upload-header">
          <h2 className="scan-title">X-Ray Scan</h2>
          <p className="scan-subtitle">Upload an X-ray image for analysis</p>
        </div>

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
          {isScanning ? "Scanning..." : "Scan X-Ray"}
        </button>
      </div>

      {scanResult && (
        <MedicalReport
          imageUrl={previewUrl}
          scanResult={scanResult}
          confidence={confidence || 0} // Ensure confidence is never null
          date={new Date().toLocaleDateString()}
        />
      )}

      {/* Pass the scan result to ChatBot */}
      <ChatBot classificationResult={scanResult} />
    </div>
  );
}

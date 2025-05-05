import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../Styles/LocationPicker.css";
import { createPortal } from "react-dom";

const customMarker = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const LocationPicker = ({ onSelect, onClose }) => {
  const [position, setPosition] = useState([30.0444, 31.2357]);
  const [mapInstance, setMapInstance] = useState(null);
  const overlayRef = useRef(null);

  const createGeoJSONPoint = (lng, lat) => ({
    type: "Point",
    coordinates: [lng, lat],
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const MapInstance = () => {
    const map = useMap();
    useEffect(() => {
      setMapInstance(map);
    }, [map]);
    return null;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          onSelect(createGeoJSONPoint(longitude, latitude));
          if (mapInstance) {
            mapInstance.flyTo([latitude, longitude], 13);
          }
        },
        (err) => {
          console.error("Error fetching location:", err);
          alert("Unable to fetch location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const LocationMarker = () => {
    const map = useMap();
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onSelect(createGeoJSONPoint(lng, lat));
        map.flyTo([lat, lng], map.getZoom());
      },
    });
    return position ? <Marker position={position} icon={customMarker} /> : null;
  };

  const handleManualSelection = () => {
    if (mapInstance) {
      const center = mapInstance.getCenter();
      setPosition([center.lat, center.lng]);
      onSelect(createGeoJSONPoint(center.lng, center.lat));
      mapInstance.flyTo([center.lat, center.lng], mapInstance.getZoom());
      onClose();
    }
  };

  // Render the LocationPicker in a portal at the root level
  return createPortal(
    <div className="map-overlay">
      <div className="map-container" ref={overlayRef}>
        <div className="map-header">
          <h2>Select Location</h2>
          <div className="header-buttons">
            <button
              type="button"
              className="manual-selection-btn"
              onClick={handleManualSelection}
            >
              <svg
                className="location-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Choose Manually
            </button>
            <button
              type="button"
              className="my-location-btn"
              onClick={getCurrentLocation}
            >
              <svg
                className="location-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path
                  fill="currentColor"
                  d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
                />
              </svg>
              My Location
            </button>
            <button type="button" className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        <div className="map-content">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <MapInstance />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker />
          </MapContainer>
        </div>
      </div>
    </div>,
    document.body // Render at the root of the DOM
  );
};

export default LocationPicker;

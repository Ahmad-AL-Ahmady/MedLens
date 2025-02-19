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
      const currentCenter = mapInstance.getCenter();
      const newPosition = { lat: currentCenter.lat, lng: currentCenter.lng }; // ✅ Convert array to object

      setPosition([currentCenter.lat, currentCenter.lng]);
      onSelect(newPosition);
      mapInstance.flyTo(
        [currentCenter.lat, currentCenter.lng],
        mapInstance.getZoom()
      );
    }
  };

  return (
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
              >
                <path
                  fill="currentColor"
                  d="M12 4c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9m0-2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                />
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
              &times;
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;

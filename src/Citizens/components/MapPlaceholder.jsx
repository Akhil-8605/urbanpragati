import React, { useEffect, useState } from "react";
import "./MapPlaceholder.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
const pins = [
  { lat: 18.52043, lng: 73.85674, label: "Water Leak", color: "#3B82F6" },
  { lat: 18.52120, lng: 73.85790, label: "Road Damage", color: "#F59E0B" },
  { lat: 18.51950, lng: 73.85560, label: "Sanitation", color: "#10B981" },
  { lat: 18.51890, lng: 73.85810, label: "Electricity", color: "#EF4444" },
];
const legendItems = [
  { color: "#3B82F6", label: "Water" },
  { color: "#F59E0B", label: "Road" },
  { color: "#10B981", label: "Sanitation" },
  { color: "#EF4444", label: "Electricity" },
];
function MapPlaceholder({ title = "Live Complaint Map", height = 280 }) {
  const [location, setLocation] = useState(null);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    });
  }, []);
  if (!location) {
    return <div style={{ height }}>Loading Map...</div>;
  }
  return (
    <div className="map-placeholder" style={{ height }}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={17}
        className="map-real"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
        />
        <Marker position={[location.lat, location.lng]}>
          <Popup>Your Location</Popup>
        </Marker>
        {pins.map((pin, i) => (
          <Marker key={i} position={[pin.lat, pin.lng]}>
            <Popup>{pin.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="map-header">
        <span>{title}</span>
      </div>
      <div className="map-legend">
        {legendItems.map((item, i) => (
          <div key={i} className="map-legend-item">
            <span
              className="map-legend-dot"
              style={{ background: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="map-notice">Live Satellite Map</div>
    </div>
  );
}
export default MapPlaceholder;
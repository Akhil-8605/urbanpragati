import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Default center for Solapur, Maharashtra
const DEFAULT_CENTER = { lat: 17.6868, lng: 75.9042 };

function DraggableMarker({ position, onPositionChange }) {
    useMapEvents({
        click(e) {
            onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position ? (
        <Marker
            position={[position.lat, position.lng]}
            draggable
            eventHandlers={{
                dragend(e) {
                    const latlng = e.target.getLatLng();
                    onPositionChange({ lat: latlng.lat, lng: latlng.lng });
                },
            }}
        />
    ) : null;
}

export default function LocationPicker({ coordinates, onChange }) {
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState('');

    const handleGetGPS = () => {
        setGpsLoading(true);
        setGpsError('');
        if (!navigator.geolocation) {
            setGpsError('Geolocation not supported by your browser.');
            setGpsLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGpsLoading(false);
            },
            (err) => {
                setGpsError('Could not get location. Please enable GPS or click on the map.');
                setGpsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const center = coordinates && coordinates.lat ? coordinates : DEFAULT_CENTER;

    return (
        <div className="location-picker">
            <div className="location-picker__toolbar">
                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleGetGPS}
                    disabled={gpsLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    {gpsLoading ? 'Locating...' : 'Use My GPS Location'}
                </button>
                {coordinates && coordinates.lat && (
                    <span className="location-picker__coords">
                        {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                    </span>
                )}
            </div>
            {gpsError && <p className="location-picker__error">{gpsError}</p>}
            <p className="location-picker__hint">Click anywhere on the map to pin your location, or drag the marker to adjust.</p>
            <div className="location-picker__map" style={{ height: 280, borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--color-gray-100)' }}>
                <MapContainer
                    center={[center.lat, center.lng]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <DraggableMarker position={coordinates} onPositionChange={onChange} />
                </MapContainer>
            </div>
        </div>
    );
}

"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = () => {
  // Array of marker data (latitude, longitude, and a description for each marker)
  const markersData = [
    { lat: 51.505, lng: -0.09, description: "Marker 1: London" },
    { lat: 51.515, lng: -0.1, description: "Marker 2: Near London" },
    { lat: 51.525, lng: -0.11, description: "Marker 3: Another place" },
  ];

  return (
    <div>
      <h1>Multiple Markers on Map</h1>
      {/* Leaflet MapContainer */}
      <MapContainer
        center={[51.505, -0.09]} // Default center of the map
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        {/* TileLayer to load map tiles (OpenStreetMap in this case) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Loop over the markersData array to create multiple markers */}
        {markersData.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            <Popup>{marker.description}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;

"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Import Leaflet's CSS file
import axios from "axios";
import { useRouter } from "next/navigation";

const pickupIcon = new L.Icon({
  iconUrl: "/location.png", // Path to the image (from public/images)
  iconSize: [40, 40], // Set the size of the custom icon
  iconAnchor: [20, 40], // Position of the icon's anchor (bottom center)
  popupAnchor: [0, -40], // Popup position
});

const dropIcon = new L.Icon({
  iconUrl: "/droplocation.png", // Path to the image (from public/images)
  iconSize: [40, 40], // Set the size of the custom icon
  iconAnchor: [20, 40], // Position of the icon's anchor (bottom center)
  popupAnchor: [0, -40], // Popup position
});

const UpdateMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom); // Dynamically update the map's center and zoom
  }, [center, zoom, map]);

  return null; // This component doesn't render anything, it only updates the map
};

// Functional component to render the map
const MapComponent = (props) => {
  const [center, setCenter] = useState([51.505, -0.09]); // Initial center: London
  const [zoom, setZoom] = useState(13); // Initial zoom: 13

  const [watchId, setWatchId] = useState(null);
  const [currentlocation, setLocation] = useState({ lat: 51.505, lon: -0.09 });
  const [position, setPositions] = useState({ lat: 51.505, lon: -0.09 });

  const [locations, setlocations] = useState([]);

  const [responseData, setResponseData] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const router = useRouter();

  const mapRef = useRef(null);

  useEffect(() => {
    // Cleanup when the component is unmounted or on route change
    return () => {
      if (mapRef.current) {
        mapRef.current.remove(); // Proper cleanup of the map instance
      }
    };
  }, [router.pathname]);

  const handlePostRequest = async (a, b) => {
    try {
      // Sending POST request with data
      const response = await axios.post(
        "http://127.0.0.1:8000/trip/loadlocation",
        {
          lat: a,
          lon: b,
        }
      );

      // Storing response in state
      setResponseData(response.data["locations"]);

      if (props.fieldstate === "pickup") {
        props.getDlocations("");

        props.getlocations(response.data["locations"]);
      } else if (props.fieldstate === "dropoff") {
        props.getDlocations(response.data["locations"]);
      }

      console.log(response.data["locations"]);
    } catch (error) {
      if (error.response) {
        // Server responded with a non-2xx status code
        setErrorMessage(
          `Error: ${error.response.status} - ${error.response.data}`
        );
      } else if (error.request) {
        // Request was made but no response received
        setErrorMessage("No response received from the server");
      } else {
        // Other errors (e.g. setup issues)
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  const handleCenterChange = (lat, lon, zoom) => {
    setCenter([lat, lon]);
    setZoom(zoom);
    setlocations([currentlocation]);
    props.getlocations(responseData);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      const handleSuccess = (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        handlePostRequest(latitude, longitude);
      };

      const handleError = (error) => {};
      let id;
      if (props.up) {
        id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      }
      props.setup(false);

      setWatchId(id);

      handleCenterChange(currentlocation.lat, currentlocation.lon, zoom);

      navigator.geolocation.clearWatch(watchId);
    }
  }, [currentlocation]);

  useEffect(() => {
    setlocations([currentlocation, position]);
    getPrice({
      from_lat: currentlocation.lat,
      from_lng: currentlocation.lon,
      to_lat: position.lat,
      to_lng: position.lon,
    });
    props.setCoord({
      from_lat: currentlocation.lat,
      from_lng: currentlocation.lon,
      to_lat: position.lat,
      to_lng: position.lon,
    });
  }, [position]);

  const getPrice = async (data) => {
    try {
      const token = JSON.parse(localStorage.getItem("jwt"))?.jwtToken;
      console.log("JWT Token:", token); // Check if the token is available

      if (!token) {
        console.log("No JWT token found");
        return; // No token, exit the function
      }
      const response = await axios.post(
        "http://127.0.0.1:8000/trip/getprice",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data.car_price !== 10) {
        props.getfare(response.data.car_price);
      }

      console.log(response.data);
    } catch (error) {
      console.log("Error during login:", error);
    }
  };

  const ClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        const zoom = e.target.getZoom();

        if (props.mclick) {
          if (props.fieldstate === "pickup") {
            props.getDlocations("");
            setLocation({ lat: lat, lon: lng });
            handleCenterChange(lat, lng, zoom);
            handlePostRequest(lat, lng);
            props.getlocations(responseData);
          } else if (props.fieldstate === "dropoff") {
            setPositions({ lat: lat, lon: lng });
            handlePostRequest(lat, lng);
            props.getDlocations(responseData);
          }
        }
      },
    });
    return null;
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <MapContainer
          center={center}
          zoom={zoom}
          ref={mapRef}
          style={{ height: "100%", width: "100%" }}
        >
          <UpdateMapView center={center} zoom={zoom} />
          <ClickHandler />

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          />

          {locations.map((m, index) => (
            <Marker
              key={index}
              icon={index === 0 ? pickupIcon : dropIcon}
              position={[m.lat, m.lon]}
            >
              <Popup> {index === 0 ? "Pickup" : "Drop"} </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;

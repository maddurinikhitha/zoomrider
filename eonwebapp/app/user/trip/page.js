"use client";
import React, { useState, useEffect } from "react";
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
import MapComponent from "./mapComponant";
import axios from "axios";
import { useRouter } from "next/navigation";

const getFormattedTime = () => {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0"); // Ensure two digits for day
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is zero-based
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${seconds}`;
};

// Functional component to render the map
const Page = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated (for example, via a token in localStorage or cookies)
    const token = localStorage.getItem("jwt"); // or use cookies for more secure storage

    if (!token) {
      // If no token, redirect to login page
      router.push("./login");
    }
  }, []);

  const [bookingState, setbookingState] = useState(true);
  const [bookinData, setbookingData] = useState({});

  const [up, setup] = useState(true);

  const [locations, setlocations] = useState("");
  const [Dlocations, setDlocations] = useState("");

  const [coord, setcoord] = useState({});

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const [fare, setFare] = useState(0);
  const [selectedField, setSelectedField] = useState("pickup");

  const handleFocus = (fieldName) => {
    setSelectedField(fieldName); // Update selected field
  };

  const [book, setbook] = useState({
    from_lat: "",
    from_lng: "",
    to_lat: "",
    to_lng: "",
    vehicle_type: "",
    from_location: "",
    to_location: "",
    pickup_time: "",
    fare: "",
  });

  useEffect(() => {
    setbook({
      from_lat: coord.from_lat,
      from_lng: coord.from_lng,
      to_lat: coord.to_lat,
      to_lng: coord.to_lng,
      vehicle_type: "sedan",
      from_location: locations,
      to_location: Dlocations,
      pickup_time: getFormattedTime(),
      fare: fare,
    });
  }, [fare]);

  const onbookHandler = async () => {
    getRide();
  };

  const getRide = async (data) => {
    try {
      const token = JSON.parse(localStorage.getItem("jwt"))?.jwtToken;
      console.log("JWT Token:", token); // Check if the token is available

      if (!token) {
        console.log("No JWT token found");
        return; // No token, exit the function
      }
      const response = await axios.post(
        "http://127.0.0.1:8000/trip/book",
        book,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (response.data.status === true) {
        setbookingState(false);
        setbookingData(response.data.details);
      } else {
        alert("no cab available please try after some time");
      }

      console.log(response.data);
    } catch (error) {
      console.log("Error during login:", error);
    }
  };

  const pay = async (data) => {
    try {
      const token = JSON.parse(localStorage.getItem("jwt"))?.jwtToken;
      console.log("JWT Token:", token); // Check if the token is available

      if (!token) {
        console.log("No JWT token found");
        return; // No token, exit the function
      }
      const response = await axios.post(
        "http://127.0.0.1:8000/trip/payment/pay",
        {
          status: true,
          trip_id: bookinData.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      alert(response.data.message);
      if (response.data.status === true) {
        router.push("./home");
      }
    } catch (error) {
      console.log("Error during login:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <MapComponent
          up={up}
          setup={setup}
          fieldstate={selectedField}
          getlocations={(a) => setlocations(a)}
          getDlocations={(a) => setDlocations(a)}
          getfare={(a) => setFare(a)}
          setCoord={(a) => setcoord(a)}
          mclick={bookingState}
        />
      </div>

      {!bookingState ? (
        <div className="w-80 p-6 bg-gray-100 border-l border-gray-300 flex flex-col gap-6">
          <h2 className="text-xl font-semibold mb-4">Booking Confirmation</h2>

          <div className="bg-white p-4 rounded-md shadow-md">
            <h3 className="font-semibold text-lg">Trip Details</h3>

            <div className="mt-2">
              <strong>Trip ID:</strong>
              <span className="ml-2">{bookinData.id}</span>
            </div>

            <div className="mt-2">
              <strong>Vehicle Number:</strong>
              <span className="ml-2">{bookinData.vehicle.vehicle_number}</span>
            </div>

            <div className="mt-2">
              <strong>Pickup Location:</strong>
              <span className="ml-2">{bookinData.from_location}</span>
            </div>

            <div className="mt-2">
              <strong>Dropoff Location:</strong>
              <span className="ml-2">{bookinData.to_location}</span>
            </div>

            <div className="mt-2">
              <strong>Estimated Fare:</strong>
              <br />
              <span className="ml-2">{fare.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={pay}
            className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Pay
          </button>
        </div>
      ) : (
        <div className="w-80 p-6 bg-gray-100 border-l border-gray-300 flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Booking Details</h2>

          {/* Pickup Location Input */}
          <div>
            <label
              htmlFor="pickup"
              className="block text-sm font-medium text-gray-700"
            >
              Pickup Location
            </label>

            <input
              type="text"
              id="pickup"
              onFocus={() => handleFocus("pickup")}
              value={locations}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="pickup location"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Dropoff Location Input */}
          <div>
            <label
              htmlFor="dropoff"
              className="block text-sm font-medium text-gray-700"
            >
              Dropoff Location
            </label>
            <input
              type="text"
              id="dropoff"
              onFocus={() => handleFocus("dropoff")}
              value={Dlocations}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="dropoff location"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Fare Display */}
          <div>
            <label
              htmlFor="fare"
              className="block text-sm font-medium text-gray-700"
            >
              Estimated Fare
            </label>
            <input
              type="number"
              id="fare"
              value={fare.toFixed(2)}
              onChange={(e) => setFare(e.target.value)}
              placeholder="Enter fare"
              className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Book Button */}

          <button
            onClick={onbookHandler}
            className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Book Ride
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;

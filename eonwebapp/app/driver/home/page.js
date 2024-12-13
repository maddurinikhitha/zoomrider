"use client";
// pages/profile.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Profile() {
  const router = useRouter();
  let jwtToken;

  useEffect(() => {
    jwtToken = JSON.parse(localStorage.getItem("jwt"));
  }, []);

  useEffect(() => {
    if (!jwtToken) {
      router.push("/user/login");
    } else if (jwtToken.accountType == "R") {
      router.push("/user/home");
    }
  }, []);

  const [user, setUser] = useState({
    email: "",
    name: "",
    username: "",
    address: "",
    gender: "",
    phone: "",
    dob: "",
    about: "",
  });

  const [vehicle, setVehicle] = useState({
    vehicle_number: "",
    seat_capacity: "",
    mileage: "",
    type: "",
  });

  const [showadd, setshowadd] = useState(true);

  const [isPasswordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [isUpdatePopupOpen, setUpdatePopupOpen] = useState(false);
  const [isAddVehiclePopupOpen, setAddVehiclePopupOpen] = useState(false);
  const [isUpdateVehiclePopupOpen, setUpdateVehiclePopupOpen] = useState(false);

  const [updatedUserInfo, setUpdatedUserInfo] = useState({
    email: "",
    name: "",
    username: "",
    address: "",
    gender: "",
    phone: "",
  });

  const [newPassword, setNewPassword] = useState({
    old_password: "",
    new_password: "",
  });

  useEffect(() => {
    if (jwtToken) {
      axios
        .get("http://127.0.0.1:8000/user/", {
          headers: {
            Authorization: `Bearer ${jwtToken.jwtToken}`, // Send only the JWT in the Authorization header
          },
        })
        .then((response) => {
          console.log("Response:", response.data);

          setUser({
            email: response.data.user.email,
            name: response.data.user.name,
            address: response.data.user.address,
            gender: response.data.user.gender,
            phone: response.data.user.phone,
            dob: response.data.user.dob || "",
          });
          loadVehicle(response.data.user.public_id);
          setUpdatedUserInfo({
            email: response.data.user.email,
            name: response.data.user.name,
            address: response.data.user.address,
            gender: response.data.user.gender,
            phone: response.data.user.phone,
          });
        })
        .catch((error) => {
          console.log("Error:");
        });
      console.log(jwtToken.jwtToken);
    } else {
      console.log("No JWT token found in localStorage");
    }
  }, []);

  const loadVehicle = async (id) => {
    try {
      const token = JSON.parse(localStorage.getItem("jwt"))?.jwtToken;
      console.log("JWT Token:", token); // Check if the token is available

      if (!token) {
        console.log("No JWT token found");
        return; // No token, exit the function
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/driver/vehicle",
        { driver_id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send only the JWT in the Authorization header
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === true) {
        setshowadd(false);
        setVehicle({
          vehicle_number: response.data.vehicle.vehicle_number,
          seat_capacity: response.data.vehicle.seat_capacity,
          mileage: response.data.vehicle.mileage,
          type: response.data.vehicle.type,
        });
      } else {
        setshowadd(true);
      }
    } catch (error) {
      console.log("Error:");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserInfo({ ...updatedUserInfo, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setNewPassword({ ...newPassword, [name]: value });
  };

  const onPasswordChange = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("jwt"))?.jwtToken;
      console.log("JWT Token:", token); // Check if the token is available

      if (!token) {
        console.log("No JWT token found");
        return; // No token, exit the function
      }
      const response = await axios.post(
        "http://127.0.0.1:8000/user/update/password",
        newPassword,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      alert(response.data.message);
    } catch (error) {
      console.log("Error during login:", error);
    }
    setPasswordPopupOpen(false);
  };

  const handleUpdateUserInfo = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("jwt"))?.jwtToken;
      console.log("JWT Token:", token); // Check if the token is available

      if (!token) {
        console.log("No JWT token found");
        return; // No token, exit the function
      }
      const response = await axios.put(
        "http://127.0.0.1:8000/user/update",
        updatedUserInfo,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.log("Error during login:", error);
    }
    setUpdatePopupOpen(false);
  };

  const handleAddVehicle = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("jwt"))?.jwtToken;
      console.log("JWT Token:", token); // Check if the token is available

      if (!token) {
        console.log("No JWT token found");
        return; // No token, exit the function
      }
      const response = await axios.post(
        "http://127.0.0.1:8000/driver/add-vehicle",
        vehicle,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.log("Error during login:", error);
    }
    setAddVehiclePopupOpen(false);
  };

  const handleUpdateVehicle = async () => {
    console.log("vehicle");
    console.log(vehicle);
    try {
      const token = JSON.parse(localStorage.getItem("jwt"))?.jwtToken;
      console.log("JWT Token:", token); // Check if the token is available

      if (!token) {
        console.log("No JWT token found");
        return; // No token, exit the function
      }
      const response = await axios.put(
        "http://127.0.0.1:8000/driver/updatevehicle",
        vehicle,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
    } catch (error) {
      console.log("Error during login:", error);
    }
    setUpdateVehiclePopupOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gray-500 text-white p-3">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Cab Driver Service</h1>
          <button
            onClick={() => {
              localStorage.removeItem("jwt");
              router.push("/user/login");
            }}
            className="p-2 bg-red-600 rounded-md hover:bg-red-700"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            User Profile
          </h2>
          <nav>
            <ul>
              <li className="mb-2">
                <button
                  className="w-full text-left p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={() => setUpdatePopupOpen(true)}
                >
                  Update Details
                </button>
              </li>
              <li className="mb-2">
                <button
                  className="w-full text-left p-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  onClick={() => setPasswordPopupOpen(true)}
                >
                  Update Password
                </button>
              </li>

              {showadd ? (
                <li className="mb-2">
                  <button
                    className="w-full text-left p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => setAddVehiclePopupOpen(true)}
                  >
                    Add Vehicle
                  </button>
                </li>
              ) : (
                <li className="mb-2">
                  <button
                    className="w-full text-left p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    onClick={() => setUpdateVehiclePopupOpen(true)}
                  >
                    Update Vehicle
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </aside>

        {/* Profile Details */}
        <main className="flex-1 p-6 bg-white shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Address:</strong> {user.address}
            </p>
            <p>
              <strong>Gender:</strong> {user.gender}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>

            {/* Vehicle Information Box */}
            <br />

            <div className="border p-4 mt-6 rounded-lg shadow-md bg-gray-100">
              <h3 className="text-xl font-semibold mb-2">
                Vehicle Information
              </h3>
              <p>
                <strong>Vehicle No:</strong>
                {vehicle.vehicle_number || "Not provided"}
              </p>
              <p>
                <strong>Seat Capacity:</strong>
                {vehicle.seat_capacity || "Not provided"}
              </p>
              <p>
                <strong>Mileage:</strong> {vehicle.mileage || "Not provided"}
              </p>
              <p>
                <strong>Vehicle Type:</strong>

                {vehicle.type || "Not provided"}
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Password Update Popup */}
      {isPasswordPopupOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-medium mb-4">Update Password</h3>
            <input
              name="old_password"
              type="text"
              placeholder="Enter old password"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md"
              onChange={handlePasswordChange}
            />
            <br />
            <input
              name="new_password"
              type="text"
              placeholder="Enter new password"
              className="w-full p-3 mb-4 border border-gray-300 rounded-md"
              onChange={handlePasswordChange}
            />
            <div className="flex space-x-4">
              <button
                className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={onPasswordChange}
              >
                Update Password
              </button>

              <button
                className="w-full p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                onClick={() => setPasswordPopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update User Info Popup */}
      {isUpdatePopupOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-medium mb-4">Update Your Details</h3>

            <label className="block mb-2">
              Name
              <input
                type="text"
                name="name"
                value={updatedUserInfo.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>
            <label className="block mb-2">
              Email
              <input
                type="text"
                name="username"
                value={updatedUserInfo.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>
            <label className="block mb-2">
              Address
              <input
                type="text"
                name="address"
                value={updatedUserInfo.address}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>
            <label className="block mb-2">
              Phone
              <input
                type="text"
                name="phone"
                value={updatedUserInfo.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>
            <label className="block mb-2">
              Gender
              <select
                name="gender"
                value={updatedUserInfo.gender}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>

            <div className="flex space-x-4">
              <button
                className="w-full p-3 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={handleUpdateUserInfo}
              >
                Update Info
              </button>
              <button
                className="w-full p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                onClick={() => setUpdatePopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Popup */}
      {isAddVehiclePopupOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-medium mb-4">Add Vehicle</h3>

            <label className="block mb-2">
              Vehicle Number
              <input
                type="text"
                value={vehicle.vehicle_number} // Controlled input: value comes from state
                onChange={(e) =>
                  setVehicle((prevState) => ({
                    ...prevState,
                    vehicle_number: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>
            <label className="block mb-2">
              Seat Capacity
              <input
                type="number"
                value={vehicle.seat_capacity} // Controlled input: value comes from state
                onChange={(e) =>
                  setVehicle((prevState) => ({
                    ...prevState,
                    seat_capacity: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>
            <label className="block mb-2">
              Mileage
              <input
                type="number"
                step="0.1"
                value={vehicle.mileage} // Controlled input: value comes from state
                onChange={(e) =>
                  setVehicle((prevState) => ({
                    ...prevState,
                    mileage: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>
            <label className="block mb-2">
              Vehicle Type
              <select
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
                id="vehicle"
                value={vehicle.type}
                onChange={(e) =>
                  setVehicle((prevState) => ({
                    ...prevState,
                    type: e.target.value,
                  }))
                }
              >
                SUV
                <option value="">--Select--</option>
                <option value="SEDAN">CAR</option>
                <option value="BIKE">Bike</option>
              </select>
            </label>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleAddVehicle}
              >
                Add Vehicle
              </button>

              <button
                className="w-full p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                onClick={() => setAddVehiclePopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Vehicle Popup */}
      {isUpdateVehiclePopupOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-medium mb-4">Update Vehicle</h3>

            <label className="block mb-2">
              Vehicle Number
              <input
                type="text"
                value={vehicle.vehicle_number}
                onChange={(e) =>
                  setVehicle((prevState) => ({
                    ...prevState,
                    vehicle_number: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>

            <label className="block mb-2">
              Seat Capacity
              <input
                type="number"
                value={vehicle.seat_capacity}
                onChange={(e) =>
                  setVehicle((prevState) => ({
                    ...prevState,
                    seat_capacity: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>

            <label className="block mb-2">
              Mileage
              <input
                type="number"
                value={vehicle.mileage}
                onChange={(e) =>
                  setVehicle((prevState) => ({
                    ...prevState,
                    mileage: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
              />
            </label>
            <label className="block mb-2">
              Vehicle Type
              <select
                className="w-full p-3 border border-gray-300 rounded-md mb-4"
                id="vehicle"
                value={vehicle.type}
                onChange={(e) =>
                  setVehicle((prevState) => ({
                    ...prevState,
                    type: e.target.value,
                  }))
                }
              >
                SUV
                <option value="">--Select--</option>
                <option value="SEDAN">CAR</option>
                <option value="BIKE">Bike</option>
              </select>
            </label>
            <div className="flex space-x-4">
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleUpdateVehicle}
              >
                Update Vehicle
              </button>
              <button
                className="w-full p-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                onClick={() => setUpdateVehiclePopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

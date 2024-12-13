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
      router.push("./login");
    } else if (jwtToken.accountType == "D") {
      router.push("/driver/home");
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

  const [updatedUserInfo, setUpdatedUserInfo] = useState({
    email: "",
    name: "",
    username: "",
    address: "",
    gender: "",
    phone: "",
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
    } else {
      console.log("No JWT token found in localStorage");
    }
  }, []);

  const [isPasswordPopupOpen, setPasswordPopupOpen] = useState(false);
  const [isUpdatePopupOpen, setUpdatePopupOpen] = useState(false);

  const [newPassword, setNewPassword] = useState({
    old_password: "",
    new_password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserInfo({ ...updatedUserInfo, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setNewPassword({ ...newPassword, [name]: value });
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gray-500 text-white p-3">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Cab Service</h1>
          <button
            onClick={() => {
              localStorage.removeItem("jwt");
              router.push("./login");
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
              <li className="mb-2">
                <button
                  className="w-full text-left p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  onClick={() => (window.location.href = "/user/trip")}
                >
                  Book a Trip
                </button>
              </li>
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
    </div>
  );
}
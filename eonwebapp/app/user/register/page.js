"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Register() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      router.push("./home");
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    phone: "",
    address: "",
    accountType: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Validate form fields before submission
  const validateForm = () => {
    const { name, email, password, gender, phone, address, accountType } =
      formData;

    if (
      !name ||
      !email ||
      !password ||
      !gender ||
      !phone ||
      !address ||
      !accountType
    ) {
      return "All fields are required.";
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }

    // Validate phone number format (simple check)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid 10-digit phone number.";
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const { name, email, password, gender, phone, address, accountType } =
      formData;

    // Simulate an API request
    handleLogin(name, email, password, gender, phone, address, accountType);
  };

  const handleLogin = async (
    name,
    email,
    password,
    gender,
    phone,
    address,
    accountType
  ) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/user/register", {
        name,
        email,
        password,
        gender,
        phone,
        address,
        account_type: accountType, // send account type to the backend
      });

      if (response.data["status"] === true) {
        window.location.href = "/user/login";
        console.log(response.data);
      } else if (response.data["status"] === "duplicate") {
        setError("Email or phone number already exists");
      }
    } catch (error) {
      console.log("Error during login:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-indigo-400">
      <div className="bg-white p-6 sm:p-8 md:p-10 lg:p-12 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-indigo-800 text-center mb-6">
          Register
        </h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-medium mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Gender
            </label>
            <div className="flex flex-wrap sm:flex-nowrap space-x-6 sm:space-x-4 text-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  onChange={handleChange}
                  checked={formData.gender === "male"}
                  className="text-indigo-500"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  onChange={handleChange}
                  checked={formData.gender === "female"}
                  className="text-indigo-500"
                />
                <span>Female</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  onChange={handleChange}
                  checked={formData.gender === "other"}
                  className="text-indigo-500"
                />
                <span>Other</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-gray-700 font-medium mb-2"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              className="w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="address"
              className="block text-gray-700 font-medium mb-2"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter your address"
              className="w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>

          {/* Account Type Toggle */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Account Type
            </label>
            <div className="flex space-x-6 sm:space-x-4 text-gray-700">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="accountType"
                  value="R"
                  onChange={handleChange}
                  checked={formData.accountType === "R"}
                  className="text-indigo-500"
                />
                <span>Customer</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="accountType"
                  value="D"
                  onChange={handleChange}
                  checked={formData.accountType === "D"}
                  className="text-indigo-500"
                />
                <span>Driver</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-indigo-600 text-white text-lg rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Register
          </button>
        </form>
        <br />
        <button
          onClick={() => router.push("./login")}
          className="text-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 float-right"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

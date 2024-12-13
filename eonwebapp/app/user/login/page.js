"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Page() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated (for example, via a token in localStorage or cookies)
    const token = localStorage.getItem("jwt"); // or use cookies for more secure storage

    if (token) {
      // If no token, redirect to login page
      router.push("./home");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple form validation
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    } else {
      handleLogin(username, password);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/user/login", {
        email: username,
        password: password,
      });

      if (response.data["status"] == true) {
        const token = response.data["access_token"];
        const refreshToken = response.data["refresh_token"];
        const accountType = response.data.user["account_type"];

        localStorage.setItem(
          "jwt",
          JSON.stringify({
            jwtToken: token,
            refreshToken: refreshToken,
            accountType: accountType,
          })
        );
        window.location.href = "/user/home";
        console.log(response.data);
      } else {
        setError("Invalid username or password.");
      }
    } catch (error) {
      console.log("Error during login:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-indigo-400 to-indigo-300">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Login
        </h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-medium mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              className="w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>
          <div className="mb-6">
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-indigo-600 text-white text-lg rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Login
          </button>
          <br /> <br />
        </form>
        <button
          onClick={() => router.push("./register")}
          className="text-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 float-right"
        >
          Go to Register
        </button>
      </div>
    </div>
  );
}

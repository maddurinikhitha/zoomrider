"use client";

import { useRouter } from "next/navigation";

const CabPage = () => {
  const router = useRouter();

  const navigateToLogin = () => {
    router.push("/user/login");
  };

  const navigateToRegister = () => {
    router.push("/user/register");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-md w-96">
        {/* Cab Image */}
        <img
          src="/car.png"
          alt="Globe icon"
          width={32}
          height={32}
          className="w-32 h-32 object-contain mb-6"
        />

        <h1 className="text-xl font-semibold mb-4">
          Welcome to Our Cab Service
        </h1>

        <div className="flex flex-col gap-4">
          {/* Login Button */}
          <button
            onClick={navigateToLogin}
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Go to Login
          </button>

          {/* Register Button */}
          <button
            onClick={navigateToRegister}
            className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Go to Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default CabPage;

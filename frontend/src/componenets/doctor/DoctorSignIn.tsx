import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRound, Lock } from "lucide-react";
import axios from "axios";
import { authAPI } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const DoctorSignIn = () => {
  const [formData, setFormData] = useState({ userId: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate(); // React Router's hook for navigation
  const { login } = useAuth(); // Use the auth context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      console.log("Submitting doctor login:", formData); // Debug

      // Use the API utility instead of direct axios call
      const response = await authAPI.doctorSignIn(formData.userId, formData.password);

      console.log("Doctor login response:", response.data); // Debug response

      if (response.data && response.data.token) {
        // Use the login function from AuthContext instead of manually setting localStorage
        login(
          response.data.token,
          "doctor",
          response.data.userId,
          response.data.name
        );
      } else {
        setError("Invalid response from server. Missing token.");
        console.error("Invalid response:", response.data);
      }
    } catch (err: any) {
      console.error("Doctor login error:", err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // The server responded with an error status code
          const errorMessage = err.response.data.error || "Authentication failed";
          setError(errorMessage);
          console.error("Server error:", err.response.data);
        } else if (err.request) {
          // The request was made but no response was received
          setError("No response from server. Please check your connection.");
        } else {
          // Something happened in setting up the request
          setError("Request error: " + err.message);
        }
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <UserRound className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          required
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="User ID"
          value={formData.userId}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="password"
          required
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Sign In
      </button>
    </form>
  );
};

export default DoctorSignIn;

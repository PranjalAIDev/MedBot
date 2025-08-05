// components/doctor/DoctorSignUp.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Mail, ScrollText, Lock } from 'lucide-react';
import axios from 'axios';

const DoctorSignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    licenseNumber: '',
    userId: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate(); // React Router's hook for navigation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error state
    try {
      // POST to signup endpoint
      const response = await axios.post('http://localhost:5000/api/doctor/signup', formData);

      // If your backend returns a token on signup:
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'doctor');

      setSuccess('Signup successful! Redirecting to homepage...');
      setFormData({ name: '', email: '', licenseNumber: '', userId: '', password: '' });

      // Wait 2 seconds, then navigate and reload
      setTimeout(() => {
        navigate('/');

        // Then force one-time reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 2000);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.data) {
            if (err.response.data.error) {
              setError(err.response.data.error);
            } else if (err.response.data.errors) {
              // Handle validation errors
              const validationErrors = err.response.data.errors.map((error: any) => error.msg).join(', ');
              setError(validationErrors);
            } else {
              setError('Signup failed. Please try again.');
            }
          } else {
            setError('Signup failed. Please try again.');
          }
        } else {
          setError('No response from server. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <UserRound className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          required
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="email"
          required
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ScrollText className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          required
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Medical License Number"
          value={formData.licenseNumber}
          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
        />
      </div>
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
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Sign Up
      </button>
    </form>
  );
};

export default DoctorSignUp;

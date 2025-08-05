// src/components/patient/PatientSignUp.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Mail, Lock } from 'lucide-react';
import FormInput from './FormInput';
import SubmitButton from './SubmitButton';
import axios from 'axios';

const PatientSignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Send POST request to signup endpoint
      const response = await axios.post('http://localhost:5000/api/patient/signup', formData);

      // Store the token and userType
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'patient');

      setSuccess('Signup successful! Redirecting to homepage...');
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('userName', response.data.name);

      setFormData({ name: '', email: '', userId: '', password: '' });

      // Redirect to homepage after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err: any) {
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          // Handle validation errors
          const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ');
          setError(errorMessages);
        } else if (err.response.data.error) {
          // Handle other errors (e.g., duplicate userId or email)
          setError(err.response.data.error);
        } else {
          setError('Signup failed.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
      console.error('Signup Error:', err.response ? err.response.data : err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display error messages */}
      {error && <p className="text-red-500">{error}</p>}
      {/* Display success messages */}
      {success && <p className="text-green-500">{success}</p>}

      <FormInput
        icon={UserRound}
        type="text"
        placeholder="Full Name"
        name="name" // Ensure the name attribute is set
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <FormInput
        icon={Mail}
        type="email"
        placeholder="Email Address"
        name="email" // Ensure the name attribute is set
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <FormInput
        icon={UserRound}
        type="text"
        placeholder="User ID"
        name="userId" // Ensure the name attribute is set
        value={formData.userId}
        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
      />
      <FormInput
        icon={Lock}
        type="password"
        placeholder="Password"
        name="password" // Ensure the name attribute is set
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <SubmitButton text="Sign Up" />
    </form>
  );
};

export default PatientSignUp;

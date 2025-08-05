import React, { useState } from 'react';
import axios from 'axios';

const AuthTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const testAuth = async () => {
    if (!token) {
      setError('No token found in localStorage. Please log in first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/chat/auth-test', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResult(response.data);
    } catch (err) {
      console.error('Auth test error:', err);
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response.data && err.response.data.error) {
          setError(`Auth test failed: ${err.response.data.error}`);
        } else {
          setError(`Auth test failed. Server returned status ${err.response.status}.`);
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your internet connection and try again.');
      } else {
        console.error('Error message:', err.message);
        setError(`Auth test failed: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Authentication Test
      </h3>

      <button
        onClick={testAuth}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Testing...' : 'Test Authentication'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-lg">
          <h4 className="font-medium mb-2">Authentication Successful!</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">User Type:</span> {result.userType}</p>
            <p><span className="font-medium">User ID:</span> {result.userId}</p>
            <p><span className="font-medium">Name:</span> {result.userName}</p>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Token Information</h4>
        <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <p><span className="font-medium">Token Exists:</span> {token ? 'Yes' : 'No'}</p>
          {token && (
            <p>
              <span className="font-medium">Token Preview:</span>{' '}
              {token.substring(0, 20)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthTest;

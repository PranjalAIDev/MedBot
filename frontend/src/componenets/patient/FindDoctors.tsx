import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Heart, MapPin, MessageSquare, CheckCircle } from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  userId: string;
  specialty: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
  };
  isAvailableForChat: boolean;
}

interface FindDoctorsProps {
  onSelectDoctor?: (doctor: Doctor) => void;
}

const FindDoctors: React.FC<FindDoctorsProps> = ({ onSelectDoctor }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [showAllDoctors, setShowAllDoctors] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSending, setRequestSending] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, showAllDoctors]);

  const fetchDoctors = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const url = `http://localhost:5000/api/chat/doctors/search?${selectedSpecialty ? `specialty=${selectedSpecialty}&` : ''}${showAllDoctors ? 'showAll=true' : ''}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDoctors(response.data.doctors || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      // Check if the server is running
      try {
        // Try to ping the server using our status endpoint
        await axios.get('http://localhost:5000/api/status');
        // If we get here, the server is running but there might be an authentication issue
        setError('Failed to fetch doctors. Your session may have expired. Please try logging in again.');
      } catch (pingErr) {
        // If this fails too, the server is likely not running
        setError('Cannot connect to the server. Please make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowRequestForm(true);
    // We'll call onSelectDoctor after the request is sent successfully
  };

  const handleSendRequest = async () => {
    if (!token || !selectedDoctor || !requestMessage.trim()) {
      console.log('Missing required data:', {
        hasToken: !!token,
        hasSelectedDoctor: !!selectedDoctor,
        messageLength: requestMessage.trim().length
      });
      setError('Missing required information. Please try again.');
      return;
    }

    setRequestSending(true);

    try {
      console.log('Sending chat request with data:', {
        doctorId: selectedDoctor._id,
        message: requestMessage.trim(),
        tokenExists: !!token,
        tokenPrefix: token ? token.substring(0, 10) + '...' : 'none'
      });

      const response = await axios.post('http://localhost:5000/api/chat/request', {
        doctorId: selectedDoctor._id,
        message: requestMessage
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Chat request response:', response.data);
      setRequestSuccess(true);
      setRequestMessage('');

      // Hide the form after 3 seconds
      setTimeout(() => {
        setShowRequestForm(false);
        setRequestSuccess(false);
        setSelectedDoctor(null);

        // Now that the request is sent successfully, navigate to chat requests
        if (onSelectDoctor && selectedDoctor) {
          onSelectDoctor(selectedDoctor);
        }
      }, 3000);
    } catch (err) {
      console.error('Error sending chat request:', err);

      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);

        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response.status === 403) {
          setError('You do not have permission to send chat requests. Make sure you are logged in as a patient.');
        } else if (err.response.data && err.response.data.error) {
          setError(`Failed to send chat request: ${err.response.data.error}`);
        } else {
          setError(`Failed to send chat request. Server returned status ${err.response.status}.`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        setError('No response from server. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        setError(`Failed to send chat request: ${err.message}`);
      }
    } finally {
      setRequestSending(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doctor.location.city && doctor.location.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Find Doctors
        </h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={showAllDoctors}
              onChange={(e) => setShowAllDoctors(e.target.checked)}
              className="mr-2"
            />
            Show all doctors
          </label>
          <Heart className="w-5 h-5 text-red-500" />
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-900"
          />
        </div>

        <div>
          <select
            value={selectedSpecialty}
            onChange={(e) => {
              setSelectedSpecialty(e.target.value);
              if (e.target.value) {
                setShowAllDoctors(false);
              }
            }}
            className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-900"
          >
            <option value="">All Specialties</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Oncology">Oncology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="General">General</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{doctor.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {doctor.specialty} Specialist
                    </p>
                    {doctor.location.city && (
                      <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin size={14} className="mr-1" />
                        <span>
                          {doctor.location.city}
                          {doctor.location.state && `, ${doctor.location.state}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDoctorSelect(doctor)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <MessageSquare size={16} />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No heart specialists found. Try adjusting your search.
            </div>
          )}
        </div>
      )}

      {/* Chat Request Modal */}
      {showRequestForm && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Send Chat Request to Dr. {selectedDoctor.name}
            </h3>

            {requestSuccess ? (
              <div className="p-4 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg mb-4 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <h4 className="text-lg font-semibold mb-1">Chat Request Sent Successfully!</h4>
                <p>The doctor will respond to your request soon. You'll be redirected to your chat requests in a moment.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Please provide a brief message about why you'd like to chat with this doctor.
                </p>

                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="I'd like to discuss my heart condition..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  rows={4}
                ></textarea>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendRequest}
                    disabled={!requestMessage.trim() || requestSending}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
                      !requestMessage.trim() || requestSending
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-blue-700'
                    }`}
                  >
                    {requestSending ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDoctors;

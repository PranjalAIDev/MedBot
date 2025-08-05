import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, FileText, MapPin, Heart } from 'lucide-react';

interface DoctorProfileProps {
  onUpdate?: () => void;
}

const DoctorProfile: React.FC<DoctorProfileProps> = ({ onUpdate }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isAvailableForChat, setIsAvailableForChat] = useState(true);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:5000/api/doctor/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setProfile(response.data);
      
      // Initialize form state with profile data
      setSpecialty(response.data.specialty || 'General');
      setCity(response.data.location?.city || '');
      setState(response.data.location?.state || '');
      setCountry(response.data.location?.country || 'USA');
      setIsAvailableForChat(response.data.isAvailableForChat !== false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!token) return;
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const response = await axios.put('http://localhost:5000/api/doctor/profile', 
        {
          specialty,
          city,
          state,
          country,
          isAvailableForChat
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setProfile(response.data.doctor);
      setSaveSuccess(true);
      setIsEditing(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
        {error}
        <button
          onClick={fetchProfile}
          className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Profile not found.
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Dr. {profile.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              License: {profile.licenseNumber}
            </p>
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
      
      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
          Profile updated successfully!
        </div>
      )}
      
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {saveError}
        </div>
      )}
      
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Specialty
            </label>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Oncology">Oncology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="General">General</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="availableForChat"
              checked={isAvailableForChat}
              onChange={(e) => setIsAvailableForChat(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="availableForChat" className="text-gray-700 dark:text-gray-300">
              Available for patient chat requests
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
                isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Specialty: {profile.specialty || 'General'}</span>
            </div>
          </div>
          
          {(profile.location?.city || profile.location?.state) && (
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span>
                {[
                  profile.location?.city,
                  profile.location?.state,
                  profile.location?.country
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span>
              {profile.isAvailableForChat !== false
                ? 'Available for patient chat requests'
                : 'Not available for patient chat requests'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;

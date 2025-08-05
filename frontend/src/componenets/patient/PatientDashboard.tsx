// components/patient/PatientDashboard.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Activity,
  Calendar,
  FileText,
  AlertCircle,
  Clock,
  Heart,
  MessageSquare
} from 'lucide-react';
import FindDoctors from './FindDoctors';
import ChatRequests from './ChatRequests';
import ChatInterface from '../shared/ChatInterface';

interface Appointment {
  _id: string;
  type: string;
  date: string;     // e.g. "2024-03-15T00:00:00.000Z"
  time: string;     // e.g. "10:00 AM"
  status?: string;  // e.g. "Scheduled"
  doctor?: {
    _id: string;
    name: string;
    email?: string;
    licenseNumber?: string;
  };
}

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  schedule: string; // e.g. "8:00 AM"
  status?: string;
}

const PatientDashboard: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'findDoctors' | 'chatRequests' | 'chat'>('overview');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // Retrieve token from localStorage
  const token = localStorage.getItem('token');

  // 1) On mount, get userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  // 2) Fetch appointments
  const fetchAppointments = async () => {
    if (!token) return; // if not logged in, skip
    try {
      const response = await axios.get('http://localhost:5000/api/patient/appointments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allAppointments: Appointment[] = response.data.appointments;

      // Sort appointments by creation time descending based on _id
      const sortedAppointments = allAppointments.sort((a, b) => {
        const aTimestamp = parseInt(a._id.substring(0, 8), 16);
        const bTimestamp = parseInt(b._id.substring(0, 8), 16);
        return bTimestamp - aTimestamp;
      });

      setAppointments(sortedAppointments);

      if (sortedAppointments.length > 0) {
        setNextAppointment(sortedAppointments[0]);
      } else {
        setNextAppointment(null);
      }
    } catch (err: any) {
      console.error('Fetch Appointments Error:', err);
    }
  };

  // 3) Fetch medications
  const fetchMedications = async () => {
    if (!token) return;
    try {
      const response = await axios.get('http://localhost:5000/api/patient/medications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMedications(response.data.medications);
    } catch (err: any) {
      console.error('Fetch Medications Error:', err);
    }
  };

  // 4) On mount, fetch both
  useEffect(() => {
    fetchAppointments();
    fetchMedications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prepare nextAppointment display
  const nextAptDate = nextAppointment
    ? new Date(nextAppointment.date).toLocaleDateString()
    : null;

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveTab('chat');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'findDoctors':
        return <FindDoctors />;
      case 'chatRequests':
        return <ChatRequests onChatSelect={handleChatSelect} />;
      case 'chat':
        return selectedChatId ? (
          <ChatInterface chatId={selectedChatId} userType="patient" />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No chat selected. Please select a chat from your requests.
          </div>
        );
      case 'overview':
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      {/* Vital Signs box */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Vital Signs
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last updated 2h ago
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Blood Pressure</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">120/80</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Heart Rate</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">72 bpm</span>
            </div>
          </div>
        </div>

        {/* Next Appointment Box */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Next Appointment
              </h3>
              {nextAppointment ? (
                nextAppointment.doctor && typeof nextAppointment.doctor === 'object' ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Doctor: {nextAppointment.doctor.name}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    (Doctor info not populated)
                  </p>
                )
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No upcoming appointment
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            {nextAppointment ? (
              <>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {nextAptDate}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {nextAppointment.type} at {nextAppointment.time}
                </p>
              </>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                You have no future appointments
              </p>
            )}
          </div>
        </div>

        {/* Chat with Heart Doctors Box */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
              <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Chat with Doctors
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect with specialists
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setActiveTab('findDoctors')}
              className="w-full py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Heart className="w-4 h-4" />
              <span>Find Doctors</span>
            </button>
            <button
              onClick={() => setActiveTab('chatRequests')}
              className="w-full mt-2 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>View Chat Requests</span>
            </button>
          </div>
        </div>
      </div>

      {/* Another row with 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Upcoming Medications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Upcoming Medications
            </h3>
            <AlertCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            {medications.length > 0 ? (
              medications.map((med) => (
                <div key={med._id} className="flex items-center space-x-4">
                  <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {med.schedule}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {med.name} - {med.dosage}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No upcoming medications.
              </p>
            )}
          </div>
        </div>

        {/* Health Alerts placeholder */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Health Alerts
            </h3>
            <AlertCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-100 dark:border-yellow-700">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                Upcoming vaccination due in 2 weeks
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-100 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Schedule your annual eye examination
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="p-8 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {userId}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {activeTab === 'overview' ? "Here's your health overview" :
           activeTab === 'findDoctors' ? "Find heart specialists near you" :
           activeTab === 'chatRequests' ? "Manage your chat requests" :
           "Chat with your doctor"}
        </p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'overview'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('findDoctors')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'findDoctors'
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-b-2 border-red-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Find Doctors
        </button>
        <button
          onClick={() => setActiveTab('chatRequests')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'chatRequests'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-b-2 border-green-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Chat Requests
        </button>
        {selectedChatId && (
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === 'chat'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Active Chat
          </button>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default PatientDashboard;

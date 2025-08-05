// components/doctor/DoctorDashboard.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../componenets/doctor/DashboardLayout"; // Ensure 'componenets' is correct
import { Stats } from "../../componenets/doctor/Stats";
import { PatientCard } from "../../componenets/doctor/PatientCard";
import { AppointmentList } from "../../componenets/doctor/AppointmentList";
import { AlertsPanel } from "../../componenets/doctor/AlertsPanel";
import DoctorChatManager from "../../componenets/doctor/DoctorChatManager";
import { MessageSquare, Heart, Activity } from "lucide-react";
import axios from "axios";

interface Patient {
  id: string;
  name: string;
  condition: string;
  status: "critical" | "moderate" | "stable";
  lastVisit: string;
}

export function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'overview' | 'chat'>('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch doctor profile
        const profileResponse = await axios.get("http://localhost:5000/api/doctor/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDoctorName(profileResponse.data.name);

        // Fetch patients
        try {
          const patientsResponse = await axios.get("http://localhost:5000/api/doctor/patients", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setPatients(patientsResponse.data.patients || []);
        } catch (patientsErr) {
          console.error("Error fetching patients:", patientsErr);
          // Don't set error for patients, just log it
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
        setError("Failed to fetch profile. Please try again.");
        setLoading(false);

        // Optionally, handle token expiration by redirecting to sign-in
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
          navigate("/doctor/signin");
        }
      }
    };

    fetchData();
  }, [navigate, refreshTrigger]); // Add refreshTrigger to dependencies

  const handlePatientSelect = (patientId: string) => {
    navigate(`/doctor/patient/${patientId}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <DoctorChatManager onChatAccepted={() => setRefreshTrigger(prev => prev + 1)} />;
      case 'overview':
      default:
        return (
          <>
            <Stats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        onClick={() => handlePatientSelect(patient.id)}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No patients found. Add appointments with patients to see them here.</p>
                    </div>
                  )}
                </div>
                <AppointmentList />
              </div>

              <div className="space-y-6">
                <AlertsPanel />

                {/* Chat with Patients Box */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Patient Chats
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage your patient communications
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>View Chat Requests</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
              Welcome back, Doctor {doctorName}
            </h2>
            <h3 className="text-lg text-gray-600 dark:text-gray-300">
              Hope you have a wonderful day ahead
            </h3>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Activity className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {renderContent()}
      </div>
    </DashboardLayout>
  );
}

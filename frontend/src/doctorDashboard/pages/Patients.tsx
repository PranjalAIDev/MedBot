import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../componenets/doctor/DashboardLayout";
import { PatientCard } from "../../componenets/doctor/PatientCard";
import axios from "axios";

interface Patient {
  id: string;
  name: string;
  condition: string;
  status: "critical" | "moderate" | "stable";
  lastVisit: string;
  source?: "appointment" | "chat";
}

export function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/doctor/patients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPatients(response.data.patients || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Failed to fetch patients. Please try again.");
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">
            {error}
          </div>
        ) : patients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => navigate(`/doctor/patient/${patient.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500">No patients found. Add appointments with patients to see them here.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

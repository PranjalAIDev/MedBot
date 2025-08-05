import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Pill, Users, Calendar, X } from 'lucide-react';

interface Medication {
  _id: string;
  name: string;
  dosage: string;
  schedule: string;
  status: string;
}

interface FamilyHistory {
  _id: string;
  name: string;
  relation: string;
  conditions: string[];
}

interface Appointment {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  doctor?: {
    _id: string;
    name: string;
  };
}

interface PatientDetails {
  _id: string;
  name: string;
  userId: string;
  medications: Medication[];
  familyHistory: FamilyHistory[];
  appointments: Appointment[];
}

interface PatientDetailsCardProps {
  patientId: string;
  onClose: () => void;
}

const PatientDetailsCard: React.FC<PatientDetailsCardProps> = ({ patientId, onClose }) => {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    if (!token || !patientId) return;

    setLoading(true);
    setError(null);

    try {
      // First try to get patient details from chat API
      try {
        const response = await axios.get(`http://localhost:5000/api/chat/patient/${patientId}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.patient) {
          setPatient(response.data.patient);
          setLoading(false);
          return;
        }
      } catch (chatErr) {
        console.log('Could not fetch from chat API, trying patient info API');
      }

      // If chat API fails, try the patient info API
      // First, we need to get the userId from the patient ID
      const patientResponse = await axios.get(`http://localhost:5000/api/patient/${patientId}/patient-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPatient(patientResponse.data.patient);
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Failed to fetch patient details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Patient Details
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Patient Details
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Patient Details
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No patient details found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {patient.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Patient ID: {patient.userId}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medications */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <div className="flex items-center space-x-2 mb-4">
              <Pill className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Medications</h4>
            </div>
            {patient.medications && patient.medications.length > 0 ? (
              <ul className="space-y-3">
                {patient.medications.map(med => (
                  <li key={med._id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{med.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {med.dosage} - {med.schedule}
                    </div>
                    <div className="text-xs mt-1">
                      <span className={`px-2 py-1 rounded-full ${
                        med.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {med.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No medications recorded</p>
            )}
          </div>

          {/* Family History */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-purple-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Family History</h4>
            </div>
            {patient.familyHistory && patient.familyHistory.length > 0 ? (
              <ul className="space-y-3">
                {patient.familyHistory.map(fam => (
                  <li key={fam._id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {fam.name} ({fam.relation})
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Conditions:</span> {fam.conditions.join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No family history recorded</p>
            )}
          </div>

          {/* Recent Appointments */}
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-green-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Recent Appointments</h4>
            </div>
            {patient.appointments && patient.appointments.length > 0 ? (
              <ul className="space-y-3">
                {patient.appointments.map(apt => (
                  <li key={apt._id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {apt.type} - {formatDate(apt.date)} at {apt.time}
                      </div>
                      {apt.doctor && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Doctor: {apt.doctor.name}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apt.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : apt.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {apt.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No appointments recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsCard;

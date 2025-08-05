import React, { useState, useEffect } from 'react';
import { User, Mail, AlertCircle, Pill, Users, Plus, X, AlertTriangle, Check, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Medication {
  _id?: string;
  name: string;
  dosage: string;
  schedule: string;
  status: string;
}

interface FamilyMember {
  _id?: string;
  name: string;
  relation: string;
  conditions: string[];
}

interface PatientData {
  _id?: string;
  name: string;
  userId: string;
  email: string;
  patientStatus?: 'critical' | 'moderate' | 'stable';
  medications: Medication[];
  familyHistory: FamilyMember[];
}

export function PatientInfo() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Medication management
  const [showMedicationForm, setShowMedicationForm] = useState<boolean>(false);
  const [newMedication, setNewMedication] = useState<Medication>({
    name: '',
    dosage: '',
    schedule: '',
    status: 'active'
  });

  // Status management
  const [showStatusForm, setShowStatusForm] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<'critical' | 'moderate' | 'stable'>('stable');

  // Action feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Refresh data periodically
  useEffect(() => {
    fetchPatientDetails();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [id, refreshTrigger]);

  const fetchPatientDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      // First try to get patient details from chat API
      try {
        const response = await axios.get(`http://localhost:5000/api/chat/patient/${id}/details`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.patient) {
          setPatient(response.data.patient);
          setSelectedStatus(response.data.patient.patientStatus || 'stable');
          setLoading(false);
          return;
        }
      } catch (chatErr) {
        console.log('Could not fetch from chat API, trying patient info API');
      }

      // If chat API fails, try the patient info API
      try {
        const response = await axios.get(`http://localhost:5000/api/patient/${id}/patient-info`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.patient) {
          setPatient(response.data.patient);
          setSelectedStatus(response.data.patient.patientStatus || 'stable');
        } else {
          setError('No patient data found');
        }
      } catch (err) {
        console.error('Error fetching patient details from patient info API:', err);
        setError('Failed to load patient details. Please try again.');
      }
    } catch (err) {
      console.error('Error in fetchPatientDetails:', err);
      setError('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new medication
  const handleAddMedication = async () => {
    if (!id || !patient) return;

    if (!newMedication.name || !newMedication.dosage || !newMedication.schedule) {
      setActionError('Please fill out all medication fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setActionError('Authentication token not found');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/doctor/patient/${id}/medications`,
        newMedication,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update the patient state with the new medication
      if (response.data.patientMedications) {
        setPatient({
          ...patient,
          medications: response.data.patientMedications
        });
      }

      // Reset form
      setNewMedication({
        name: '',
        dosage: '',
        schedule: '',
        status: 'active'
      });
      setShowMedicationForm(false);
      setActionSuccess('Medication added successfully');

      // Trigger a refresh to ensure data is up-to-date
      setRefreshTrigger(prev => prev + 1);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error adding medication:', err);
      setActionError('Failed to add medication');

      // Clear error message after 3 seconds
      setTimeout(() => {
        setActionError(null);
      }, 3000);
    }
  };

  // Handle deleting a medication
  const handleDeleteMedication = async (medicationId: string) => {
    if (!id || !patient || !medicationId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setActionError('Authentication token not found');
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/doctor/patient/${id}/medications/${medicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update the patient state with the updated medications list
      if (response.data.patientMedications) {
        setPatient({
          ...patient,
          medications: response.data.patientMedications
        });
      }

      setActionSuccess('Medication deleted successfully');

      // Trigger a refresh to ensure data is up-to-date
      setRefreshTrigger(prev => prev + 1);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error deleting medication:', err);
      setActionError('Failed to delete medication');

      // Clear error message after 3 seconds
      setTimeout(() => {
        setActionError(null);
      }, 3000);
    }
  };

  // Handle updating patient status
  const handleUpdateStatus = async () => {
    if (!id || !patient) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setActionError('Authentication token not found');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/doctor/patient/${id}/status`,
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update the patient state with the new status
      setPatient({
        ...patient,
        patientStatus: selectedStatus
      });

      setShowStatusForm(false);
      setActionSuccess('Patient status updated successfully');

      // Trigger a refresh to ensure data is up-to-date
      setRefreshTrigger(prev => prev + 1);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setActionSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating patient status:', err);
      setActionError('Failed to update patient status');

      // Clear error message after 3 seconds
      setTimeout(() => {
        setActionError(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <span>{error || 'Patient information not available'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      {/* Action feedback messages */}
      {actionSuccess && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {actionError}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="h-12 w-12 text-gray-400 dark:text-gray-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{patient.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">Patient ID: {patient.userId}</p>
            {patient.email && (
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mt-1">
                <Mail className="h-4 w-4" />
                <span>{patient.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Patient Status Section */}
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              patient.patientStatus === 'critical'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                : patient.patientStatus === 'moderate'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            }`}>
              {patient.patientStatus || 'stable'}
            </span>
            <button
              onClick={() => setShowStatusForm(!showStatusForm)}
              className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>

          {/* Status Update Form */}
          {showStatusForm && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Update Patient Status</div>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-stable"
                    name="status"
                    value="stable"
                    checked={selectedStatus === 'stable'}
                    onChange={() => setSelectedStatus('stable')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="status-stable" className="text-sm text-gray-700 dark:text-gray-300">Stable</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-moderate"
                    name="status"
                    value="moderate"
                    checked={selectedStatus === 'moderate'}
                    onChange={() => setSelectedStatus('moderate')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="status-moderate" className="text-sm text-gray-700 dark:text-gray-300">Moderate</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="status-critical"
                    name="status"
                    value="critical"
                    checked={selectedStatus === 'critical'}
                    onChange={() => setSelectedStatus('critical')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label htmlFor="status-critical" className="text-sm text-gray-700 dark:text-gray-300">Critical</label>
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleUpdateStatus}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setShowStatusForm(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 rounded-md text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medications Section */}
        <div className="border dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Pill className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Medications</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                className="p-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Refresh medications"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowMedicationForm(!showMedicationForm)}
                className="p-1 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                title="Add medication"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Medication Form */}
          {showMedicationForm && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Medication Name
                  </label>
                  <input
                    type="text"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Aspirin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., 100mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Schedule
                  </label>
                  <input
                    type="text"
                    value={newMedication.schedule}
                    onChange={(e) => setNewMedication({...newMedication, schedule: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Once daily"
                  />
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleAddMedication}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Add Medication
                  </button>
                  <button
                    onClick={() => setShowMedicationForm(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300 rounded-md text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          ) : patient?.medications && patient.medications.length > 0 ? (
            <ul className="space-y-2">
              {patient.medications.map((med, index) => (
                <li key={med._id || index} className="text-sm p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-200">{med.name}</div>
                    <div className="text-gray-600 dark:text-gray-400">{med.dosage}, {med.schedule}</div>
                  </div>
                  <button
                    onClick={() => med._id && handleDeleteMedication(med._id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900"
                    title="Delete medication"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">No medications recorded</p>
          )}
        </div>

        {/* Family History Section */}
        <div className="border dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="h-5 w-5 text-green-500" />
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Family History</h3>
          </div>
          {patient.familyHistory && patient.familyHistory.length > 0 ? (
            <ul className="space-y-2">
              {patient.familyHistory.map((member, index) => (
                <li key={member._id || index} className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="font-medium">{member.name}</span> ({member.relation})
                  {member.conditions && member.conditions.length > 0 && (
                    <div className="mt-1">
                      Conditions: {member.conditions.join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No family history recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Pill, Activity } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
}

interface Patient {
  id: string;
  _id: string;
  name: string;
  patientStatus: 'critical' | 'moderate' | 'stable';
  medications: Array<{
    name: string;
    dosage: string;
    schedule: string;
    status: string;
  }>;
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCriticalPatients();
  }, []);

  const fetchCriticalPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }

      // Fetch patients from the API
      const response = await axios.get('http://localhost:5000/api/doctor/patients', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Filter critical and moderate patients
      const criticalPatients = response.data.patients.filter(
        (patient: any) => patient.status === 'critical' || patient.patientStatus === 'critical'
      );

      const moderatePatients = response.data.patients.filter(
        (patient: any) => patient.status === 'moderate' || patient.patientStatus === 'moderate'
      );

      // Create alerts from critical and moderate patients
      const newAlerts: Alert[] = [];

      // Add critical patients as high severity alerts
      criticalPatients.forEach((patient: any) => {
        newAlerts.push({
          id: `critical-${patient.id}`,
          patientId: patient.id,
          patientName: patient.name,
          message: 'Critical status - requires immediate attention',
          severity: 'high',
          time: 'Now'
        });
      });

      // Add moderate patients as medium severity alerts
      moderatePatients.forEach((patient: any) => {
        newAlerts.push({
          id: `moderate-${patient.id}`,
          patientId: patient.id,
          patientName: patient.name,
          message: 'Moderate status - requires monitoring',
          severity: 'medium',
          time: 'Now'
        });
      });

      setAlerts(newAlerts);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching critical patients:', err);
      setError('Failed to load critical patients');
      setLoading(false);
    }
  };

  const handleAlertClick = (patientId: string) => {
    navigate(`/doctor/patient/${patientId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Critical Alerts</h2>
        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-3 bg-red-50 dark:bg-red-900 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg cursor-pointer hover:opacity-90 ${
                alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900' : 'bg-yellow-50 dark:bg-yellow-900'
              }`}
              onClick={() => handleAlertClick(alert.patientId)}
            >
              <div className="flex items-start">
                <AlertTriangle className={`h-5 w-5 ${
                  alert.severity === 'high' ? 'text-red-500 dark:text-red-300' : 'text-yellow-500 dark:text-yellow-300'
                } mt-0.5 mr-3`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{alert.patientName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{alert.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center">
          <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">No critical patients at the moment</p>
        </div>
      )}
    </div>
  );
}
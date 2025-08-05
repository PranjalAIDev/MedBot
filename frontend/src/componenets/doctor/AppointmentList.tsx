import React, { useState, useEffect } from 'react';
import { Clock, Calendar, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  type: string;
  status: string;
}

export function AppointmentList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/doctor/appointments/today', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Today's Appointments</h2>
        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="p-3 mb-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {error ? (
            <div className="p-3 mb-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
              Failed to fetch appointments. Please try again.
            </div>
          ) : appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{appointment.patientName}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{appointment.time}</span>
                    <span>•</span>
                    <span>{appointment.type || 'Checkup'}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  appointment.status === 'completed' || appointment.status === 'Completed'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : appointment.status === 'scheduled' || appointment.status === 'Scheduled'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : appointment.status === 'cancelled' || appointment.status === 'Cancelled'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {appointment.status ?
                    appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) :
                    'Scheduled'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No appointments scheduled for today.</p>
              <p className="mt-2 text-sm">Appointments scheduled by patients will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
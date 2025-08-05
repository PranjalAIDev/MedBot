import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // <-- import
import { Calendar, Clock, Plus } from 'lucide-react';

// If storing token in localStorage
const token = localStorage.getItem('token');

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    doctorUserId: '',
    date: '',
    time: '',
  });
  const [error, setError] = useState('');

  const navigate = useNavigate(); // for routing after creation

  // OPTIONAL: fetch appointments on this page if you want to display them here
  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patient/appointments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAppointments(response.data.appointments);
    } catch (err) {
      console.error('Fetch Appointments Error:', err);
    }
  };

  // CREATE APPOINTMENT
  const handleCreateAppointment = async () => {
    try {
      // Validate form data
      if (!formData.type || !formData.doctorUserId || !formData.date || !formData.time) {
        setError('Please fill in all appointment fields');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/patient/appointments',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // If success, add new appointment to local state
      setAppointments((prev) => [...prev, response.data.appointment]);

      // Reset form and hide it
      setShowForm(false);
      setFormData({ type: '', doctorUserId: '', date: '', time: '' });
      setError('');

      // Fetch updated appointments instead of navigating away
      // This allows the user to schedule multiple appointments without leaving the page
      fetchAppointments();

    } catch (err: any) {
      console.error('Create Appointment Error:', err);
      if (err.response) {
        if (err.response.status === 404 && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError(err.response.data.error || 'Failed to create appointment');
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  // DELETE APPOINTMENT
  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/patient/appointments/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppointments((prev) => prev.filter((apt) => apt._id !== appointmentId));
    } catch (err: any) {
      console.error('Delete Appointment Error:', err);
      setError(err.response?.data?.error || 'Failed to delete appointment');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Appointments
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Schedule and manage your medical appointments
        </p>
      </header>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-8"
      >
        <Plus className="w-4 h-4" />
        <span>Schedule Appointment</span>
      </button>

      {showForm && (
        <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Schedule New Appointment</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Appointment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Type</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Check-up">Check-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Doctor User ID
              </label>
              <input
                type="text"
                placeholder="Enter doctor's user ID"
                value={formData.doctorUserId}
                onChange={(e) => setFormData({ ...formData, doctorUserId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <button
            onClick={handleCreateAppointment}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            type="button"
          >
            Create Appointment
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setFormData({ type: '', doctorUserId: '', date: '', time: '' });
              setError('');
            }}
            className="px-4 py-2 ml-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            type="button"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Appointments List */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Your Appointments</h3>

        {appointments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">You don't have any appointments scheduled yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => {
              // Format the date for display
              const appointmentDate = new Date(appointment.date);
              const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              // Determine if appointment is upcoming or past
              const isPast = appointmentDate < new Date();

              return (
                <div
                  key={appointment._id}
                  className={`bg-white dark:bg-gray-800 p-6 rounded-lg border ${
                    isPast
                      ? 'border-gray-200 dark:border-gray-700 opacity-75'
                      : 'border-blue-200 dark:border-blue-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        isPast
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'bg-blue-50 dark:bg-blue-900'
                      }`}>
                        <Calendar className={`w-6 h-6 ${
                          isPast
                            ? 'text-gray-500 dark:text-gray-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {appointment.type}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Doctor: {appointment.doctor?.name || appointment.doctor?.userId || 'N/A'}
                        </p>
                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{appointment.time}</span>
                          <span className="mx-2">•</span>
                          <span>{formattedDate}</span>
                        </div>
                        {isPast && (
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            Past appointment
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      {!isPast && (
                        <button
                          onClick={() => handleDeleteAppointment(appointment._id)}
                          className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;

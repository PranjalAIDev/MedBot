import React from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';

const AppointmentsPage = () => {
  return (
    <div className="p-8 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Appointments</h1>
        <p className="text-gray-600 dark:text-gray-400">Schedule and manage your medical appointments</p>
      </header>

      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-8">
        <Plus className="w-4 h-4" />
        <span>Schedule Appointment</span>
      </button>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{appointment.type}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dr. {appointment.doctor}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">Reschedule</button>
                <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500">Cancel</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const appointments = [
  {
    id: 1,
    type: 'Annual Checkup',
    doctor: 'Sarah Wilson',
    date: '2024-03-15',
    time: '10:00 AM',
  },
  {
    id: 2,
    type: 'Dental Cleaning',
    doctor: 'James Brown',
    date: '2024-03-20',
    time: '2:30 PM',
  },
  {
    id: 3,
    type: 'Eye Examination',
    doctor: 'Emily Chen',
    date: '2024-03-25',
    time: '11:15 AM',
  },
];

export default AppointmentsPage;
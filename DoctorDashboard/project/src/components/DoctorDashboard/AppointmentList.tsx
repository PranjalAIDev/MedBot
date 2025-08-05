import React from 'react';
import { Clock, Calendar } from 'lucide-react';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
}

const appointments: Appointment[] = [
  { id: '1', patientName: 'Sarah Johnson', time: '09:00 AM', type: 'Check-up' },
  { id: '2', patientName: 'Mike Peters', time: '10:30 AM', type: 'Follow-up' },
  { id: '3', patientName: 'Emma Wilson', time: '02:00 PM', type: 'Consultation' },
];

export function AppointmentList() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
        <Calendar className="h-5 w-5 text-gray-500" />
      </div>
      <div className="space-y-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Clock className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{appointment.patientName}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{appointment.time}</span>
                <span>•</span>
                <span>{appointment.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
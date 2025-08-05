import React from 'react';
import { Clock, Calendar, FileText } from 'lucide-react';

const mockHistory = [
  {
    date: '2024-03-15',
    type: 'Diagnosis',
    description: 'Annual check-up - All clear',
    doctor: 'Dr. Smith',
  },
  {
    date: '2024-02-28',
    type: 'Medication',
    description: 'Prescribed antibiotic for respiratory infection',
    doctor: 'Dr. Johnson',
  },
  {
    date: '2024-02-15',
    type: 'Lab Result',
    description: 'Blood work - Normal results',
    doctor: 'Dr. Williams',
  },
];

export function MedicalHistory() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Medical History</h2>
        <Clock className="h-5 w-5 text-gray-500" />
      </div>
      <div className="space-y-4">
        {mockHistory.map((event, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              {event.date}
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {event.type}
              </span>
              <p className="mt-1 text-gray-800">{event.description}</p>
              <p className="text-sm text-gray-500">{event.doctor}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 flex items-center text-blue-600 hover:text-blue-700">
        <FileText className="h-4 w-4 mr-1" />
        View Full History
      </button>
    </div>
  );
}
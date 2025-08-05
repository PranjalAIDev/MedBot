import React from 'react';
import { User, AlertCircle, MessageSquare, Calendar } from 'lucide-react';

interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    condition: string;
    status: 'stable' | 'critical' | 'moderate';
    lastVisit: string;
    source?: 'appointment' | 'chat';
  };
  onClick: () => void;
}

export function PatientCard({ patient, onClick }: PatientCardProps) {
  const statusColors = {
    stable: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-left"
    >
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <User className="h-6 w-6 text-gray-500 dark:text-gray-300" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{patient.name}</h3>
          <div className="flex items-center space-x-1">
            {patient.source === 'chat' ? (
              <MessageSquare className="h-3 w-3 text-blue-500" />
            ) : (
              <Calendar className="h-3 w-3 text-green-500" />
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {patient.source === 'chat' ? 'Chat Patient' : 'Appointment Patient'}
            </p>
          </div>
        </div>
        {patient.status === 'critical' && (
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      <div className="mt-3">
        <div className="flex justify-between items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[patient.status]}`}>
            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
          </span>
          {patient.source === 'chat' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              <MessageSquare className="h-3 w-3 mr-1" />
              Chat
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{patient.condition}</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {patient.source === 'chat' ? 'Connected via chat' : `Last visit: ${patient.lastVisit}`}
        </p>
      </div>
    </button>
  );
}
import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

interface Alert {
  id: string;
  patientName: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
}

const alerts: Alert[] = [
  {
    id: '1',
    patientName: 'John Doe',
    message: 'Critical blood pressure readings',
    severity: 'high',
    time: '10 min ago'
  },
  {
    id: '2',
    patientName: 'Mary Smith',
    message: 'Missed medication schedule',
    severity: 'medium',
    time: '1 hour ago'
  }
];

export function AlertsPanel() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Critical Alerts</h2>
        <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg ${
              alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900' : 'bg-yellow-50 dark:bg-yellow-900'
            }`}
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
    </div>
  );
}
import React from 'react';
import { Users, Clock, CalendarCheck, Activity } from 'lucide-react';

const stats = [
  { label: 'Total Patients', value: '124', icon: Users, color: 'blue' },
  { label: 'Appointments Today', value: '8', icon: Clock, color: 'green' },
  { label: 'Critical Cases', value: '3', icon: Activity, color: 'red' },
  { label: 'This Week', value: '32', icon: CalendarCheck, color: 'purple' },
];

export function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <Icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
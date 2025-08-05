import React, { useState, useEffect } from 'react';
import { Users, Clock, CalendarCheck, Activity } from 'lucide-react';
import axios from 'axios';

interface StatsData {
  totalPatients: number;
  todayAppointments: number;
  criticalCases: number;
  weekAppointments: number;
}

export function Stats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<StatsData>({
    totalPatients: 0,
    todayAppointments: 0,
    criticalCases: 0,
    weekAppointments: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:5000/api/doctor/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setStatsData(response.data.stats);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Define stats with dynamic data
  const stats = [
    { label: 'Total Patients', value: statsData.totalPatients.toString(), icon: Users, color: 'blue' },
    { label: 'Appointments Today', value: statsData.todayAppointments.toString(), icon: Clock, color: 'green' },
    { label: 'Critical Cases', value: statsData.criticalCases.toString(), icon: Activity, color: 'red' },
    { label: 'This Week', value: statsData.weekAppointments.toString(), icon: CalendarCheck, color: 'purple' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
              <div className="ml-3 space-y-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg text-red-600 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900`}>
                <Icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
import React from 'react';
import { 
  Activity,
  Calendar,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="p-8 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back, John</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's your health overview</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vital Signs</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last updated 2h ago</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Blood Pressure</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">120/80</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Heart Rate</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">72 bpm</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Next Appointment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dr. Sarah Wilson</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-900 dark:text-gray-100 font-medium">March 15, 2024</p>
            <p className="text-gray-600 dark:text-gray-400">Annual Checkup</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Records</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">2 new updates</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Blood Test Results</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">2d ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">X-Ray Report</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">1w ago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Medications</h3>
            <AlertCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            {[
              { time: '8:00 AM', med: 'Aspirin', dosage: '81mg' },
              { time: '2:00 PM', med: 'Metformin', dosage: '500mg' },
              { time: '8:00 PM', med: 'Lisinopril', dosage: '10mg' },
            ].map((med, idx) => (
              <div key={idx} className="flex items-center space-x-4">
                <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{med.time}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{med.med} - {med.dosage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Health Alerts</h3>
            <AlertCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-100 dark:border-yellow-700">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">Upcoming vaccination due in 2 weeks</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-100 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-400">Schedule your annual eye examination</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
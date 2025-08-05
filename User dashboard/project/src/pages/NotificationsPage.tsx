import React from 'react';
import { Bell, Calendar, FileText, HeartPulse } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-gray-600 dark:text-gray-400">Stay updated with your health information</p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${notification.iconBg}`}>
                  <notification.icon className={`h-6 w-6 ${notification.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                  <span className="mt-2 inline-block text-xs text-gray-400 dark:text-gray-500">
                    {notification.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const notifications = [
  {
    id: 1,
    title: 'Appointment Reminder',
    message: 'You have an appointment with Dr. Sarah Wilson tomorrow at 10:00 AM.',
    time: '2h ago',
    icon: Calendar,
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 2,
    title: 'New Lab Results',
    message: 'Your recent blood test results are now available.',
    time: '1d ago',
    icon: FileText,
    iconBg: 'bg-green-100 dark:bg-green-900',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 3,
    title: 'Medication Reminder',
    message: 'It\'s time to take your medication: Metformin 500mg.',
    time: '3d ago',
    icon: HeartPulse,
    iconBg: 'bg-red-100 dark:bg-red-900',
    iconColor: 'text-red-600 dark:text-red-400',
  },
];

export default NotificationsPage;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  FileText, 
  Users, 
  Calendar,
  Settings,
  LogOut,
  Pill,
  HeartPulse,
  ClipboardList,
  Bell,
  MessageSquare
} from 'lucide-react';

const menuItems = [
  { icon: Activity, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Medical Records', path: '/records' },
  { icon: Users, label: 'Family History', path: '/family' },
  { icon: Calendar, label: 'Appointments', path: '/appointments' },
  { icon: Pill, label: 'Medications', path: '/medications' },
  { icon: HeartPulse, label: 'Vital Signs', path: '/vitals' },
  { icon: ClipboardList, label: 'Lab Results', path: '/lab-results' },
  { icon: MessageSquare, label: 'Messages', path: '/messages' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">MedTrack</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full px-4 py-2">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
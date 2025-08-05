import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../context/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <nav className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-full px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={toggleSidebar} className="focus:outline-none">
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-gray-200">MedDash</span>
            </div>
            <div className="flex items-center">
              <label htmlFor="theme-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    id="theme-toggle"
                    type="checkbox"
                    className="sr-only"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                  <div className="block bg-gray-200 dark:bg-gray-700 w-12 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white dark:bg-gray-900 w-4 h-4 rounded-full transition transform"></div>
                </div>
                <span className="ml-4 text-gray-600 dark:text-gray-300">Theme</span>
              </label>
            </div>
          </div>
        </div>
      </nav>
      {isSidebarOpen && <Sidebar />}
      <main className={`flex-1 pt-16 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
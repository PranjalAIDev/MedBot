import React from 'react';
import { FileText, Upload, Search } from 'lucide-react';

const RecordsPage = () => {
  return (
    <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your medical documents</p>
      </header>

      <div className="flex space-x-4 mb-8">
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search records..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {records.map((record) => (
          <div key={record.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{record.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{record.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const records = [
  { id: 1, name: 'Annual Physical Report', date: 'March 1, 2024' },
  { id: 2, name: 'Blood Test Results', date: 'February 15, 2024' },
  { id: 3, name: 'Vaccination Record', date: 'January 10, 2024' },
  { id: 4, name: 'X-Ray Report', date: 'December 5, 2023' },
];

export default RecordsPage;
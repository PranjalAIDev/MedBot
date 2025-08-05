import React from 'react';
import { BarChart2 } from 'lucide-react';

export function GraphCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Graphs</h2>
        <BarChart2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">Graph content goes here</span>
      </div>
    </div>
  );
}
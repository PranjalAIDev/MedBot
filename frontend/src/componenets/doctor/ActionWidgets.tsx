import React from 'react';
import { PlusCircle, Bell, Video, Upload } from 'lucide-react';

export function ActionWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center space-x-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <PlusCircle className="h-6 w-6 text-blue-600" />
        </div>
        <span className="font-medium text-gray-700">Add Note</span>
      </button>
      
      <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center space-x-3">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Upload className="h-6 w-6 text-purple-600" />
        </div>
        <span className="font-medium text-gray-700">Upload Documents</span>
      </button>
      
      <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center space-x-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <Video className="h-6 w-6 text-green-600" />
        </div>
        <span className="font-medium text-gray-700">Start Call</span>
      </button>
      
      <button className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center space-x-3">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <Bell className="h-6 w-6 text-yellow-600" />
        </div>
        <span className="font-medium text-gray-700">Set Alert</span>
      </button>
    </div>
  );
}
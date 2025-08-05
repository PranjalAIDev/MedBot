import React from 'react';
import { User, Phone, Mail, MapPin } from 'lucide-react';

export function PatientInfo() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-12 w-12 text-gray-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">John Doe</h2>
          <p className="text-gray-500">Patient ID: #12345</p>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Phone className="h-5 w-5" />
          <span>(555) 123-4567</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Mail className="h-5 w-5" />
          <span>john.doe@email.com</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="h-5 w-5" />
          <span>New York, NY</span>
        </div>
      </div>
    </div>
  );
}
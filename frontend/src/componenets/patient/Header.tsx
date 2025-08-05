import React from 'react';
import { User } from 'lucide-react';

const Header = () => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="bg-indigo-100 p-3 rounded-full mb-4">
        <User className="h-8 w-8 text-indigo-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
      <p className="text-gray-500 text-sm mt-1">Sign in or create your account</p>
    </div>
  );
};

export default Header;
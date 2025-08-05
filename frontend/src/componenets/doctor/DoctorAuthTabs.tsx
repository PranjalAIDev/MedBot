import React, { useState } from 'react';
import DoctorSignIn from './DoctorSignIn';
import DoctorSignUp from './DoctorSignUp';

const DoctorAuthTabs = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="w-full max-w-md">
      <div className="flex mb-6">
        <button
          className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'signin'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 border-b border-gray-200 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('signin')}
        >
          Sign In
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium transition-colors ${activeTab === 'signup'
            ? 'text-blue-600 border-b-2 border-blue-600'
            : 'text-gray-500 border-b border-gray-200 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('signup')}
        >
          Sign Up
        </button>
      </div>
      {activeTab === 'signin' ? <DoctorSignIn /> : <DoctorSignUp />}
    </div>
  );
};

export default DoctorAuthTabs;

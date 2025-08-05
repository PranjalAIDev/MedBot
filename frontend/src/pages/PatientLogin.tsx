// src/pages/PatientLogin.tsx

import React from 'react';
import Header from '../componenets/patient/Header';
import PatientAuthTabs from '../componenets/patient/PatientAuthTabs';

const PatientLogin: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <Header />
                <PatientAuthTabs />
            </div>
        </div>
    );
};

export default PatientLogin;

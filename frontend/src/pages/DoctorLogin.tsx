import React from 'react';
import { Stethoscope } from 'lucide-react';
import DoctorAuthTabs from '../componenets/doctor/DoctorAuthTabs';

const DoctorLogin: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full mb-4">
                        <Stethoscope className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Doctor Portal</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in or create your account</p>
                </div>

                <DoctorAuthTabs />
            </div>
        </div>
    );
};

export default DoctorLogin;
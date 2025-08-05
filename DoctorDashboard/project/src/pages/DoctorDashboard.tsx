import React from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Stats } from '../components/DoctorDashboard/Stats';
import { PatientCard } from '../components/DoctorDashboard/PatientCard';
import { AppointmentList } from '../components/DoctorDashboard/AppointmentList';
import { AlertsPanel } from '../components/DoctorDashboard/AlertsPanel';
import { useNavigate } from 'react-router-dom';

const mockPatients = [
  {
    id: 'P001',
    name: 'John Doe',
    condition: 'Hypertension',
    status: 'critical' as const,
    lastVisit: '2024-03-15',
  },
  {
    id: 'P002',
    name: 'Sarah Johnson',
    condition: 'Diabetes Type 2',
    status: 'stable' as const,
    lastVisit: '2024-03-14',
  },
  {
    id: 'P003',
    name: 'Mike Peters',
    condition: 'Post-surgery recovery',
    status: 'moderate' as const,
    lastVisit: '2024-03-13',
  },
];

export function DoctorDashboard() {
  const navigate = useNavigate();

  const handlePatientSelect = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Welcome back, Doctor John</h2>
        <h3 className="text-lg text-gray-600 dark:text-gray-300">Hope you have a wonderful day ahead</h3>
        
        <Stats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockPatients.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => handlePatientSelect(patient.id)}
                />
              ))}
            </div>
            <AppointmentList />
          </div>
          
          <div className="space-y-6">
            <AlertsPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { PatientCard } from '../components/DoctorDashboard/PatientCard';

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

export function Patients() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => navigate(`/patient/${patient.id}`)}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
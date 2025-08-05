import React from 'react';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { AppointmentList } from '../components/DoctorDashboard/AppointmentList';

export function Appointments() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <AppointmentList />
      </div>
    </DashboardLayout>
  );
}
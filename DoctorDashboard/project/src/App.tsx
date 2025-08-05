import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDetails } from './pages/PatientDetails';
import { Messages } from './pages/Messages';
import { Appointments } from './pages/Appointments';
import { Settings } from './pages/Settings';
import { Notifications } from './pages/Notifications';
import { Patients } from './pages/Patients';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DoctorDashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patient/:id" element={<PatientDetails />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
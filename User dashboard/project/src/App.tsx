import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import RecordsPage from './pages/RecordsPage';
import FamilyHistoryPage from './pages/FamilyHistoryPage';
import AppointmentsPage from './pages/AppointmentsPage';
import SettingsPage from './pages/SettingsPage';
import DoctorLogin from './pages/auth/DoctorLogin';
import DoctorSignup from './pages/auth/DoctorSignup';
import PatientLogin from './pages/auth/PatientLogin';
import PatientSignup from './pages/auth/PatientSignup';
import MedicationsPage from './pages/MedicationsPage';
import VitalsPage from './pages/VitalsPage';
import LabResultsPage from './pages/LabResultsPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/doctor/login" element={<DoctorLogin />} />
        <Route path="/auth/doctor/signup" element={<DoctorSignup />} />
        <Route path="/auth/patient/login" element={<PatientLogin />} />
        <Route path="/auth/patient/signup" element={<PatientSignup />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/family" element={<FamilyHistoryPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/vitals" element={<VitalsPage />} />
          <Route path="/lab-results" element={<LabResultsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
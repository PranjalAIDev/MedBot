import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import PatientLogin from "./pages/PatientLogin";
import DoctorLogin from "./pages/DoctorLogin";
import Graph from "./pages/Graph";
import Layout from "./componenets/patient/Layout";
import DashboardPage from "./patientDashboard/pages/DashboardPage";
import RecordsPage from "./patientDashboard/pages/RecordsPage";
import FamilyHistoryPage from "./patientDashboard/pages/FamilyHistoryPage";
import AppointmentsPage from "./patientDashboard/pages/AppointmentsPage";
import MedicationsPage from "./patientDashboard/pages/MedicationsPage";
import VitalsPage from "./patientDashboard/pages/VitalsPage";
import ChatsPage from "./patientDashboard/pages/ChatsPage";
import NotificationsPage from "./patientDashboard/pages/NotificationsPage";
import SettingsPage from "./patientDashboard/pages/SettingsPage";
import { DoctorDashboard } from "./doctorDashboard/pages/DoctorDashboard";
import { Patients } from "./doctorDashboard/pages/Patients";
import { PatientDetails } from "./doctorDashboard/pages/PatientDetails";
import { Appointments } from "./doctorDashboard/pages/Appointments";
import Chats from "./doctorDashboard/pages/Chats";
import { Notifications } from "./doctorDashboard/pages/Notifications";
import Settings from "./doctorDashboard/pages/Settings";
import { ThemeProvider } from "./componenets/doctor/ThemeContext";
import Chat4Health from "./componenets/patient/Chat4Health";
import Realtime from "./pages/RealTime";

function App() {
  return (
    <>
      {/* Define all routes here */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/patientlogin" element={<PatientLogin />} />
        <Route path="/doctorlogin" element={<DoctorLogin />} />
        <Route path="/realtime" element={<Realtime />} />

        {/* Patient Dashboard Routes */}
        <Route element={<Layout />}>
          <Route path="/patientDashboard" element={<DashboardPage />} />
          <Route path="/graph" element={<Graph />} />

          <Route path="/records" element={<RecordsPage />} />
          <Route path="/family" element={<FamilyHistoryPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/medications" element={<MedicationsPage />} />
          <Route path="/vitals" element={<VitalsPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/chat4health" element={<Chat4Health />} />
        </Route>

        {/* Doctor Dashboard Routes */}
        <Route
          path="/doctor/*"
          element={
            <ThemeProvider>
              <Routes>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="patients" element={<Patients />} />
                <Route path="patient/:id" element={<PatientDetails />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="chats" element={<Chats />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </ThemeProvider>
          }
        />
      </Routes>
    </>
  );
}

export default App;

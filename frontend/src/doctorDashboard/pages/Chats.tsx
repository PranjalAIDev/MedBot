import React from "react";
import { DashboardLayout } from "../../componenets/doctor/DashboardLayout";
import DoctorChatManager from "../../componenets/doctor/DoctorChatManager";

export function Chats() {
  return (
    <DashboardLayout>
      <div className="p-8 h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Patient Chats</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage chat requests and communicate with your patients
          </p>
        </header>

        <DoctorChatManager />
      </div>
    </DashboardLayout>
  );
}

export default Chats;

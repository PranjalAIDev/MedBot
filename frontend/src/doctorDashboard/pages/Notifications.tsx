import React from "react";
import { DashboardLayout } from "../../componenets/doctor/DashboardLayout";
import { AlertsPanel } from "../../componenets/doctor/AlertsPanel";

export function Notifications() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Notifications
        </h1>
        <AlertsPanel />
      </div>
    </DashboardLayout>
  );
}

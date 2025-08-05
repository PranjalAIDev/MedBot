import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../componenets/doctor/DashboardLayout";
import { PatientInfo } from "../../componenets/doctor/PatientInfo";
import { ActionWidgets } from "../../componenets/doctor/ActionWidgets";
import { VitalsChart } from "../../componenets/doctor/VitalsChart";
import { MedicalHistory } from "../../componenets/doctor/MedicalHistory";
import { GraphCard } from "../../componenets/doctor/GraphCard";
import Graph from "../../pages/Graph";

export function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Patient Details
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Back
          </button>
        </div>
        <PatientInfo />
        <ActionWidgets />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VitalsChart />
          <MedicalHistory />
        </div>
        <Graph />
      </div>
    </DashboardLayout>
  );
}

import React from "react";
import {
  LineChart,
  Activity,
  Heart,
  Droplets,
  Pill,
  Calendar,
  Repeat,
} from "lucide-react";

const mockVitalsData = {
  bloodPressure: { time: "16:00", systolic: 118, diastolic: 78 },
  heartRate: 70,
  oxygenLevels: 98,
  medications: [
    { name: "Aspirin", frequency: "Once daily", startDate: "2024-01-01" },
    { name: "Metformin", frequency: "Twice daily", startDate: "2024-01-05" },
    { name: "Lisinopril", frequency: "Once daily", startDate: "2024-01-10" },
  ],
};

export function VitalsChart() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Vital Signs
        </h2>
        <LineChart className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Blood Pressure
            </span>
          </div>
          <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            <li>
              {mockVitalsData.bloodPressure.time}:{" "}
              {mockVitalsData.bloodPressure.systolic}/
              {mockVitalsData.bloodPressure.diastolic} mmHg
            </li>
          </ul>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
          <div className="flex items-center">
            <Heart className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Heart Rate
            </span>
          </div>
          <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            <li>{mockVitalsData.heartRate} bpm</li>
          </ul>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
          <div className="flex items-center">
            <Droplets className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Oxygen Levels
            </span>
          </div>
          <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            <li>{mockVitalsData.oxygenLevels}%</li>
          </ul>
        </div>
      </div>
      <hr className="my-6 border-gray-200 dark:border-gray-700" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Medications
        </h2>
        <Pill className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="space-y-4">
        {mockVitalsData.medications.map((med, index) => (
          <div
            key={index}
            className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg shadow-sm flex justify-between items-center"
          >
            <div>
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-100">
                {med.name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Repeat className="h-4 w-4 mr-1" />
                <span>{med.frequency}</span>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{med.startDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

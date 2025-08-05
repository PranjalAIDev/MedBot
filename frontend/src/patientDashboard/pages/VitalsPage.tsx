import React from "react";
import { HeartPulse, Activity, Thermometer, Weight } from "lucide-react";
import Graph from "../../pages/Graph";

const VitalsPage = () => {
  return (
    <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Vital Signs</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your health metrics
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vitals.map((vital) => (
          <div
            key={vital.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                <vital.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {vital.name}
                </h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {vital.value}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {vital.lastUpdated}
            </div>
          </div>
        ))}
      </div>
      <br />
      <br />
      <Graph />
    </div>
  );
};

const vitals = [
  {
    id: 1,
    name: "Blood Pressure",
    value: "120/80 mmHg",
    lastUpdated: "2h ago",
    icon: HeartPulse,
  },
  {
    id: 2,
    name: "Heart Rate",
    value: "72 bpm",
    lastUpdated: "2h ago",
    icon: Activity,
  },
  {
    id: 3,
    name: "Temperature",
    value: "98.6°F",
    lastUpdated: "2h ago",
    icon: Thermometer,
  },
  {
    id: 4,
    name: "Weight",
    value: "165 lbs",
    lastUpdated: "1d ago",
    icon: Weight,
  },
];

export default VitalsPage;

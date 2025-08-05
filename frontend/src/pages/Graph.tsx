import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const Graph: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/metrics");
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;

  // Graph configuration for each metric
  const fastingGlucoseData = {
    labels: data?.timestamps || [],
    datasets: [
      {
        label: "Fasting Glucose (mg/dL)",
        data: data?.metrics?.fastingGlucose || [],
        borderColor: "blue",
        fill: false,
      },
    ],
  };

  const postPrandialGlucoseData = {
    labels: data?.timestamps || [],
    datasets: [
      {
        label: "Post-Prandial Glucose (mg/dL)",
        data: data?.metrics?.postPrandialGlucose || [],
        borderColor: "green",
        fill: false,
      },
    ],
  };

  const hba1cData = {
    labels: data?.timestamps || [],
    datasets: [
      {
        label: "HbA1c (%)",
        data: data?.metrics?.hba1c || [],
        borderColor: "red",
        fill: false,
      },
    ],
  };

  // Y-axis options for each graph
  const fastingGlucoseOptions = {
    scales: {
      y: {
        suggestedMin: 110,
        suggestedMax: 130,
        title: {
          display: true,
          text: "mg/dL",
        },
      },
    },
  };

  const postPrandialGlucoseOptions = {
    scales: {
      y: {
        suggestedMin: 140,
        suggestedMax: 160,
        title: {
          display: true,
          text: "mg/dL",
        },
      },
    },
  };

  const hba1cOptions = {
    scales: {
      y: {
        suggestedMin: 6.0,
        suggestedMax: 7.0,
        title: {
          display: true,
          text: "%",
        },
      },
    },
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-bold mb-4">
        Health Metrics Trends
      </h1>
      <br />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fasting Glucose */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2 text-black">Fasting Glucose</h2>
          <Line data={fastingGlucoseData} options={fastingGlucoseOptions} />
        </div>

        {/* Post-Prandial Glucose */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2 text-black">
            Post-Prandial Glucose
          </h2>
          <Line
            data={postPrandialGlucoseData}
            options={postPrandialGlucoseOptions}
          />
        </div>

        {/* HbA1c */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2 text-black">HbA1c</h2>
          <Line data={hba1cData} options={hba1cOptions} />
        </div>
      </div>
    </div>
  );
};

export default Graph;

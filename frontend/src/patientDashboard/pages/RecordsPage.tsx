import React, { useState, useEffect } from "react";
import { FileText, Upload, Search, X, Download } from "lucide-react";

const RecordsPage = () => {
  const [file, setFile] = useState(null);
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch records from the server
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/uploads");
        if (!response.ok) {
          throw new Error("Failed to fetch records");
        }

        const data = await response.json();
        setRecords(data); // Update records state with fetched data
        setLoading(false);
      } catch (err) {
        console.error("Error fetching records:", err.message);
        setError("Failed to fetch records.");
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // Filter records based on search query
  const filteredRecords = searchQuery
    ? records.filter((record) =>
        record.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : records; // Show all records if searchQuery is empty

  // Handle file change
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("medicalReport", file);

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      alert("File uploaded successfully: " + data.message);

      // Refresh records after upload
      const refreshedResponse = await fetch(
        "http://localhost:3000/api/uploads"
      );
      const refreshedData = await refreshedResponse.json();
      setRecords(refreshedData);
      setFile(null); // Reset file input
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file download
  const handleDownload = async (id, fileName) => {
    try {
      const response = await fetch(`http://localhost:3000/api/download/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Convert the response to a Blob and create a download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "downloaded-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading file:", err.message);
      alert("Error downloading file: " + err.message);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Medical Records</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your medical documents
        </p>
      </header>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setIsModalOpen(true)} // Open modal
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery} // Bind input value to searchQuery state
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query
            placeholder="Search records..."
            className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p>Loading records...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div
              key={record._id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center space-x-4">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {record.fileName || "Unnamed Record"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(record.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(record._id, record.fileName)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-500"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No records found.</p>
        )}
      </div>

      {/* Modal for file upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Upload Document
              </h2>
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="text-gray-600 dark:text-gray-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="file"
              accept="application/pdf, image/*"
              onChange={handleFileChange}
              className="mb-4 w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleUpload}
              disabled={isSubmitting} // Disable button while submitting
              className={`w-full px-4 py-2 text-white rounded-lg ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <span className="loader mr-2"></span> Submitting...
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;

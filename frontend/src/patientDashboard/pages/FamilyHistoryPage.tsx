import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Plus, Trash } from "lucide-react";

const FamilyHistoryPage = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    relation: "",
    conditions: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Retrieve token from localStorage
  const token = localStorage.getItem("token");

  // Fetch family history on component mount
  const fetchFamilyHistory = async () => {
    if (!token) {
      setError("Unauthorized. Please log in.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/patient/family-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFamilyMembers(response.data.familyHistory);
      setError("");
    } catch (err) {
      console.error("Fetch Family History Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a new family member
  const handleAddMember = async () => {
    if (!newMember.name || !newMember.relation || !newMember.conditions) {
      alert("Please fill out all fields");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/patient/family-history",
        newMember,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFamilyMembers(response.data.familyHistory);
      setShowForm(false);
      setNewMember({ name: "", relation: "", conditions: "" });
      setError("");
    } catch (err) {
      console.error("Add Family Member Error:", err);
    }
  };

  // Delete a family member
  const handleDeleteMember = async (famId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/patient/family-history/${famId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFamilyMembers(response.data.familyHistory);
      setError("");
    } catch (err) {
      console.error("Delete Family Member Error:", err);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Family Health History
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track and manage hereditary health conditions
        </p>
      </header>

      {/* Display error messages */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Family Member Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-8"
      >
        <Plus className="w-4 h-4" />
        <span>Add Family Member</span>
      </button>

      {/* Add Family Member Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Add New Family Member
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={newMember.name}
              onChange={(e) =>
                setNewMember({ ...newMember, name: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
            />
            <input
              type="text"
              placeholder="Relation"
              value={newMember.relation}
              onChange={(e) =>
                setNewMember({ ...newMember, relation: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
            />
            <input
              type="text"
              placeholder="Conditions (comma-separated)"
              value={newMember.conditions}
              onChange={(e) =>
                setNewMember({ ...newMember, conditions: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700"
            />
            <button
              onClick={handleAddMember}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save Member
            </button>
          </div>
        </div>
      )}

      {/* Family Members List */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {familyMembers.map((member: any) => (
            <div
              key={member._id} // Use _id from MongoDB
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 relative"
            >
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteMember(member._id)}
                className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
              >
                <Trash className="w-4 h-4" />
              </button>

              {/* Family Member Details */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.relation}
                  </p>
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Medical Conditions:
                </h4>
                <ul className="space-y-1">
                  {member.conditions.map((condition: string, index: number) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      • {condition}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyHistoryPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, User, FileText } from 'lucide-react';
import PatientDetailsCard from './PatientDetailsCard';

interface ChatRequest {
  _id: string;
  patient: {
    _id: string;
    name: string;
    userId: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: string;
  chat?: string;
}

interface ChatRequestsProps {
  onChatSelect?: (chatId: string) => void;
  onViewPatient?: (patientId: string) => void;
  onChatAccepted?: () => void;
}

const ChatRequests: React.FC<ChatRequestsProps> = ({ onChatSelect, onViewPatient, onChatAccepted }) => {
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/chat/requests/doctor', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRequests(response.data.requests || []);
    } catch (err) {
      console.error('Error fetching chat requests:', err);
      // Check if the server is running
      try {
        // Try to ping the server using our status endpoint
        await axios.get('http://localhost:5000/api/status');
        // If we get here, the server is running but there might be an authentication issue
        setError('Failed to fetch chat requests. Your session may have expired. Please try logging in again.');
      } catch (pingErr) {
        // If this fails too, the server is likely not running
        setError('Cannot connect to the server. Please make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!token) return;

    setProcessingId(requestId);

    try {
      const response = await axios.put(`http://localhost:5000/api/chat/request/${requestId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state with the updated request
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? { ...req, status, chat: response.data.request.chat } : req
        )
      );

      if (status === 'accepted') {
        // If chat was accepted, notify parent component to refresh patient list
        if (onChatAccepted) {
          onChatAccepted();
        }

        // If there's a chat ID and onChatSelect handler, call it
        if (response.data.request.chat && onChatSelect) {
          onChatSelect(response.data.request.chat);
        }
      }
    } catch (err) {
      console.error(`Error ${status} chat request:`, err);
      setError(`Failed to ${status} chat request. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewPatient = (patientId: string) => {
    setViewingPatientId(patientId);

    if (onViewPatient) {
      onViewPatient(patientId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      {viewingPatientId && (
        <PatientDetailsCard
          patientId={viewingPatientId}
          onClose={() => setViewingPatientId(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Patient Chat Requests
        </h3>
        <button
          onClick={fetchRequests}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.filter(req => req.status === 'pending').length > 0 ? (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Pending Requests</h4>
              {requests
                .filter(req => req.status === 'pending')
                .map((request) => (
                  <div
                    key={request._id}
                    className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg mb-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {request.patient.name}
                          </h4>
                          <button
                            onClick={() => handleViewPatient(request.patient._id)}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="View Patient Records"
                          >
                            <FileText size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Requested on {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        <Clock size={12} className="mr-1" />
                        Pending
                      </span>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Patient message:</span> {request.message}
                      </p>
                    </div>

                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        onClick={() => handleRequestAction(request._id, 'rejected')}
                        disabled={processingId === request._id}
                        className={`flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors ${
                          processingId === request._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <XCircle size={16} />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => handleRequestAction(request._id, 'accepted')}
                        disabled={processingId === request._id}
                        className={`flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                          processingId === request._id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <CheckCircle size={16} />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No pending requests.
            </div>
          )}

          {/* Processed Requests */}
          {requests.filter(req => req.status !== 'pending').length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Processed Requests</h4>
              {requests
                .filter(req => req.status !== 'pending')
                .map((request) => (
                  <div
                    key={request._id}
                    className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg mb-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {request.patient.name}
                          </h4>
                          <button
                            onClick={() => handleViewPatient(request.patient._id)}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            title="View Patient Records"
                          >
                            <FileText size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Processed on {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'accepted'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {request.status === 'accepted' ? (
                          <>
                            <CheckCircle size={12} className="mr-1" />
                            Accepted
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="mr-1" />
                            Declined
                          </>
                        )}
                      </span>
                    </div>

                    {request.status === 'accepted' && request.chat && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => onChatSelect && onChatSelect(request.chat!)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <span>View Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              You don't have any chat requests.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatRequests;

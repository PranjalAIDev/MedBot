import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface ChatRequest {
  _id: string;
  doctor: {
    _id: string;
    name: string;
    userId: string;
    specialty: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: string;
  chat?: string;
}

interface ChatRequestsProps {
  onChatSelect?: (chatId: string) => void;
}

const ChatRequests: React.FC<ChatRequestsProps> = ({ onChatSelect }) => {
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/chat/requests/patient', {
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

  const handleChatSelect = (chatId: string) => {
    if (onChatSelect) {
      onChatSelect(chatId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle size={12} className="mr-1" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Your Chat Requests
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
          {requests.length > 0 ? (
            requests.map((request) => (
              <div
                key={request._id}
                className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Dr. {request.doctor.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.doctor.specialty} Specialist
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Requested on {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <div>{getStatusBadge(request.status)}</div>
                </div>

                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Your message:</span> {request.message}
                  </p>
                </div>

                {request.status === 'accepted' && request.chat && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => handleChatSelect(request.chat!)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MessageSquare size={16} />
                      <span>Open Chat</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              You haven't sent any chat requests yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatRequests;

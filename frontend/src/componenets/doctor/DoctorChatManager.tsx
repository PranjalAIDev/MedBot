import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, User, Heart } from 'lucide-react';
import ChatRequests from './ChatRequests';
import ChatInterface from '../shared/ChatInterface';

interface DoctorChatManagerProps {
  doctorId?: string;
  onChatAccepted?: () => void;
}

const DoctorChatManager: React.FC<DoctorChatManagerProps> = ({ doctorId, onChatAccepted }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'chats' | 'activeChat'>('requests');
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'chats') {
      fetchChats();
    }
  }, [activeTab]);

  const fetchChats = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/messages/chats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChats(response.data.chats || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
      // Check if the server is running
      try {
        // Try to ping the server using our status endpoint
        await axios.get('http://localhost:5000/api/status');
        // If we get here, the server is running but there might be an authentication issue
        setError('Failed to fetch chats. Your session may have expired. Please try logging in again.');
      } catch (pingErr) {
        // If this fails too, the server is likely not running
        setError('Cannot connect to the server. Please make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveTab('activeChat');
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'requests':
        return (
          <ChatRequests
            onChatSelect={handleChatSelect}
            onViewPatient={handlePatientSelect}
            onChatAccepted={onChatAccepted}
          />
        );
      case 'chats':
        return (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Active Chats
              </h3>
              <button
                onClick={fetchChats}
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
                {chats.length > 0 ? (
                  chats.map((chat) => (
                    <div
                      key={chat._id}
                      className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                      onClick={() => handleChatSelect(chat._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {chat.patient.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Last activity: {new Date(chat.lastActivity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {chat.status}
                          </span>
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                        </div>
                      </div>

                      {chat.messages && chat.messages.length > 0 && (
                        <div className="mt-2 pl-13">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            Last message: {chat.messages[chat.messages.length - 1].content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    You don't have any active chats.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case 'activeChat':
        return selectedChatId ? (
          <ChatInterface chatId={selectedChatId} userType="doctor" />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No chat selected. Please select a chat to start messaging.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'requests'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Chat Requests
        </button>
        <button
          onClick={() => setActiveTab('chats')}
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === 'chats'
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-b-2 border-green-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Active Chats
        </button>
        {selectedChatId && (
          <button
            onClick={() => setActiveTab('activeChat')}
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === 'activeChat'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Current Chat
          </button>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default DoctorChatManager;

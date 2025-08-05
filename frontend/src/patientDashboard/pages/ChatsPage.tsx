import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageSquare, Shield } from 'lucide-react';
import FindDoctors from '../../componenets/patient/FindDoctors';
import ChatRequests from '../../componenets/patient/ChatRequests';
import ChatInterface from '../../componenets/shared/ChatInterface';
import AuthTest from '../../componenets/patient/AuthTest';

const ChatsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'findDoctors' | 'chatRequests' | 'chat' | 'authTest'>('chatRequests');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'chatRequests') {
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
      // Don't set error here to avoid showing error message when there are no chats
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setActiveTab('chat');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'findDoctors':
        return <FindDoctors onSelectDoctor={() => {
          // Refresh the chat requests when switching tabs
          fetchChats();
          setActiveTab('chatRequests');
        }} />;
      case 'chatRequests':
        return <ChatRequests onChatSelect={handleChatSelect} />;
      case 'chat':
        return selectedChatId ? (
          <ChatInterface chatId={selectedChatId} userType="patient" />
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No chat selected. Please select a chat from your requests.
          </div>
        );
      case 'authTest':
        return <AuthTest />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="p-6 md:p-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Doctor Chats</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with heart specialists and manage your conversations
          </p>
        </header>

        <div className="flex flex-wrap space-x-1 md:space-x-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6">
          <button
            onClick={() => setActiveTab('findDoctors')}
            className={`px-3 md:px-4 py-2 rounded-t-lg ${
              activeTab === 'findDoctors'
                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-b-2 border-red-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <div className="flex items-center space-x-1 md:space-x-2">
              <Heart className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Find Doctors</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('chatRequests')}
            className={`px-3 md:px-4 py-2 rounded-t-lg ${
              activeTab === 'chatRequests'
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-b-2 border-green-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <div className="flex items-center space-x-1 md:space-x-2">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Chat Requests</span>
            </div>
          </button>
          {selectedChatId && (
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 md:px-4 py-2 rounded-t-lg ${
                activeTab === 'chat'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <div className="flex items-center space-x-1 md:space-x-2">
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Active Chat</span>
              </div>
            </button>
          )}
          <button
            onClick={() => setActiveTab('authTest')}
            className={`px-3 md:px-4 py-2 rounded-t-lg ${
              activeTab === 'authTest'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-b-2 border-purple-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <div className="flex items-center space-x-1 md:space-x-2">
              <Shield className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Auth Test</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 md:px-8 pb-6 overflow-hidden">
        {activeTab === 'chat' && selectedChatId ? (
          <div className="h-full max-h-[calc(100vh-14rem)]">
            {renderContent()}
          </div>
        ) : (
          <div className="h-full">
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPage;

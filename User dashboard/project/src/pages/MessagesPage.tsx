import React from 'react';
import { MessageSquare, Search, Send } from 'lucide-react';

const MessagesPage = () => {
  return (
    <div className="p-8 h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-gray-600 dark:text-gray-400">Communicate with your healthcare providers</p>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Contacts List */}
        <div className="col-span-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search contacts..."
                className="pl-10 pr-4 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Dr. {contact.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{contact.specialty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Dr. Sarah Wilson</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cardiologist</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {/* Messages will go here */}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const contacts = [
  {
    id: 1,
    name: 'Sarah Wilson',
    specialty: 'Cardiologist',
  },
  {
    id: 2,
    name: 'James Brown',
    specialty: 'Primary Care',
  },
  {
    id: 3,
    name: 'Emily Chen',
    specialty: 'Neurologist',
  },
];

export default MessagesPage;
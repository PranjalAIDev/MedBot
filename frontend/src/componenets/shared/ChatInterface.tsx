import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import axios from 'axios';
import { Send, User, RefreshCw, FileText, Calendar, Paperclip, X, Download, Trash2, AlertCircle } from 'lucide-react';
import ChatImageDisplay from './ChatImageDisplay';

interface Message {
  _id: string;
  sender: string;
  senderType: 'Patient' | 'Doctor';
  content: string;
  read: boolean;
  createdAt: string;
  fileId?: string;
  fileUrl?: string;
  isImage?: boolean;
  appointmentId?: string;
  messageType?: 'text' | 'file' | 'appointment';
}

interface Chat {
  _id: string;
  patient: {
    _id: string;
    name: string;
    userId: string;
  };
  doctor: {
    _id: string;
    name: string;
    userId: string;
  };
  messages: Message[];
  status: 'active' | 'closed';
  lastActivity: string;
}

interface PatientRecord {
  medications: Array<{
    _id: string;
    name: string;
    dosage: string;
    schedule: string;
    status: string;
  }>;
  familyHistory: Array<{
    _id: string;
    name: string;
    relation: string;
    conditions: string[];
  }>;
}

interface ChatFile {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

interface AppointmentFormData {
  type: string;
  date: string;
  time: string;
}

interface ChatInterfaceProps {
  chatId: string;
  userType: 'patient' | 'doctor';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId, userType }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [patientRecords, setPatientRecords] = useState<PatientRecord | null>(null);
  const [showRecords, setShowRecords] = useState(false);

  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Files state - used by fetchChatFiles
  const [, setChatFiles] = useState<ChatFile[]>([]);

  // Appointment scheduling states
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [appointmentFormData, setAppointmentFormData] = useState<AppointmentFormData>({
    type: '',
    date: '',
    time: ''
  });
  const [schedulingAppointment, setSchedulingAppointment] = useState(false);

  // Chat deletion states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');

  // Fetch chat data
  useEffect(() => {
    // Initial fetch - not silent
    fetchChat();
    fetchChatFiles();

    // Set up polling with silent updates (no loading indicators)
    const interval = setInterval(() => {
      fetchChat(true); // Pass true for silent mode
    }, 1000); // Poll every 5 seconds silently

    return () => clearInterval(interval);
  }, [chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chat?.messages?.length) {
      // Use a small timeout to ensure DOM is fully updated
      setTimeout(scrollToBottom, 100);
    }
  }, [chat?.messages]);

  const fetchChat = async (silent = false) => {
    if (!token || !chatId) return;

    // Only show loading indicator for initial load, not during background polling
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/messages/chat/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Compare with current chat to see if there are any new messages
      const newChat = response.data.chat;

      setChat(prevChat => {
        // If no previous chat, update the chat
        if (!prevChat) {
          return newChat;
        }

        // If different number of messages, update the chat
        if (prevChat.messages.length !== newChat.messages.length) {
          // Only scroll to bottom if there are new messages
          if (newChat.messages.length > prevChat.messages.length) {
            setTimeout(scrollToBottom, 100);
          }
          return newChat;
        }

        // Check if the last message is different
        const prevLastMsg = prevChat.messages[prevChat.messages.length - 1];
        const newLastMsg = newChat.messages[newChat.messages.length - 1];

        if (prevLastMsg && newLastMsg && prevLastMsg._id !== newLastMsg._id) {
          setTimeout(scrollToBottom, 100);
          return newChat;
        }

        // No changes, keep the current chat to avoid re-rendering
        return prevChat;
      });

      // If doctor, fetch patient records
      if (userType === 'doctor' && response.data.chat.patient._id && !patientRecords) {
        fetchPatientRecords(response.data.chat.patient._id);
      }
    } catch (err) {
      console.error('Error fetching chat:', err);
      // Only show errors in non-silent mode
      if (!silent) {
        // Check if the server is running
        try {
          // Try to ping the server using our status endpoint
          await axios.get('http://localhost:5000/api/status');
          // If we get here, the server is running but there might be an authentication issue
          setError('Failed to fetch chat. Your session may have expired. Please try logging in again.');
        } catch (pingErr) {
          // If this fails too, the server is likely not running
          setError('Cannot connect to the server. Please make sure the backend is running.');
        }
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const fetchChatFiles = async () => {
    if (!token || !chatId) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/files/chat/${chatId}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChatFiles(response.data.files || []);
    } catch (err) {
      console.error('Error fetching chat files:', err);
    }
  };

  const fetchPatientRecords = async (patientId: string) => {
    if (!token) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/messages/patient/${patientId}/records`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPatientRecords(response.data.records);
    } catch (err) {
      console.error('Error fetching patient records:', err);
    }
  };

  const sendMessage = async () => {
    if (!token || !chatId || !message.trim()) return;

    setSending(true);

    try {
      const response = await axios.post(`http://localhost:5000/api/messages/chat/${chatId}/message`,
        { content: message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChat(response.data.chat);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!token || !chatId || !selectedFile) return;

    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Log the file being uploaded
      console.log('Uploading file:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        isImage: selectedFile.type.startsWith('image/')
      });

      const response = await axios.post(
        `http://localhost:5000/api/files/chat/${chatId}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('File upload response:', response.data);

      setChat(response.data.chat);
      fetchChatFiles();
      setSelectedFile(null);
      setShowFileUpload(false);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Scroll to bottom to show the new message
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const downloadFile = (fileId: string | undefined) => {
    if (!token || !fileId) return;

    window.open(`http://localhost:5000/api/files/file/${fileId}?token=${token}`, '_blank');
  };

  const handleAppointmentFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAppointmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const scheduleAppointment = async () => {
    if (!token || !chatId) return;

    setSchedulingAppointment(true);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/messages/chat/${chatId}/appointment`,
        appointmentFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setChat(response.data.chat);
      // Reset form data
      setAppointmentFormData({
        type: '',
        date: '',
        time: ''
      });
      // Hide the form
      setShowAppointmentForm(false);
      // Clear any errors
      setError(null);

      // Show success message
      const successMessage = 'Appointment scheduled successfully!';
      console.log(successMessage);

      // Fetch updated chat data
      setTimeout(() => {
        fetchChat(true);
      }, 500);
    } catch (err) {
      console.error('Error scheduling appointment:', err);
      setError('Failed to schedule appointment. Please try again.');
    } finally {
      setSchedulingAppointment(false);
    }
  };

  // Delete chat function
  const deleteChat = async () => {
    if (!token || !chatId) return;

    setDeleting(true);
    setError(''); // Clear any previous errors

    try {
      // Use the correct API endpoint
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/messages/chat/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Redirect to chat list or dashboard
      window.location.href = userType === 'patient' ? '/patientDashboard' : '/doctor/dashboard';
    } catch (err: any) {
      console.error('Error deleting chat:', err);

      // Extract error message from response if available
      const errorMessage = err.response?.data?.error || 'Failed to delete chat. Please try again.';
      setError(errorMessage);

      // Keep the dialog open so user can see the error
      setDeleting(false);
      return;
    } finally {
      if (!error) {
        setDeleting(false);
        setShowDeleteConfirm(false);
      }
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading && !chat) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !chat) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
        {error}
        <button
          onClick={() => fetchChat()}
          className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Chat not found or you don't have access.
      </div>
    );
  }

  const otherPerson = userType === 'patient' ? chat.doctor : chat.patient;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 chat-container" style={{ maxHeight: '72vh', minHeight: '400px', marginTop: '10px', marginBottom: '30px' }}>
      {/* Chat header - medical theme */}
      <div className="p-2 md:p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-blue-600 dark:bg-blue-700 text-white flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-white truncate text-sm md:text-base">
              {userType === 'patient' ? 'Dr. ' : ''}{otherPerson.name}
            </h3>
            <p className="text-xs text-blue-100">
              {userType === 'patient' ? 'Doctor' : 'Patient'} • Online
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 text-white hover:text-blue-100 rounded-full hover:bg-white hover:bg-opacity-10"
            title="Delete chat"
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={() => fetchChat()}
            className="p-1 text-white hover:text-blue-100 rounded-full hover:bg-white hover:bg-opacity-10"
            title="Refresh chat"
          >
            <RefreshCw size={14} />
          </button>

          {userType === 'doctor' && (
            <button
              onClick={() => setShowRecords(!showRecords)}
              className={`p-1 rounded-full hover:bg-white hover:bg-opacity-10 ${
                showRecords
                  ? 'text-white bg-white bg-opacity-20'
                  : 'text-white hover:text-blue-100'
              }`}
              title="View patient records"
            >
              <FileText size={14} />
            </button>
          )}

          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`p-1 rounded-full hover:bg-white hover:bg-opacity-10 ${
              showFileUpload
                ? 'text-white bg-white bg-opacity-20'
                : 'text-white hover:text-blue-100'
            }`}
            title="Upload file"
          >
            <Paperclip size={14} />
          </button>

          <button
            onClick={() => setShowAppointmentForm(!showAppointmentForm)}
            className={`p-1 rounded-full hover:bg-white hover:bg-opacity-10 ${
              showAppointmentForm
                ? 'text-white bg-white bg-opacity-20'
                : 'text-white hover:text-blue-100'
            }`}
            title="Schedule appointment"
          >
            <Calendar size={14} />
          </button>
        </div>
      </div>

      {/* Patient records panel (for doctors only) - WhatsApp style */}
      {userType === 'doctor' && showRecords && patientRecords && (
        <div className="p-4 bg-white dark:bg-gray-800 whatsapp-popup border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Patient Records</h4>
            <button
              onClick={() => setShowRecords(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Medications */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medications</h5>
              {patientRecords.medications.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {patientRecords.medications.map(med => (
                    <li key={med._id} className="text-sm p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {med.dosage} - {med.schedule}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No medications recorded</p>
              )}
            </div>

            {/* Family History */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Family History</h5>
              {patientRecords.familyHistory.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {patientRecords.familyHistory.map(fam => (
                    <li key={fam._id} className="text-sm p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                      <div className="font-medium">{fam.name} ({fam.relation})</div>
                      <div className="text-gray-600 dark:text-gray-400 break-words">
                        Conditions: {fam.conditions.join(', ')}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No family history recorded</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Upload Panel - WhatsApp style */}
      {showFileUpload && (
        <div className="p-4 bg-white dark:bg-gray-800 whatsapp-popup border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Upload Medical Report</h4>
            <button
              onClick={() => setShowFileUpload(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Select File
                </button>
                {selectedFile && (
                  <span className="text-sm text-gray-600 dark:text-gray-400 break-all">
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </span>
                )}
              </div>

              {/* File preview */}
              {selectedFile && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview: {selectedFile.type.startsWith('image/') ? 'Image' : 'File'}
                  </p>

                  {selectedFile.type.startsWith('image/') ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="max-h-48 max-w-full object-contain rounded-md"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {selectedFile.type.split('/')[1].toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-md">
                      <FileText className="h-8 w-8 text-gray-500 dark:text-gray-300 mr-3 flex-shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 break-all">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedFile.type || 'Unknown file type'} • {Math.round(selectedFile.size / 1024)} KB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedFile && (
              <button
                onClick={uploadFile}
                disabled={uploadingFile}
                className={`w-full py-2 rounded-lg ${
                  uploadingFile
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploadingFile ? 'Uploading...' : 'Upload File'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Appointment Scheduling Panel - WhatsApp style */}
      {showAppointmentForm && (
        <div className="p-4 bg-white dark:bg-gray-800 whatsapp-popup border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Schedule Appointment</h4>
            <button
              onClick={() => setShowAppointmentForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Appointment Type
              </label>
              <select
                name="type"
                value={appointmentFormData.type}
                onChange={handleAppointmentFormChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select Type</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Check-up">Check-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={appointmentFormData.date}
                onChange={handleAppointmentFormChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={appointmentFormData.time}
                onChange={handleAppointmentFormChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <button
              onClick={scheduleAppointment}
              disabled={schedulingAppointment || !appointmentFormData.type || !appointmentFormData.date || !appointmentFormData.time}
              className={`w-full py-2 rounded-lg ${
                schedulingAppointment || !appointmentFormData.type || !appointmentFormData.date || !appointmentFormData.time
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              type="button"
            >
              {schedulingAppointment ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </div>
      )}

      {/* Messages - with improved scaling and scrolling */}
      <div className="flex-1 p-3 md:p-4 chat-messages-container" style={{ height: 'calc(100% - 100px)', overflowY: 'auto', paddingBottom: '15px' }}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-red-600 dark:text-red-400 text-center">
              <p className="mb-2">{error}</p>
              <button
                onClick={() => fetchChat()}
                className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : chat?.messages.length > 0 ? (
          <div className="space-y-3 md:space-y-4 px-1 w-full overflow-y-auto" style={{ maxHeight: '100%', paddingBottom: '20px' }}>
            {chat.messages.map((msg, index) => {
              const isCurrentUser =
                (userType === 'patient' && msg.senderType === 'Patient') ||
                (userType === 'doctor' && msg.senderType === 'Doctor');

              // Check if we need to show date separator
              const showDateSeparator = index === 0 ||
                formatDate(chat.messages[index-1].createdAt) !== formatDate(msg.createdAt);

              // Debug log for file messages
              if (msg.messageType === 'file') {
                console.log('Rendering file message:', {
                  id: msg._id,
                  content: msg.content,
                  fileId: msg.fileId,
                  fileUrl: msg.fileUrl,
                  isImage: msg.isImage,
                  messageType: msg.messageType
                });

                // Force isImage to true if the content contains image extensions
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
                const fileName = msg.content.replace('Shared a file: ', '').toLowerCase();
                const hasImageExtension = imageExtensions.some(ext => fileName.endsWith(ext));

                if (hasImageExtension && !msg.isImage) {
                  console.log('Forcing isImage to true based on file extension');
                  msg.isImage = true;
                }
              }

              return (
                <React.Fragment key={msg._id || index}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-3 md:my-4">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-1`}>
                    {!isCurrentUser && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mr-1 mt-1">
                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div
                      className={`relative max-w-[70%] p-2 md:p-3 ${
                        isCurrentUser
                          ? msg.messageType === 'file'
                            ? 'bg-blue-700 text-white message-bubble-right-file'
                            : msg.messageType === 'appointment'
                              ? 'bg-indigo-600 text-white message-bubble-right-appointment'
                              : 'bg-blue-600 text-white message-bubble-right'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 message-bubble-left border border-gray-200 dark:border-gray-600'
                      }`}
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {msg.messageType === 'file' ? (
                        <div>
                          {msg.isImage === true && msg.fileUrl ? (
                            <ChatImageDisplay
                              fileUrl={msg.fileUrl}
                              fileName={msg.content.replace('Shared a file: ', '')}
                              isCurrentUser={isCurrentUser}
                              onDownload={() => msg.fileId && downloadFile(msg.fileId)}
                            />
                          ) : (
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText size={16} className="flex-shrink-0" />
                              <p className="break-all">{msg.content}</p>
                            </div>
                          )}

                          {/* Only show download button for non-image files */}
                          {msg.fileId && !msg.isImage && (
                            <button
                              onClick={() => downloadFile(msg.fileId)}
                              className={`mt-1 px-3 py-1 rounded-full text-xs ${
                                isCurrentUser
                                  ? 'bg-blue-800 hover:bg-blue-900 text-white'
                                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-1">
                                <Download size={12} className="flex-shrink-0" />
                                <span>Download</span>
                              </div>
                            </button>
                          )}
                        </div>
                      ) : msg.messageType === 'appointment' ? (
                        <div>
                          <div className="flex items-start space-x-2">
                            <Calendar size={16} className="flex-shrink-0 mt-1" />
                            <p className="break-words text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="break-words text-sm">{msg.content}</p>
                      )}
                      <div className={`text-xs mt-1 ${
                        isCurrentUser
                          ? msg.messageType === 'file'
                            ? 'text-blue-200'
                            : msg.messageType === 'appointment'
                              ? 'text-indigo-200'
                              : 'text-blue-200'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} className="h-6" />
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500 dark:text-gray-400 text-center">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center text-red-600 dark:text-red-400 mb-4">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Delete Chat</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete this chat? This action cannot be undone and all messages will be permanently removed.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={deleteChat}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Chat'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message input - fixed position */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full py-1.5 px-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              style={{ maxHeight: '36px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                !message.trim() || sending
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Send size={20} />
            </button>
          </div>

          <div className="flex space-x-1">
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={`p-3 rounded-full ${
                showFileUpload
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
              title="Upload file"
            >
              <Paperclip size={20} />
            </button>

            <button
              onClick={() => setShowAppointmentForm(!showAppointmentForm)}
              className={`p-3 rounded-full ${
                showAppointmentForm
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
              title="Schedule appointment"
            >
              <Calendar size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

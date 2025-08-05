import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../styles/markdown.css";

interface ChatMessage {
  sender: string;
  text: string;
  sources?: Source[];
  timestamp?: number;
  documentId?: string;
}

interface Source {
  id: number;
  excerpt: string;
  similarity?: number;
}

interface Document {
  _id: string;
  fileName: string;
  uploadDate: string;
}

const Chat4Health: React.FC = () => {
  const [pdf, setPdf] = useState<File | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [activeDocuments, setActiveDocuments] = useState<string[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch available documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Auto-scroll to bottom of chat when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchDocuments = async () => {
    try {
      setConnectionError(null);
      const response = await axios.get("/rag-api/documents", { timeout: 5000 });
      setDocuments(response.data);

      // Set all documents as active if we have documents but no active ones
      if (response.data.length > 0 && activeDocuments.length === 0) {
        setActiveDocuments(response.data.map((doc: Document) => doc._id));
      }

      // Set the first document as selected if we have documents but no selected one
      if (response.data.length > 0 && !selectedDocument) {
        setSelectedDocument(response.data[0]._id);
        setCurrentDocumentId(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      if (axios.isAxiosError(error) && !error.response) {
        setConnectionError("Cannot connect to the RAG backend server. Please make sure it's running on port 5001.");
        // Add a system message about the connection error
        setChatHistory([
          {
            sender: "System",
            text: "Cannot connect to the RAG backend server. Please make sure it's running on port 5001.",
            timestamp: Date.now()
          },
        ]);
      }
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdf(e.target.files[0]);
      setUploadError(null);

      // Auto-upload the file immediately
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file) {
      setUploadError("Please select a PDF file first");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setConnectionError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/rag-api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 seconds timeout for upload
      });

      // Add system message about successful upload
      setChatHistory(prev => [
        ...prev,
        {
          sender: "System",
          text: `Document "${file.name}" uploaded and processed successfully. You can now ask questions about it.`,
          timestamp: Date.now(),
          documentId: response.data.documentId
        },
      ]);

      // Add the new document to active documents
      setActiveDocuments(prev => [...prev, response.data.documentId]);

      // Set the newly uploaded document as the selected one
      setSelectedDocument(response.data.documentId);
      setCurrentDocumentId(response.data.documentId);

      // Reset file input
      setPdf(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh document list
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading file:", error);

      if (axios.isAxiosError(error) && !error.response) {
        setConnectionError("Cannot connect to the RAG backend server. Please make sure it's running on port 5001.");
        setChatHistory(prev => [
          ...prev,
          {
            sender: "System",
            text: "Cannot connect to the RAG backend server. Please make sure it's running on port 5001.",
            timestamp: Date.now()
          },
        ]);
      } else {
        setUploadError("Failed to upload file. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (!chatInput.trim() || activeDocuments.length === 0) return;

    // Add user message to chat
    const updatedChatHistory = [
      ...chatHistory,
      {
        sender: "You",
        text: chatInput,
        timestamp: Date.now()
      },
    ];
    setChatHistory(updatedChatHistory);

    const userQuery = chatInput;
    setChatInput("");
    setIsProcessing(true);
    setConnectionError(null);

    try {
      // Send query to RAG backend with all active documents
      const response = await axios.post("/rag-api/query", {
        query: userQuery,
        documentIds: activeDocuments, // Send all active documents
      }, { timeout: 15000 });

      // Add AI response to chat
      setChatHistory([
        ...updatedChatHistory,
        {
          sender: "AI",
          text: response.data.answer,
          sources: response.data.sources,
          timestamp: Date.now()
        },
      ]);
    } catch (error) {
      console.error("Error processing query:", error);

      if (axios.isAxiosError(error) && !error.response) {
        setConnectionError("Cannot connect to the RAG backend server. Please make sure it's running on port 5001.");
        setChatHistory([
          ...updatedChatHistory,
          {
            sender: "System",
            text: "Cannot connect to the RAG backend server. Please make sure it's running on port 5001.",
            timestamp: Date.now()
          },
        ]);
      } else {
        setChatHistory([
          ...updatedChatHistory,
          {
            sender: "System",
            text: "Sorry, I couldn't process your query. Please try again.",
            timestamp: Date.now()
          },
        ]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  const toggleDocumentActive = (docId: string) => {
    setActiveDocuments(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const docId = e.target.value;
    setSelectedDocument(docId);
    setCurrentDocumentId(docId);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-blue-700">Chat4Health - Medical Document Assistant</h2>
        </div>

        {connectionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-red-700">Connection Error</h3>
            <p className="text-red-600">{connectionError}</p>
            <p className="mt-2 text-sm text-gray-600">
              Please make sure the RAG backend server is running:
              <ol className="list-decimal ml-6 mt-2">
                <li>Navigate to the rag-backend directory</li>
                <li>Run <code className="bg-gray-100 px-1 rounded">npm install</code> (first time only)</li>
                <li>Run <code className="bg-gray-100 px-1 rounded">npm start</code></li>
              </ol>
            </p>
            <button
              onClick={fetchDocuments}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry Connection
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100">
            <h3 className="text-xl font-semibold mb-3 text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Upload Medical Document
            </h3>
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={!!connectionError || isUploading}
                  ref={fileInputRef}
                />
                <div className={`w-full h-full border-2 border-dashed ${pdf ? 'border-blue-400' : 'border-blue-300'} rounded-lg p-4 flex items-center justify-center bg-white`}>
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                      {pdf ? pdf.name : "Choose a PDF file or drag it here"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleUpload(pdf!)}
                disabled={!pdf || isUploading || !!connectionError}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-sm flex items-center justify-center"
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload & Process
                  </span>
                )}
              </button>
              {uploadError && <p className="text-red-500 mt-2 text-sm">{uploadError}</p>}
            </div>
          </div>

        {documents.length > 0 && (
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-blue-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Select Document to Query
            </h3>
            <div className="relative">
              <select
                id="document-select"
                value={selectedDocument || ""}
                onChange={handleDocumentSelect}
                className="w-full p-3 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {documents.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.fileName} ({new Date(doc.uploadDate).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Currently viewing: <span className="font-medium text-blue-700">{documents.find(doc => doc._id === selectedDocument)?.fileName || "No document selected"}</span>
            </div>
          </div>
        )}
      </div>



        <div className="relative mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Conversation</h3>
            {chatHistory.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Chat
              </button>
            )}
          </div>
          <div className="border border-gray-200 rounded-lg h-[60vh] overflow-y-auto p-4 bg-white shadow-inner">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <div className="mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="text-xl font-medium text-blue-800 mb-2">Chat with your medical documents</div>
                <div className="text-gray-600 mb-6 max-w-md mx-auto">Upload a medical document and ask questions to get insights about your health information.</div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 max-w-lg mx-auto">
                  <div className="text-left">
                    <div className="font-medium text-gray-800 mb-2">Example questions you can ask:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div
                        className="bg-blue-50 p-2 rounded-lg text-blue-800 text-sm hover:bg-blue-100 transition-colors cursor-pointer flex items-center"
                        onClick={() => setChatInput("What is my diagnosis?")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        What is my diagnosis?
                      </div>
                      <div
                        className="bg-blue-50 p-2 rounded-lg text-blue-800 text-sm hover:bg-blue-100 transition-colors cursor-pointer flex items-center"
                        onClick={() => setChatInput("What medications are mentioned?")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        What medications are mentioned?
                      </div>
                      <div
                        className="bg-blue-50 p-2 rounded-lg text-blue-800 text-sm hover:bg-blue-100 transition-colors cursor-pointer flex items-center"
                        onClick={() => setChatInput("What do my lab results mean?")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        What do my lab results mean?
                      </div>
                      <div
                        className="bg-blue-50 p-2 rounded-lg text-blue-800 text-sm hover:bg-blue-100 transition-colors cursor-pointer flex items-center"
                        onClick={() => setChatInput("Are there any abnormal values in my test results?")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Are there any abnormal values?
                      </div>
                      <div
                        className="bg-blue-50 p-2 rounded-lg text-blue-800 text-sm hover:bg-blue-100 transition-colors cursor-pointer flex items-center"
                        onClick={() => setChatInput("What follow-up actions are recommended?")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        What follow-up is recommended?
                      </div>
                      <div
                        className="bg-blue-50 p-2 rounded-lg text-blue-800 text-sm hover:bg-blue-100 transition-colors cursor-pointer flex items-center"
                        onClick={() => setChatInput("Explain my test results in simple terms")}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Explain my test results
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-6 ${
                  msg.sender === "You"
                    ? "flex justify-end"
                    : msg.sender === "System"
                      ? "flex justify-center"
                      : "flex justify-start"
                }`}
              >
                {msg.sender !== "You" && msg.sender !== "System" && (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-2 mt-1">
                    C
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                    msg.sender === "You"
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : msg.sender === "System"
                        ? "bg-gray-200 text-gray-800 italic text-center"
                        : "bg-white border border-gray-200 rounded-tl-none"
                  }`}
                >
                  {msg.sender === "You" ? (
                    <div className="text-white">
                      {msg.text}
                    </div>
                  ) : (
                    <div>
                      {msg.sender === "System" ? (
                        <div className="italic text-gray-600">{msg.text}</div>
                      ) : (
                        <>
                          <div className="font-medium text-gray-900 mb-1">Chat4Health</div>
                          <div className="markdown-content text-gray-800">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        </>
                      )}

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 text-xs border-t border-gray-200 pt-3">
                          <div className="font-semibold mb-2 text-gray-700 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            References
                          </div>
                          <div className="space-y-3">
                            {msg.sources.map((source, i) => (
                              <div key={i} className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-blue-600 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Reference {i+1}
                                  </span>
                                  {source.similarity !== undefined && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                      Match: {Math.round(source.similarity * 100)}%
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                                  {source.excerpt}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-gray-500 italic text-[10px]">
                            Note: References are extracted directly from your medical document. Consult with your healthcare provider for interpretation.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.sender === "You" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold ml-2 mt-1">
                    Y
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="relative mt-4">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-hidden">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your medical document..."
                className="flex-grow p-4 border-none focus:outline-none focus:ring-0"
                disabled={isProcessing || (activeDocuments.length === 0) || !!connectionError}
              />
              <button
                onClick={handleSend}
                disabled={!chatInput.trim() || isProcessing || (activeDocuments.length === 0) || !!connectionError}
                className="px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    Send
                  </span>
                )}
              </button>
            </div>
          </div>

          {activeDocuments.length === 0 && documents.length === 0 && (
            <div className="text-center text-gray-500 mt-4">
              Please upload a medical document to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat4Health;

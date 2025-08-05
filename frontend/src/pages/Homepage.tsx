import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Shield,
  Users,
  ArrowRight,
  Heart,
  Activity,
  MessageSquare,
  Clock,
  ChevronRight,
  Star
} from "lucide-react";
import NavigationBar from "../componenets/Navbar";
import RealtimeHealthNews from "./RealTime";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const HomePage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<"doctor" | "patient" | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Function to check login status
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const userTypeFromStorage = localStorage.getItem("userType");
    if (token && userTypeFromStorage) {
      setIsLoggedIn(true);
      setUserType(userTypeFromStorage as "doctor" | "patient");
    } else {
      setIsLoggedIn(false);
      setUserType(null);
    }
  };

  // UseEffect to check login status on mount and after updates
  useEffect(() => {
    checkLoginStatus(); // Initial check

    // Listen for storage changes
    const handleStorageChange = () => {
      checkLoginStatus();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Testimonials data
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist",
      text: "MedBook has transformed my practice by providing a secure platform to access patient records and communicate efficiently. The medical history tracking features help me make more informed decisions.",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    },
    {
      name: "Dr. Robert Williams",
      role: "Family Physician",
      text: "The integrated chat system allows me to provide timely care to my patients without unnecessary office visits. I can review their records, answer questions, and monitor their progress seamlessly.",
      avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <NavigationBar />

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <motion.div
              variants={fadeIn}
              className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left z-10"
            >
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:leading-tight">
                <span className="block">Your Health,</span>
                <span className="block text-blue-600">Connected & Secured</span>
              </h1>
              <p className="mt-6 text-base text-gray-500 sm:text-xl">
                MedBook brings together patients and healthcare providers on a secure platform.
                Manage records, communicate with doctors, and take control of your health journey.
              </p>

              {!isLoggedIn && (
                <motion.div
                  variants={fadeIn}
                  className="mt-10 sm:flex sm:justify-center lg:justify-start space-x-4"
                >
                  <Link to="/patientlogin">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg"
                    >
                      Patient Portal
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.button>
                  </Link>
                  <Link to="/doctorlogin">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-3 sm:mt-0 w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-blue-600 text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 shadow-lg"
                    >
                      Doctor Portal
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.button>
                  </Link>
                </motion.div>
              )}

              {isLoggedIn && (
                <motion.div
                  variants={fadeIn}
                  className="mt-8 sm:flex sm:justify-center lg:justify-start"
                >
                  <Link to={userType === "doctor" ? "/doctor/dashboard" : "/patientDashboard"}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
            >
              <div className="relative mx-auto w-full rounded-2xl shadow-2xl lg:max-w-md overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full rounded-2xl"
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&q=80"
                  alt="Indian healthcare professional using digital health records system"
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-transparent rounded-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="w-80 h-80 rounded-full bg-blue-500"
          />
        </div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="w-60 h-60 rounded-full bg-green-500"
          />
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Comprehensive Healthcare Management
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              MedBook provides a complete suite of tools for patients and healthcare providers to manage health information securely and efficiently.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-2">
            {/* Feature 1 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="bg-blue-50 rounded-xl p-8 shadow-lg border border-blue-100"
            >
              <div className="h-12 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-5">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Health Records</h3>
              <p className="text-gray-600 mb-4">
                MedBook securely stores all your medical records in one centralized location, with enterprise-grade encryption that meets HIPAA compliance standards.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Complete medical history including lab results, diagnoses, and treatments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Secure document upload for medical reports and test results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Role-based access controls to protect sensitive information</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="bg-green-50 rounded-xl p-8 shadow-lg border border-green-100"
            >
              <div className="h-12 w-12 rounded-lg bg-green-600 text-white flex items-center justify-center mb-5">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Doctor-Patient Communication</h3>
              <p className="text-gray-600 mb-4">
                Our integrated chat system enables seamless communication between patients and healthcare providers, reducing unnecessary office visits and improving care coordination.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Real-time messaging with end-to-end encryption</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Ability to share medical documents and test results directly in chat</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>Doctors can view patient history while providing consultation</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="bg-red-50 rounded-xl p-8 shadow-lg border border-red-100"
            >
              <div className="h-12 w-12 rounded-lg bg-red-600 text-white flex items-center justify-center mb-5">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Medication & Treatment Management</h3>
              <p className="text-gray-600 mb-4">
                MedBook provides comprehensive tools for tracking medications, treatments, and health status, helping both patients and doctors monitor progress effectively.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Doctors can update patient medications with detailed instructions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Critical patient status tracking for high-risk conditions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Medication history with dosage tracking and refill management</span>
                </li>
              </ul>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="bg-indigo-50 rounded-xl p-8 shadow-lg border border-indigo-100"
            >
              <div className="h-12 w-12 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-5">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Health Analytics & Insights</h3>
              <p className="text-gray-600 mb-4">
                Our advanced analytics tools help doctors identify trends in patient health data and make more informed treatment decisions based on comprehensive medical history.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Vital signs tracking with historical data visualization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Lab result analysis with abnormal value highlighting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Medical history timeline for comprehensive health overview</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-24 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How MedBook Works
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Our platform connects patients and doctors through a secure, intuitive interface designed for healthcare.
            </p>
          </motion.div>

          <div className="relative">
            <div className="max-w-3xl mx-auto">
              <motion.div
                variants={fadeIn}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-10"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">For Patients</h3>
                <ol className="space-y-6">
                  <li className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">1</div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Create Your Account</h4>
                      <p className="mt-1 text-gray-600">Register with your email and create a secure password to access your personal health dashboard.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">2</div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Find Your Doctor</h4>
                      <p className="mt-1 text-gray-600">Search for healthcare providers by specialty, location, or name and send connection requests.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">3</div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Share Medical Information</h4>
                      <p className="mt-1 text-gray-600">Upload medical reports, test results, and health history for your doctor to review securely.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">4</div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Get AI-Powered Health Insights</h4>
                      <p className="mt-1 text-gray-600">Use our Chat4Health feature with RAG technology to analyze your medical reports and get answers to health questions.</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">5</div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Communicate & Receive Care</h4>
                      <p className="mt-1 text-gray-600">Chat with your doctor, receive medication updates, and track your health progress all in one place.</p>
                    </div>
                  </li>
                </ol>

                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">For Doctors</h3>
                  <ol className="space-y-6">
                    <li className="flex">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg mr-4">1</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Create Your Professional Profile</h4>
                        <p className="mt-1 text-gray-600">Set up your profile with your credentials, specialties, and practice information.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg mr-4">2</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Accept Patient Requests</h4>
                        <p className="mt-1 text-gray-600">Review and accept connection requests from patients seeking your expertise.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg mr-4">3</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Access Complete Patient Records</h4>
                        <p className="mt-1 text-gray-600">View comprehensive patient histories, test results, and previous treatments in one organized interface.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg mr-4">4</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Leverage AI-Assisted Diagnostics</h4>
                        <p className="mt-1 text-gray-600">Use our RAG model to help analyze complex medical reports and provide evidence-based insights for better diagnosis.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-lg mr-4">5</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Provide Care & Update Records</h4>
                        <p className="mt-1 text-gray-600">Communicate with patients, update their medication plans, and monitor their health status remotely.</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* AI-Powered RAG Model Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-24 bg-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              AI-Powered Health Intelligence
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our advanced Retrieval-Augmented Generation (RAG) model combines the power of large language models with specialized medical knowledge to provide accurate health insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeIn}
              className="order-2 lg:order-1"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">How Our RAG Model Works</h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Document Processing</h4>
                    <p className="mt-1 text-gray-600">Upload your medical PDF documents securely to our platform. Our system extracts text and identifies important medical entities using specialized NLP models.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Vector Embeddings</h4>
                    <p className="mt-1 text-gray-600">The extracted text is converted into vector embeddings using medical-specific models like BioBERT, creating a semantic representation of your health information.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Knowledge Base Creation</h4>
                    <p className="mt-1 text-gray-600">A medical knowledge graph is created, connecting related health concepts and storing them in a vector database for efficient retrieval.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">4</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Intelligent Retrieval</h4>
                    <p className="mt-1 text-gray-600">When you ask a question, our system finds the most relevant information from your documents using semantic search and similarity matching.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mr-4">5</div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">AI-Generated Answers</h4>
                    <p className="mt-1 text-gray-600">Google Gemini, a powerful AI model, generates accurate, contextual answers based on the retrieved information, providing you with personalized health insights.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                {/* RAG Architecture Diagram */}
                <svg className="w-full h-auto" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Background Elements */}
                  <rect x="50" y="50" width="700" height="500" rx="20" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="2"/>

                  {/* Document Processing */}
                  <rect x="100" y="100" width="160" height="100" rx="10" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
                  <text x="180" y="140" textAnchor="middle" fill="#2563EB" fontWeight="bold" fontSize="16">PDF Documents</text>
                  <text x="180" y="165" textAnchor="middle" fill="#2563EB" fontSize="12">Medical Reports</text>

                  {/* Text Extraction */}
                  <rect x="320" y="100" width="160" height="100" rx="10" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
                  <text x="400" y="140" textAnchor="middle" fill="#2563EB" fontWeight="bold" fontSize="16">Text Extraction</text>
                  <text x="400" y="165" textAnchor="middle" fill="#2563EB" fontSize="12">pdf-parse</text>

                  {/* Medical NER */}
                  <rect x="540" y="100" width="160" height="100" rx="10" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
                  <text x="620" y="140" textAnchor="middle" fill="#2563EB" fontWeight="bold" fontSize="16">Medical NER</text>
                  <text x="620" y="165" textAnchor="middle" fill="#2563EB" fontSize="12">Entity Recognition</text>

                  {/* Vector Embeddings */}
                  <rect x="100" y="250" width="160" height="100" rx="10" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
                  <text x="180" y="290" textAnchor="middle" fill="#2563EB" fontWeight="bold" fontSize="16">Vector Embeddings</text>
                  <text x="180" y="315" textAnchor="middle" fill="#2563EB" fontSize="12">BioBERT/MiniLM</text>

                  {/* Knowledge Graph */}
                  <rect x="320" y="250" width="160" height="100" rx="10" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
                  <text x="400" y="290" textAnchor="middle" fill="#2563EB" fontWeight="bold" fontSize="16">Knowledge Graph</text>
                  <text x="400" y="315" textAnchor="middle" fill="#2563EB" fontSize="12">Entity Relationships</text>

                  {/* Vector Database */}
                  <rect x="540" y="250" width="160" height="100" rx="10" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
                  <text x="620" y="290" textAnchor="middle" fill="#2563EB" fontWeight="bold" fontSize="16">Vector Database</text>
                  <text x="620" y="315" textAnchor="middle" fill="#2563EB" fontSize="12">MongoDB</text>

                  {/* User Query */}
                  <rect x="100" y="400" width="160" height="100" rx="10" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
                  <text x="180" y="440" textAnchor="middle" fill="#2563EB" fontWeight="bold" fontSize="16">User Query</text>
                  <text x="180" y="465" textAnchor="middle" fill="#2563EB" fontSize="12">Natural Language</text>

                  {/* Semantic Search */}
                  <rect x="320" y="400" width="160" height="100" rx="10" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
                  <text x="400" y="440" textAnchor="middle" fill="#2563EB" fontWeight="bold" fontSize="16">Semantic Search</text>
                  <text x="400" y="465" textAnchor="middle" fill="#2563EB" fontSize="12">Similarity Matching</text>

                  {/* AI Response */}
                  <rect x="540" y="400" width="160" height="100" rx="10" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="2"/>
                  <text x="620" y="440" textAnchor="middle" fill="#2563EB" fontWeight="bold" fontSize="16">AI Response</text>
                  <text x="620" y="465" textAnchor="middle" fill="#2563EB" fontSize="12">Google Gemini</text>

                  {/* Arrows */}
                  {/* Row 1 */}
                  <path d="M260 150 L320 150" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <path d="M480 150 L540 150" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)"/>

                  {/* Row 1 to Row 2 */}
                  <path d="M620 200 L620 220 L180 220 L180 250" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)"/>

                  {/* Row 2 */}
                  <path d="M260 300 L320 300" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <path d="M480 300 L540 300" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)"/>

                  {/* Row 2 to Row 3 */}
                  <path d="M620 350 L620 370 L180 370 L180 400" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)"/>

                  {/* Row 3 */}
                  <path d="M260 450 L320 450" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                  <path d="M480 450 L540 450" stroke="#60A5FA" strokeWidth="2" markerEnd="url(#arrowhead)"/>

                  {/* Arrowhead Marker */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="currentColor"/>
                    </marker>
                  </defs>
                </svg>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={fadeIn}
            className="mt-16 text-center"
          >
            <Link to="/chat4health">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Try Chat4Health Now
              </motion.button>
            </Link>
            <p className="mt-4 text-sm text-gray-500">Experience the power of AI-assisted health insights with your medical documents.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            variants={fadeIn}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            Experience Better Healthcare Management
          </motion.h2>
          <motion.p
            variants={fadeIn}
            className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto"
          >
            MedBook provides a secure platform for managing your health records, communicating with healthcare providers, and leveraging AI-powered insights through our advanced RAG model.
          </motion.p>
          <motion.div
            variants={fadeIn}
            className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link to="/patientlogin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 shadow-lg w-full sm:w-auto"
              >
                Patient Login
                <ChevronRight className="ml-2 h-5 w-5 inline" />
              </motion.button>
            </Link>
            <Link to="/doctorlogin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-blue-500 md:py-4 md:text-lg md:px-10 shadow-lg w-full sm:w-auto"
              >
                Doctor Login
                <ChevronRight className="ml-2 h-5 w-5 inline" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Health News Section */}
      <RealtimeHealthNews />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MedBook</h3>
              <p className="text-gray-400">
                Your comprehensive healthcare management platform connecting patients and providers.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/patientlogin" className="text-gray-400 hover:text-white">Patient Portal</Link></li>
                <li><Link to="/doctorlogin" className="text-gray-400 hover:text-white">Doctor Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Health Records</span></li>
                <li><span className="text-gray-400">Doctor-Patient Chat</span></li>
                <li><span className="text-gray-400">Medication Management</span></li>
                <li><span className="text-gray-400">Appointment Scheduling</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                Email: support@medbook.com<br />
                Phone: (123) 456-7890
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} MedBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

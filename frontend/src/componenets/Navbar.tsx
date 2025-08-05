// src/components/NavigationBar.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Menu,
  X,
  User,
  LogOut,
  Home,
  MessageSquare,
  LayoutDashboard,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const NavigationBar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    // Use the logout function from AuthContext
    logout();
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </motion.div>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="ml-2 text-xl font-bold text-gray-900 cursor-pointer"
              onClick={() => navigate("/")}
            >
              MedBook
            </motion.span>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>

            {/* Show Dashboard link only if user is a patient */}
            {isAuthenticated && userType === "patient" && (
              <Link
                to="/patientDashboard"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}

            {/* Show Dashboard link only if user is a doctor */}
            {isAuthenticated && userType === "doctor" && (
              <Link
                to="/doctor/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}

            {/* Show Chat4Health link for all authenticated users */}
            {isAuthenticated && (
              <Link
                to="/chat4health"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Chat4Health
              </Link>
            )}

            {/* User Menu for authenticated users */}
            {isAuthenticated && userType && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>{userType === "doctor" ? "Doctor" : "Patient"}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                    >
                      <Link
                        to={userType === "doctor" ? "/doctor/dashboard" : "/patientDashboard"}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 inline mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Show Login/Register buttons if user is not authenticated */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/patientlogin"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Patient Login
                </Link>
                <Link
                  to="/doctorlogin"
                  className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md"
                >
                  Doctor Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/"
                className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5 inline mr-2" />
                Home
              </Link>

              {isAuthenticated && userType === "patient" && (
                <Link
                  to="/patientDashboard"
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5 inline mr-2" />
                  Dashboard
                </Link>
              )}

              {isAuthenticated && userType === "doctor" && (
                <Link
                  to="/doctor/dashboard"
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5 inline mr-2" />
                  Dashboard
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  to="/chat4health"
                  className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageSquare className="h-5 w-5 inline mr-2" />
                  Chat4Health
                </Link>
              )}

              {isAuthenticated && userType && (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left py-2 text-gray-700 hover:text-blue-600 font-medium"
                >
                  <LogOut className="h-5 w-5 inline mr-2" />
                  Sign Out as {userType === "doctor" ? "Doctor" : "Patient"}
                </button>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/patientlogin"
                    className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 inline mr-2" />
                    Patient Login
                  </Link>
                  <Link
                    to="/doctorlogin"
                    className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 inline mr-2" />
                    Doctor Login
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavigationBar;

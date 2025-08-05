import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

// Define the shape of our authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  userId: string | null;
  userName: string | null;
  login: (token: string, userType: string, userId: string, userName: string) => void;
  logout: () => void;
  loading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userId: null,
  userName: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      const storedUserId = localStorage.getItem('userId');
      const storedUserName = localStorage.getItem('userName');

      if (token && storedUserType) {
        setIsAuthenticated(true);
        setUserType(storedUserType);
        setUserId(storedUserId);
        setUserName(storedUserName);
      } else {
        // Clear any partial auth data
        setIsAuthenticated(false);
        setUserType(null);
        setUserId(null);
        setUserName(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = (token: string, userType: string, userId: string, userName: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userType', userType);
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
    
    setIsAuthenticated(true);
    setUserType(userType);
    setUserId(userId);
    setUserName(userName);
    
    // Redirect based on user type
    navigate('/');
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    setIsAuthenticated(false);
    setUserType(null);
    setUserId(null);
    setUserName(null);
    
    // Redirect to login page
    navigate('/login');
  };

  // Context provider value
  const value = {
    isAuthenticated,
    userType,
    userId,
    userName,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

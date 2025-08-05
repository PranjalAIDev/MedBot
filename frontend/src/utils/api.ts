import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Base URL for all API requests
const API_BASE_URL = '/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Patient authentication
  patientSignIn: (userId: string, password: string): Promise<AxiosResponse> => {
    return api.post('/patient/signin', { userId, password });
  },
  
  patientSignUp: (name: string, email: string, userId: string, password: string): Promise<AxiosResponse> => {
    return api.post('/patient/signup', { name, email, userId, password });
  },
  
  // Doctor authentication
  doctorSignIn: (userId: string, password: string): Promise<AxiosResponse> => {
    return api.post('/doctor/signin', { userId, password });
  },
  
  doctorSignUp: (name: string, email: string, licenseNumber: string, userId: string, password: string): Promise<AxiosResponse> => {
    return api.post('/doctor/signup', { name, email, licenseNumber, userId, password });
  },
};

// Patient API calls
export const patientAPI = {
  getMedications: (): Promise<AxiosResponse> => {
    return api.get('/patient/medications');
  },
  
  addMedication: (medication: any): Promise<AxiosResponse> => {
    return api.post('/patient/medications', medication);
  },
  
  deleteMedication: (medicationId: string): Promise<AxiosResponse> => {
    return api.delete(`/patient/medications/${medicationId}`);
  },
  
  getFamilyHistory: (): Promise<AxiosResponse> => {
    return api.get('/patient/family-history');
  },
  
  addFamilyMember: (familyMember: any): Promise<AxiosResponse> => {
    return api.post('/patient/family-history', familyMember);
  },
  
  deleteFamilyMember: (familyMemberId: string): Promise<AxiosResponse> => {
    return api.delete(`/patient/family-history/${familyMemberId}`);
  },
  
  getAppointments: (): Promise<AxiosResponse> => {
    return api.get('/patient/appointments');
  },
  
  createAppointment: (appointment: any): Promise<AxiosResponse> => {
    return api.post('/patient/appointments', appointment);
  },
  
  deleteAppointment: (appointmentId: string): Promise<AxiosResponse> => {
    return api.delete(`/patient/appointments/${appointmentId}`);
  },
};

// Doctor API calls
export const doctorAPI = {
  getPatientInfo: (patientUserId: string): Promise<AxiosResponse> => {
    return api.get(`/patient/${patientUserId}/patient-info`);
  },
};

export default api;

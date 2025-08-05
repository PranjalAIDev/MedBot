import axios from 'axios';

// Function to check if token is expired
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    // Get the expiration time from the token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);

    // Check if the token is expired
    // Add a 30-minute buffer to refresh the token before it actually expires
    const currentTime = Date.now() / 1000;
    const bufferTime = 30 * 60; // 30 minutes in seconds

    return exp < (currentTime + bufferTime);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If there's an error, assume the token is expired
  }
};

// Function to refresh the token
export const refreshToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('token');

  if (!token) return null;

  try {
    const response = await axios.post(
      '/api/auth/refresh-token',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const newToken = response.data.token;

    // Save the new token
    localStorage.setItem('token', newToken);

    return newToken;
  } catch (error) {
    console.error('Error refreshing token:', error);

    // If the refresh fails, clear the token and redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';

    return null;
  }
};

// Function to check and refresh token if needed
export const checkAndRefreshToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('token');

  if (!token) return null;

  if (isTokenExpired(token)) {
    return await refreshToken();
  }

  return token;
};

// Create an axios instance with token refresh interceptor
export const createAuthAxios = () => {
  const authAxios = axios.create();

  // Add request interceptor
  authAxios.interceptors.request.use(
    async (config) => {
      // Check and refresh token if needed
      const token = await checkAndRefreshToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return authAxios;
};

// Export the axios instance with token refresh
export const authAxios = createAuthAxios();

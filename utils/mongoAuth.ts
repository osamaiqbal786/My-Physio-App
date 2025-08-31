import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - should match your server configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call error for ${endpoint}:`, error);
    throw error;
  }
};

// Helper function to get auth headers with JWT token
const getAuthHeaders = async () => {
  const token = await getStoredToken();
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Token storage functions
const TOKEN_KEY = 'physio_jwt_token';

const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

const removeStoredToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// User functions
export const registerUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ user: Omit<User, 'password'>, token: string }> => {
  try {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store the JWT token
    await storeToken(response.token);

    return response;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<{ user: Omit<User, 'password'>, token: string }> => {
  try {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store the JWT token
    await storeToken(response.token);

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Remove the stored token
    await removeStoredToken();
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<Omit<User, 'password'> | null> => {
  try {
    const token = await getStoredToken();
    if (!token) return null;

    const response = await apiCall('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    // If token is invalid, remove it
    await removeStoredToken();
    return null;
  }
};

export const updateUser = async (updatedUser: Omit<User, 'password'>): Promise<Omit<User, 'password'>> => {
  try {
    const response = await apiCall('/auth/profile', {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(updatedUser),
    });

    return response.user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
  try {
    await apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });

    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getStoredToken();
  return !!token;
};

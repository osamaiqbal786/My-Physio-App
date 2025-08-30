import { Patient, Session, SessionFilter } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - should match your server configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('physio_jwt_token');
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
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

// Patient functions
export const savePatient = async (patient: Omit<Patient, 'id' | 'createdAt' | 'userId'>): Promise<Patient> => {
  try {
    const response = await apiCall('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });

    return response.patient;
  } catch (error) {
    console.error('Error saving patient:', error);
    throw error;
  }
};

export const getPatients = async (): Promise<Patient[]> => {
  try {
    const response = await apiCall('/patients');
    return response.patients;
  } catch (error) {
    console.error('Error getting patients:', error);
    return [];
  }
};

export const getCurrentUserPatients = async (): Promise<Patient[]> => {
  try {
    const response = await apiCall('/patients');
    return response.patients;
  } catch (error) {
    console.error('Error getting current user patients:', error);
    return [];
  }
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    const response = await apiCall(`/patients/${id}`);
    return response.patient;
  } catch (error) {
    console.error('Error getting patient by ID:', error);
    return null;
  }
};

export const updatePatient = async (updatedPatient: Patient): Promise<void> => {
  try {
    await apiCall(`/patients/${updatedPatient.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedPatient),
    });
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

export const deletePatient = async (id: string): Promise<void> => {
  try {
    await apiCall(`/patients/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

// Session functions
export const saveSession = async (session: Omit<Session, 'id' | 'createdAt' | 'userId'>): Promise<Session> => {
  try {
    const response = await apiCall('/sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });

    return response.session;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
};

export const getSessions = async (): Promise<Session[]> => {
  try {
    const response = await apiCall('/sessions');
    return response.sessions;
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
};

export const getTodaySessions = async (): Promise<Session[]> => {
  try {
    const response = await apiCall('/sessions');
    const today = new Date().toISOString().split('T')[0];
    return response.sessions.filter((session: Session) => session.date === today);
  } catch (error) {
    console.error('Error getting today sessions:', error);
    return [];
  }
};

export const getPastSessions = async (): Promise<Session[]> => {
  try {
    const response = await apiCall('/sessions/past');
    return response.sessions;
  } catch (error) {
    console.error('Error getting past sessions:', error);
    return [];
  }
};

export const getUpcomingSessions = async (): Promise<Session[]> => {
  try {
    const response = await apiCall('/sessions/upcoming');
    return response.sessions;
  } catch (error) {
    console.error('Error getting upcoming sessions:', error);
    return [];
  }
};

export const getPatientSessions = async (patientId: string): Promise<Session[]> => {
  try {
    const response = await apiCall(`/sessions/patient/${patientId}`);
    return response.sessions;
  } catch (error) {
    console.error('Error getting patient sessions:', error);
    return [];
  }
};

export const getFilteredSessions = async (filters: SessionFilter): Promise<Session[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.patientId) queryParams.append('patientId', filters.patientId);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    const response = await apiCall(`/sessions?${queryParams.toString()}`);
    return response.sessions;
  } catch (error) {
    console.error('Error getting filtered sessions:', error);
    return [];
  }
};

export const getSessionById = async (id: string): Promise<Session | null> => {
  try {
    const response = await apiCall(`/sessions/${id}`);
    return response.session;
  } catch (error) {
    console.error('Error getting session by ID:', error);
    return null;
  }
};

export const updateSession = async (updatedSession: Session): Promise<void> => {
  try {
    await apiCall(`/sessions/${updatedSession.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedSession),
    });
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

export const deleteSession = async (id: string): Promise<void> => {
  try {
    await apiCall(`/sessions/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};

// Placeholder for getCurrentUser - this should use the new auth system
export const getCurrentUser = async () => {
  // This function is now handled by mongoAuth.ts
  // Keeping it here for compatibility but it should not be used
  console.warn('getCurrentUser from mongoStorage is deprecated. Use mongoAuth instead.');
  return null;
};

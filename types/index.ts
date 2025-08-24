export interface Patient {
  id: string;
  userId: string; // ID of the user who created this patient
  name: string;
  contactNumber: string;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string; // ID of the user who created this session
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  notes: string;
  completed: boolean;
  amount?: number;
  createdAt: string;
}

export interface SessionFilter {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  userId?: string; // Added to filter by user
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  password: string; // Note: This will be hashed in a real app
  profileImage?: string; // Base64 encoded image or image URI
  createdAt: string;
}
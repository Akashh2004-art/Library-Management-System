// Removed unused import

// src/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  regNo?: string;      // Registration number
  department?: string; // Department
  semester?: string;  // Semester
  phone?: string;    // Phone number
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;     // Added token property
  message?: string;  // Optional message
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  adminLogin: (emailOrPhone: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
}

export interface Book {
  _id: string;
  id?: string;
  title: string;
  author: string;
  coverImage?: string;
  dueDate?: string;
  status?: string;
}

// Add these interfaces to your types.ts file
export interface BorrowRequest {
  _id: string;
  book: {
    _id: string;
    title: string;
    author: string;
  };
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface BorrowedBook extends Book {
  status?: string;
  dueDate?: string;
}
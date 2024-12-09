export interface User {
    isActive: any;
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  }
  
  export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    status: 'available' | 'borrowed';
    coverImage: string;
    description: string;
    category: string;
    borrowedBy?: string;
    dueDate?: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    isActive : boolean;
  }
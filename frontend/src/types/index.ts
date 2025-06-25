// User er jonno main interface - ei interface ta application er core user structure define kore
export interface User {
  // Unique identifiers
  id: string;        // Unique ID - ei ta application er internal ID
  _id: string;       // MongoDB ID - database er ID
  
  // Basic user info - user er basic information
  name: string;      // User er naam
  email: string;     // User er email address
  isActive: boolean; // Account active ache ki na (true/false)
  phone?: string;    // Phone number (optional)
  
  // Academic info - student er academic details
  department: string;              // Department name (CST/EEE/ECE)
  regNo?: string;                 // Registration number (optional)
  semester?: string;              // Current semester (optional)
  lastSemesterUpdateDate?: Date;  // Last kobe semester update kora hoyeche
  
  // Role and timestamps - user role ar time tracking
  role: 'user' | 'admin';     // Strict type - user admin naki normal user
  createdAt?: Date;           // Account creation date (optional)
  updatedAt?: Date;           // Last update er date (optional)
}

// User edit form er jonno interface - user data update korar time ei structure follow korbe
export interface UserEditForm {
  name: string;           // User er naam
  department: string;     // Department (CST/EEE/ECE)
  regNo: string;         // Registration number
  semester: string;      // Current semester
  phone?: string;        // Phone number (optional)
}

// Login response er jonno interface - login success hole ei data return korbe
export interface LoginResponse {
  success: boolean;      // Login successful kina (true/false)
  user: User;           // Logged in user er information
  token?: string;       // JWT token (optional)
  message?: string;     // Success/error message (optional)
}

// Auth Context er jonno interface - authentication related sob functionality ei interface e thakbe
export interface AuthContextType {
  // Current state
  user: User | null;                 // Currently logged in user
  isAuthenticated: boolean;          // Login status (true/false)
  isLoading: boolean;               // Loading state (true/false)
  
  // Auth functions
  login: (email: string, password: string) => Promise<LoginResponse>;  // Normal user login
  adminLogin: (emailOrPhone: string, password: string) => Promise<LoginResponse>;  // Admin login
  logout: () => void;               // Logout function
  
  // User data update
  setUser?: (userData: Partial<User>) => void;  // User info partial update
}

// Password reset er jonno interface - password change korar time ei structure follow korbe
export interface PasswordReset {
  oldPassword: string;      // Current password
  newPassword: string;      // New password
  confirmPassword: string;  // Confirm new password
}

// Profile update er jonno interface - profile data update korar time ei structure follow korbe
export interface ProfileUpdate {
  name?: string;           // User er naam (optional)
  department?: string;     // Department name (optional)
  semester?: string;      // Current semester (optional)
  phone?: string;         // Phone number (optional)
}

// Book er jonno interface - book er full details ei structure e thakbe
export interface Book {
    _id: string;               // MongoDB ID
    title: string;            // Book er naam
    author: string;           // Writer er naam
    isbn: string;             // ISBN number
    department: string;       // Kon department er book
    semester: string;         // Kon semester er book
    quantity: number;         // Total koyta book ache
    description: string;      // Book er description
    availableQuantity: number; // Currently available koyta ache
    borrowedQuantity: number;  // Currently borrowed koyta ache
}

// Book edit form er jonno interface - book update korar time ei structure follow korbe
export interface BookEditForm {
    title: string;           // Book er naam
    author: string;          // Writer er naam
    isbn: string;            // ISBN number
    department: string;      // Department name
    semester: string;        // Semester
    quantity: number;        // Total quantity
    description: string;     // Book description
}

// Delete confirmation er jonno interface - kono kichu delete korar age ei confirmation lagbe
export interface DeleteConfirmation {
    isOpen: boolean;         
    bookId: string | null;   
    bookTitle: string;       
}

// Book borrow request er jonno interface - book borrow request er details ei structure e thakbe
export interface BorrowRequest {
    _id: string;              // Request ID
    book: Book;               // Book details
    status: 'Pending' | 'Accepted' | 'Rejected'; // Request status
    createdAt: string;        // Request creation date
}
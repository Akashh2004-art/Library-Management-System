import axios from 'axios';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding tokens
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');

    // Admin routes use adminToken, others use regular token
    if (config.url?.includes('/admin') && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      url: error.config?.url
    });

    if (error.response?.status === 404) {
      console.error('Endpoint not found:', error.config?.url);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// User related API calls
export const getUserProfile = async () => {
  const response = await API.get('/users/profile');
  return response.data;
};

// Book related API calls
export const getAllBooks = async () => {
  const response = await API.get('/books');
  return response.data;
};

export const getBooksByDepartmentAndSemester = async (department: string, semester: string) => {
  try {
    console.log('Fetching books for:', { department, semester }); // Debug log
    
    const response = await API.get('/books/filter', {
      params: {
        department,
        semester
      }
    });
    
    console.log('Books response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Book related API calls
export const updateBookStatus = async (bookId: string, newStatus: string) => {
  try {
    const response = await API.put(`/books/${bookId}/status`, {
      status: newStatus
    });
    console.log('Book status update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating book status:', error);
    throw error;
  }
};

export const getBorrowedBooks = async () => {
  try {
    console.log('Fetching borrowed books...');
    const response = await API.get('/users/borrowed-books');

    

  
    console.log('Raw borrowed books response:', response.data);
    
    // Transform and ensure status is included
    const transformedBooks = (response.data || []).map((book: any) => {
      const latestRecord = book.borrowRecords?.[book.borrowRecords.length - 1];
      
      return {
        _id: book._id,
        title: book.title,
        author: book.author,
        // Use both book status and latest record status
        status: latestRecord?.status || book.status || 'Unknown',
        dueDate: latestRecord?.dueDate || book.dueDate,
        borrowRecords: book.borrowRecords || []
      };
    });
    
    console.log('Transformed borrowed books:', transformedBooks);
    return transformedBooks;
    
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    throw error; // Let the error be handled by the calling function
  }
};

export const confirmNotification = async (notificationId: string) => {
  try {
    const response = await API.put(`/admin/notifications/${notificationId}/confirm`, {
      status: 'Accepted',
    });

    console.log('Notification confirmation response:', response.data);
    
    // Check if we received transactions data
    if (response.data.transactions) {
      // Dispatch custom event to refresh transactions UI
      const refreshEvent = new CustomEvent('refreshTransactions', { 
        detail: { transactions: response.data.transactions }
      });
      window.dispatchEvent(refreshEvent);
    }

    // If confirmation successful and has bookId, update book status
    if (response.data.notification?.bookId) {
      await updateBookStatus(response.data.notification.bookId, 'Accepted');

      // Trigger a manual refresh of borrowed books
      window.dispatchEvent(new CustomEvent('refreshBorrowedBooks'));
    }

    return response.data;
  } catch (error) {
    console.error('Error confirming notification:', error);
    throw error;
  }
};

export const requestBorrowBook = async (bookId: string) => {
  try {
    const response = await API.post('/users/borrow-request', { 
      bookId,
      status: 'Pending'
    });
    console.log('Borrow request response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in borrow request:', error);
    throw error;
  }
};

export const rejectNotification = async (notificationId: string) => {
  try {
    const response = await API.put(`/admin/notifications/${notificationId}/reject`, {
      status: 'Rejected'
    });

    // If rejection successful and has bookId, update book status
    if (response.data.notification?.bookId) {
      await updateBookStatus(response.data.notification.bookId, 'Rejected');

      // Trigger a manual refresh of borrowed books
      window.dispatchEvent(new CustomEvent('refreshBorrowedBooks'));
    }

    console.log('Notification rejection response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error rejecting notification:', error);
    throw error;
  }
};

// Fetch borrow requests API call
export const fetchBorrowRequests = async () => {
  const response = await API.get('/users/borrow-requests');
  return response.data;
};

// Error handling wrapper function
const handleApiError = async (apiCall: () => Promise<any>) => {
  try {
    return await apiCall();
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Something went wrong');
  }
};

// Update the safe API calls export
export const safeApiCalls = {
  getUserProfile: () => handleApiError(getUserProfile),
  getAllBooks: () => handleApiError(getAllBooks),
  getBooksByDepartmentAndSemester: (department: string, semester: string) =>
    handleApiError(() => getBooksByDepartmentAndSemester(department, semester)),
  getBorrowedBooks: () => handleApiError(getBorrowedBooks), // Updated here
  confirmNotification: (notificationId: string) =>
    handleApiError(() => confirmNotification(notificationId)), // Updated here
  rejectNotification: (notificationId: string) =>
    handleApiError(() => rejectNotification(notificationId)),
  requestBorrowBook: (bookId: string) =>
    handleApiError(() => requestBorrowBook(bookId)),
  fetchBorrowRequests: () => handleApiError(fetchBorrowRequests),
  updateBookStatus: (bookId: string, newStatus: string) =>
    handleApiError(() => updateBookStatus(bookId, newStatus)),
};

export default API;
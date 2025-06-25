import { useState, useEffect } from 'react';
import { Book as BookIcon, Calendar, Clock } from 'lucide-react';
import { Book, BorrowRequest, BorrowedBook } from '../../types';
import { 
  getBooksByDepartmentAndSemester, 
  getBorrowedBooks, 
  getUserProfile,
  fetchBorrowRequests 
} from '../../api/api';
import BookList from './BookList';

// Helper function for status information
const getStatusDetails = (status: string) => {
  switch (status) {
    case 'Pending':
      return {
        color: 'text-orange-500',
        icon: '⏳',
        text: 'Pending',
        description: 'Waiting for admin approval'
      };
    case 'Accepted':
      return {
        color: 'text-green-500',
        icon: '✅',
        text: 'Accepted',
        description: 'Your request has been approved'
      };
    case 'borrowed':
      return {
        color: 'text-blue-500',
        icon: '📚',
        text: 'Borrowed',
        description: 'Book is currently in your possession'
      };
    case 'Rejected':
      return {
        color: 'text-red-500',
        icon: '❌',
        text: 'Rejected',
        description: 'Your request was not approved'
      };
    default:
      return {
        color: 'text-gray-500',
        icon: '❓',
        text: 'Unknown',
        description: 'Status not available'
      };
  }
};

export default function UserDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  useEffect(() => {
    const fetchUserDataAndBooks = async () => {
      try {
        const userProfile = await getUserProfile();
        
        if (!userProfile.department || !userProfile.semester) {
          setError('Please update your department and semester in your profile');
          return;
        }
  
        console.log('Fetching updated book data...');
        const [booksData, borrowedData, requestData] = await Promise.all([
          getBooksByDepartmentAndSemester(userProfile.department, userProfile.semester),
          getBorrowedBooks(),
          fetchBorrowRequests(),
        ]);
  
        console.log('New borrowed books data:', borrowedData);
        setBorrowedBooks(borrowedData);
        setBooks(booksData as Book[]);
        setBorrowRequests(requestData);
      } catch (error: any) {
        console.error('Dashboard Error:', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data');
      }
    };
  
    fetchUserDataAndBooks();
    
    const handleRefresh = () => {
      console.log('Refresh event triggered');
      fetchUserDataAndBooks();
    };
  
    window.addEventListener('refreshBorrowedBooks', handleRefresh);
    const intervalId = setInterval(fetchUserDataAndBooks, 5000);
  
    return () => {
      window.removeEventListener('refreshBorrowedBooks', handleRefresh);
      clearInterval(intervalId);
    };
  }, []);

  // Handle borrow request function - eta book borrow korar jonno

  // Error thakle eta dekhabo
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Currently borrowed count calculation
  const currentlyBorrowedCount = borrowedBooks.filter(book => 
    book.status?.toLowerCase() === 'borrowed' || 
    book.status?.toLowerCase() === 'accepted'
  ).length;

  // Due soon calculation
  const dueSoonBooks = borrowedBooks.filter(book => {
    if (!book.dueDate) return false;
    if (book.status?.toLowerCase() !== 'borrowed' && 
        book.status?.toLowerCase() !== 'accepted') return false;

    const dueDate = new Date(book.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return diffDays <= 3 && diffDays > 0;
  });

  // Stats array
  const stats = [
    {
      title: 'Available Books',
      value: books.length,
      icon: <BookIcon className="w-6 h-6 text-blue-600" />,
      description: 'Total books you can borrow'
    },
    {
      title: 'Currently Borrowed',
      value: currentlyBorrowedCount,
      icon: <Calendar className="w-6 h-6 text-green-600" />,
      description: 'Books in your possession'
    },
    {
      title: 'Due Soon',
      value: dueSoonBooks.length,
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      description: 'Return within 3 days'
    }
  ];

  // Manual refresh function - Manually refresh korte chaile
  // Add debug logging
  useEffect(() => {
    console.log('Books Data:', {
      allBooks: borrowedBooks,
      borrowedCount: currentlyBorrowedCount,
      dueSoonCount: dueSoonBooks.length
    });

    borrowedBooks.forEach(book => {
      console.log('Book Status:', {
        title: book.title,
        status: book.status,
        dueDate: book.dueDate
      });
    });
  }, [borrowedBooks]);

  // Filter out duplicates from borrowedBooks
  const filteredBorrowedBooks = borrowedBooks.filter(borrowed => {
    return !borrowRequests.some(request => 
      request.book._id === borrowed._id
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard header */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        My Library Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Available Books Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Books</h2>
          <BookList books={books} setBooks={setBooks} />
        </div>

        {/* Borrowed Books Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Library Activity</h2>
          
          {(borrowRequests.length > 0 || filteredBorrowedBooks.length > 0) ? (
            <>
              {/* Pending Requests */}
              {borrowRequests.length > 0 && (
                <div className="mb-6">
                  {borrowRequests.map((request: BorrowRequest) => (
                    <div key={request._id} className="border rounded-lg p-4 mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{request.book.title}</h4>
                        <p className="text-sm text-gray-500">{request.book.author}</p>
                        
                        {/* Request Status */}
                        <div className={`mt-2 ${getStatusDetails(request.status).color}`}>
                          <p className="flex items-center gap-2">
                            <span>{getStatusDetails(request.status).icon}</span>
                            <span>{getStatusDetails(request.status).text}</span>
                          </p>
                          <p className="text-sm mt-1">{getStatusDetails(request.status).description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Current Borrowed Books */}
              <div className="mt-4">
                {filteredBorrowedBooks.map((book: BorrowedBook) => {
                  const statusInfo = getStatusDetails(book.status || 'Unknown');
                  
                  return (
                    <div key={book._id} className="border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
                      <div>
                        <h3 className="font-medium text-gray-900">{book.title}</h3>
                        <p className="text-sm text-gray-500">{book.author}</p>
                        
                        {/* Book Status */}
                        <div className={`mt-2 ${statusInfo.color}`}>
                          <p className="flex items-center gap-2">
                            <span className="text-lg">{statusInfo.icon}</span>
                            <span className="font-medium">{statusInfo.text}</span>
                          </p>
                          <p className="text-sm mt-1 opacity-75">{statusInfo.description}</p>
                        </div>

                        {/* Due Date if applicable */}
                        {(book.status === 'Accepted' || book.status === 'borrowed') && book.dueDate && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <Calendar className="w-4 h-4" />
                            <span>Return by: {new Date(book.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            // Show empty state only if both lists are empty
            <div className="text-center py-8 text-gray-500">
              <BookIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No Books Borrowed</p>
              <p className="text-sm mt-1">Borrow a book to see it here</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">{stat.icon}</div>
              <div>
                <p className="text-lg font-medium text-gray-700">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
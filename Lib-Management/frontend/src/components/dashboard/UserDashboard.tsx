import { useState, useEffect } from 'react';
import { Book as BookIcon, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { Book } from '../../types';
import BookList from './BookList';
import BorrowedBooks from './BorrowedBooks';
// import DashboardStats from './DashboardStats';

export default function UserDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [booksResponse, borrowedResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/books'),
          axios.get('http://localhost:5000/api/user/borrowed-books'),
        ]);
        setBooks(booksResponse.data);
        setBorrowedBooks(borrowedResponse.data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const stats = [
    {
      title: 'Books Available',
      value: books.length,
      icon: <BookIcon className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Books Borrowed',
      value: borrowedBooks.length,
      icon: <Calendar className="w-6 h-6 text-green-600" />,
    },
    {
      title: 'Due Soon',
      value: borrowedBooks.filter(book => {
        const dueDate = new Date(book.dueDate || '');
        const today = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays > 0;
      }).length,
      icon: <Clock className="w-6 h-6 text-orange-600" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Library Dashboard</h1>
      
      {/* <DashboardStats stats={stats} /> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Books</h2>
          <BookList books={books} />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Borrowed Books</h2>
          <BorrowedBooks books={borrowedBooks} />
        </div>
      </div>
    </div>
  );
}
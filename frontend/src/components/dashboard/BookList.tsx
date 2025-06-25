import { useState } from 'react';
import { Book } from '../../types';
import { Calendar } from 'lucide-react'; // Remove Clock since it's not used
import axios from 'axios';

interface BookListProps {
  books: Book[];
  setBooks: (books: Book[]) => void;
}

export default function BookList({ books, setBooks }: BookListProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [returnDate, setReturnDate] = useState<string>('');

  // Calculate minimum and maximum dates
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 15);

  const handleConfirm = async () => {
    try {
      if (!selectedBook || !returnDate) {
        alert('Please select a return date');
        return;
      }

      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/books/borrow-request', 
        {
          bookId: selectedBook._id,
          bookTitle: selectedBook.title,
          isbn: selectedBook.isbn,
          returnDate: returnDate
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Borrow request sent successfully! Please return the book by: ' + new Date(returnDate).toLocaleDateString());
        const updatedBooks = books.map(book => 
          book._id === selectedBook._id
            ? { ...book, availableQuantity: book.availableQuantity - 1 }
            : book
        );
        setBooks(updatedBooks);
      }

      setShowConfirmation(false);
      setSelectedBook(null);
      setReturnDate('');
    } catch (error) {
      console.error('Error sending borrow request:', error);
      alert('Failed to send borrow request. Please try again.');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((book) => (
          <div key={book._id} className="border rounded-lg p-4 flex space-x-4">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{book.title}</h3>
              <p className="text-sm text-gray-500">{book.author}</p>
              <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Available: {book.availableQuantity} / {book.quantity}
                </span>
              </div>
              {book.availableQuantity > 0 && (
                <button 
                  onClick={() => {
                    setSelectedBook(book);
                    setReturnDate('');
                    setShowConfirmation(true);
                  }}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Borrow Book
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Borrow</h3>
            <p className="mb-4">
              Are you sure you want to borrow "{selectedBook.title}"?
            </p>
            
            {/* Return Date Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Return Date
              </label>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={minDate.toISOString().split('T')[0]}
                  max={maxDate.toISOString().split('T')[0]}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Please return within 15 days
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setReturnDate('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!returnDate}
                className={`px-4 py-2 text-white rounded ${
                  !returnDate 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
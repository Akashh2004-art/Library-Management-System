import React from 'react';
import { Book } from '../../types';
import { Calendar, ArrowLeft } from 'lucide-react';

interface BorrowedBooksProps {
  books: Book[];
}

export default function BorrowedBooks({ books }: BorrowedBooksProps) {
  const formatDueDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDueDateStatus = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 3) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <div key={book.id} className="border rounded-lg p-4 flex space-x-4">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-24 h-32 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{book.title}</h3>
            <p className="text-sm text-gray-500">{book.author}</p>
            <div className="mt-2 flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span className={`text-sm ${getDueDateStatus(book.dueDate || '')}`}>
                Due: {formatDueDate(book.dueDate || '')}
              </span>
            </div>
            <button className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Return
            </button>
          </div>
        </div>
      ))}
      {books.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          You haven't borrowed any books yet.
        </div>
      )}
    </div>
  );
}
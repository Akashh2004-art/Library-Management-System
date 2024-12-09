import React from 'react';
import { Book } from '../../types';
import { Clock } from 'lucide-react';

interface BookListProps {
  books: Book[];
}

export default function BookList({ books }: BookListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <p className="text-sm text-gray-500">ISBN: {book.isbn}</p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${
                    book.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
              >
                {book.status === 'available' ? 'Available' : 'Borrowed'}
              </span>
            </div>
            {book.status === 'available' && (
              <button className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                <Clock className="w-4 h-4 mr-1" />
                Borrow
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
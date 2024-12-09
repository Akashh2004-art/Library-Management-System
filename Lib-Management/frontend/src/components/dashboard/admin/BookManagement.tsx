import React, { useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  coverImage: string;
}

export default function BookManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    coverImage: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/books', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming admin token is stored here
        },
      });
      toast.success('Book added successfully!');
      setShowAddForm(false);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        description: '',
        coverImage: '',
      });
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    }
  };
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search books..."
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Book
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Book</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    id="author"
                    required
                    value={formData.author}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    id="isbn"
                    required
                    value={formData.isbn}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="fiction">Fiction</option>
                    <option value="non-fiction">Non-Fiction</option>
                    <option value="science">Science</option>
                    <option value="technology">Technology</option>
                    <option value="history">History</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="coverImage"
                    id="coverImage"
                    required
                    value={formData.coverImage}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Book List Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Book rows will be mapped here */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
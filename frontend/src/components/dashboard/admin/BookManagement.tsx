import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Add this import

// Book er information store korar jonno interface
interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  department: string;
  semester: string;
  quantity: number;
  description: string;
}

// Book list e show korar jonno interface
interface Book {
  id: string;
  _id: string; // Added for API operations
  title: string;
  author: string; // Added for edit form
  isbn: string; // Added for edit form
  department: string;
  semester: string;
  availableQuantity: number;
  borrowedQuantity: number;
  quantity: number; // Added for edit form
  description: string; // Added for edit form
}

// Department ar semester er static data
const departments = ["C.S.T", "E.E", "E.T.C.E"];
const semesters = [1, 2, 3, 4, 5, 6];

export default function BookManagement() {
  const navigate = useNavigate(); // Add this
  const { user, isAuthenticated } = useAuth();

  // States for managing different aspects of the component
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    isbn: "",
    department: "",
    semester: "",
    quantity: 1,
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSemOpen, setIsSemOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  // Component mount howar por ei useEffect run hobe
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken || !isAuthenticated || user?.role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/admin/login");
      return;
    }

    fetchBooks();
  }, [isAuthenticated, user, navigate]);

  // Books fetch korar function
  const fetchBooks = async () => {
    try {
      // User role onujayi token set korbo
      const token = localStorage.getItem(
        user?.role === "admin" ? "adminToken" : "userToken"
      );

      const response = await axios.get("http://localhost:5000/api/books", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to fetch books.");
    }
  };

  // Form submit handle korar function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to add a book.");
      return;
    }

    // User role check kore token set korbo
    const token = localStorage.getItem(
      user?.role === "admin" ? "adminToken" : "userToken"
    );

    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post("http://localhost:5000/api/books", formData, config);
      toast.success("Book added successfully!");
      setShowAddForm(false);
      setFormData({
        title: "",
        author: "",
        isbn: "",
        department: "",
        semester: "",
        quantity: 1,
        description: "",
      });
      fetchBooks();
    } catch (error: any) {
      console.error("Error adding book:", error);

      if (error.response) {
        const errorMessage = error.response.data.message;

        if (errorMessage.includes("ISBN already exists")) {
          toast.error("Ei ISBN diye already ekta book add kora ache!");
        } else if (error.response.status === 401) {
          toast.error("Session expired! Please login again.");
        } else {
          toast.error(
            errorMessage || "Book add korte problem hocche. Please try again."
          );
        }
      } else {
        toast.error("Network problem! Internet connection check koren.");
      }
    }
  };

  // Form input change handle korar function
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Department select korar function
  const handleDepartmentSelect = (dept: string) => {
    setSelectedDepartment(dept);
    setIsDeptOpen(false);
  };

  // Semester select korar function
  const handleSemesterSelect = (sem: number) => {
    setSelectedSemester(sem.toString());
    setIsSemOpen(false);
  };

  // New states for edit and delete
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Edit book function
  const handleEditClick = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      department: book.department,
      semester: book.semester,
      quantity: book.quantity,
      description: book.description,
    });
    setShowEditForm(true);
  };

  // Delete book function
  const handleDeleteClick = (book: Book) => {
    setSelectedBook(book);
    setShowDeleteConfirm(true);
  };

  // Update book submit
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `http://localhost:5000/api/books/${selectedBook._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Book updated successfully!");
      setShowEditForm(false);
      fetchBooks();
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update book");
    }
  };

  // Delete book confirm
  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `http://localhost:5000/api/books/${selectedBook._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Book deleted successfully!");
      setShowDeleteConfirm(false);
      fetchBooks();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete book");
    }
  };

  return (
    <div className="space-y-6 p-4">
      {" "}
      {/* Add padding */}
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center">
        {" "}
        {/* Modified */}
        {/* Search Bar */}
        <div className="relative w-full md:max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search books..."
          />
        </div>
        {/* Department Filter */}
        <div className="w-full md:w-72 relative">
          <div
            onClick={() => setIsDeptOpen(!isDeptOpen)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white"
          >
            {selectedDepartment || "All departments"}
          </div>
          {isDeptOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleDepartmentSelect("")}
              >
                All departments
              </div>
              {departments.map((dept) => (
                <div
                  key={dept}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleDepartmentSelect(dept)}
                >
                  {dept}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Semester Filter */}
        <div className="w-full md:w-48 relative">
          <div
            onClick={() => setIsSemOpen(!isSemOpen)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white"
          >
            {selectedSemester
              ? `Semester ${selectedSemester}`
              : "All semesters"}
          </div>
          {isSemOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedSemester("");
                  setIsSemOpen(false);
                }}
              >
                All semesters
              </div>
              {semesters.map((sem) => (
                <div
                  key={sem}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSemesterSelect(sem)}
                >
                  Semester {sem}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Add Book Button */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full md:w-auto ml-0 md:ml-4 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Book
        </button>
      </div>
      {/* Books List Table - Add horizontal scroll */}
      <div className="overflow-x-auto bg-white shadow-sm rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Borrowed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">{books.map((book) => (
              <tr key={book._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.semester}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.availableQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.borrowedQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => handleEditClick(book)} className="text-indigo-600 hover:text-indigo-900">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteClick(book)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      {/* Add Book Modal Form remains unchanged */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New Book
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
              {/* Add Book Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title Input */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Author Input */}
                <div>
                  <label
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    id="author"
                    required
                    value={formData.author}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* ISBN Input */}
                <div>
                  <label
                    htmlFor="isbn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    id="isbn"
                    required
                    value={formData.isbn}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Department Select */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Department
                  </label>
                  <select
                    name="department"
                    id="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester Select */}
                <div>
                  <label
                    htmlFor="semester"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Semester
                  </label>
                  <select
                    name="semester"
                    id="semester"
                    required
                    value={formData.semester}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a semester</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description Textarea */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
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

                {/* Form Buttons */}
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
      {""}
      {/* Edit Book Modal */}
      {showEditForm && selectedBook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Book</h3>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
              {/* Edit Book Form */}
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                {/* Same form fields as Add Book form */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="author"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    id="author"
                    required
                    value={formData.author}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="isbn"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    id="isbn"
                    required
                    value={formData.isbn}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Department
                  </label>
                  <select
                    name="department"
                    id="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="semester"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Semester
                  </label>
                  <select
                    name="semester"
                    id="semester"
                    required
                    value={formData.semester}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a semester</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
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

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Update Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedBook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirm Delete
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete "{selectedBook.title}"? This
                  action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

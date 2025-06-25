import { useState, useEffect } from 'react';
import { User, Search, Pencil } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User as UserType } from '../../../types';

export default function UserManagement() {
  // Basic states
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isSemOpen, setIsSemOpen] = useState(false);
  
  // Edit related states
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [errorMessage] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    regNo: '',
    semester: ''
  });

  // Department and semester options
  const departments = ['C.S.T', 'E.E', 'E.T.C.E'];
  const semesters = [1, 2, 3, 4, 5, 6];

  // Page load e users fetch kora
  useEffect(() => {
    fetchUsers();
  }, []);

  // Users fetch korar function
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setUsers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load users');
      }
    } finally {
      setIsLoading(false);
    }
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

  // Edit button e click korle ei function call hobe
  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      department: user.department || '', // Direct abbreviated form
      regNo: user.regNo || '',
      semester: user.semester || ''
    });
    setIsEditModalOpen(true);
  };

  // Update button e click korle ei function call hobe
  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Direct form data send korbo, kono conversion lagbe na
      await axios.put(
        `http://localhost:5000/api/admin/users/${editingUser?.id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success('User update successful');
      setIsEditModalOpen(false);
      fetchUsers(); // Refresh user list
    } catch (error: any) {
      toast.error('User update failed');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Search and filter er function
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || user.department === selectedDepartment;
    const matchesSemester = !selectedSemester || user.semester?.toString() === selectedSemester;

    return matchesSearch && matchesDepartment && matchesSemester;
  });

  // Loading spinner show kora
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Find user..."
          />
        </div>

        {/* Department Filter */}
        <div className="w-full md:w-72 relative">
          <div
            onClick={() => setIsDeptOpen(!isDeptOpen)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white"
          >
            {selectedDepartment || 'All departments'}
          </div>
          {isDeptOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleDepartmentSelect('')}
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
            {selectedSemester ? `Semester ${selectedSemester}` : 'All semesters'}
          </div>
          {isSemOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              <div
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedSemester('');
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
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Registration No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Department Column - Direct show abbreviated form */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {user.department || '--'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.regNo || '--'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{user.semester || '--'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit user information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Registration No</label>
                <input
                  type="text"
                  value={editForm.regNo}
                  onChange={(e) => setEditForm({ ...editForm, regNo: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <select
                  value={editForm.semester}
                  onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Semester</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-2 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateLoading}
                className={`px-4 py-2 text-sm font-medium text-white ${
                  updateLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } rounded-md flex items-center`}
              >
                {updateLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
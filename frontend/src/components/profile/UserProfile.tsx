import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Save, X, LogOut } from 'lucide-react';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [regNo, setRegNo] = useState('');
  const [semester, setSemester] = useState('');
  const [isEditingRegNo, setIsEditingRegNo] = useState(false);
  const [isEditingSemester, setIsEditingSemester] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  // Add local state for user data
  const [userData, setUserData] = useState(user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || user?.role === 'admin') {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedUserData = response.data;
      
      // Update local state instead of using setUser
      setUserData({
        ...user!,
        id: user?.id || '', // Ensure id is always a string
        role: user?.role || 'user', // Provide default role
        name: fetchedUserData.name,
        email: fetchedUserData.email,
        department: fetchedUserData.department,
        regNo: fetchedUserData.regNo || '',
        semester: fetchedUserData.semester || '',
        phone: user?.phone || '' // Include phone with default value
      });

      // Update local state
      setRegNo(fetchedUserData.regNo || '');
      setSemester(fetchedUserData.semester || '');
      
      if (fetchedUserData.lastSemesterUpdateDate) {
        const lastUpdate = new Date(fetchedUserData.lastSemesterUpdateDate);
        const daysSinceUpdate = Math.floor((new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate < 20) {
          setDaysRemaining(20 - daysSinceUpdate);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleUpdateRegNo = async () => {
    if (!regNo) {
      return toast.error('Please enter your registration number');
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:5000/api/users/update-regno',
        { regNo },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setUserData(prevData => ({
        ...prevData!,
        regNo: response.data.regNo
      }));

      setIsEditingRegNo(false);
      toast.success('Registration number updated successfully');
      fetchUserProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update registration number');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSemester = async () => {
    if (!semester) {
      return toast.error('Please select your semester');
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:5000/api/users/update-semester',
        { semester },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setUserData(prevData => ({
        ...prevData!,
        semester: response.data.semester,
        lastSemesterUpdateDate: response.data.lastSemesterUpdateDate
      }));

      setIsEditingSemester(false);
      toast.success('Semester updated successfully');
      fetchUserProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update semester');
      if (error.response?.data?.daysRemaining) {
        setDaysRemaining(error.response.data.daysRemaining);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Check if user is admin or normal user
    const isAdmin = user?.role === 'admin';
    logout();
    navigate(isAdmin ? '/admin/login' : '/login');
  };

  // Use userData instead of user in the render section
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">User Profile</h2>
        
        {userData && (
          <div className="space-y-4">
            {/* Name - Non-editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {userData.name}
              </div>
            </div>
            
            {/* Email - Non-editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {userData.email}
              </div>
            </div>
            
            {/* Department - Non-editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {userData.department}
              </div>
            </div>
            
            {/* Registration Number */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                {!regNo && !isEditingRegNo && (
                  <button
                    type="button"
                    onClick={() => setIsEditingRegNo(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditingRegNo ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter registration number"
                  />
                  <button
                    onClick={handleUpdateRegNo}
                    disabled={isLoading}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsEditingRegNo(false)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {regNo || 'Not set'}
                </div>
              )}
              {isEditingRegNo && (
                <p className="mt-1 text-xs text-red-500">
                  * Registration number cannot be changed after saving
                </p>
              )}
            </div>
            
            {/* Semester */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Semester
                </label>
                {!isEditingSemester && (
                  <button
                    type="button"
                    onClick={() => setIsEditingSemester(true)}
                    className="text-blue-600 hover:text-blue-800"
                    disabled={daysRemaining !== null}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {isEditingSemester ? (
                <div className="flex items-center space-x-2">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select semester</option>
                    {[1, 2, 3, 4, 5, 6].map((sem) => (
                      <option key={sem} value={sem.toString()}>
                        {sem}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleUpdateSemester}
                    disabled={isLoading}
                    className="p-2 text-blue-600 hover:text-blue-800"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setIsEditingSemester(false)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {semester || 'Not set'}
                </div>
              )}
              {daysRemaining !== null && (
                <p className="mt-1 text-xs text-orange-500">
                  * Can update semester after {daysRemaining} days
                </p>
              )}
            </div>
            
            {/* Logout Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
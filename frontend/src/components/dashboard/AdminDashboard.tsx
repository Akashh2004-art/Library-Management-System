import { useState, useEffect } from 'react';
import { LogOut, Bell, Book, Users, History, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserManagement from './admin/UserManagement';
import BookManagement from './admin/BookManagement';
import TransactionHistory from './admin/TransactionHistory';
import { useNotifications } from '../../context/NotificationContext';

// Stats Card Component

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('books');
  const [showNotifications, setShowNotifications] = useState(false);
  // Update the destructuring to include the new functions
  const { notifications, unreadCount, markAllAsRead, confirmNotification, rejectNotification } = useNotifications();
  const [, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeLoans: 0,
    totalTransactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Tab options with icons
  const tabs = [
    { id: 'books', label: 'Books', icon: Book },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: History },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Bell with Animation */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-full relative transition-all duration-200 hover:scale-105"
              >
                <Bell className={`w-6 h-6 transition-transform duration-200 ${
                  unreadCount > 0 ? 'animate-bounce' : ''
                }`} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown with Animation */}
              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 transform transition-all duration-200 ease-out"
                  style={{
                    animation: 'slideIn 0.2s ease-out forwards',
                  }}
                >
                  <div className="p-3 border-b flex justify-between items-center">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          const element = document.querySelector('.notifications-container');
                          if (element) {
                            element.classList.add('fade-out');
                            setTimeout(async () => {
                              await markAllAsRead();
                              setShowNotifications(false);
                            }, 200);
                          }
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto notifications-container">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 animate-fade-in">
                        No notifications
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {notifications.map((notification, index) => (
                          <div
                            key={notification._id}
                            className={`
                              p-4 border-b hover:bg-gray-50 cursor-pointer 
                              transition-all duration-200 ease-in-out
                              transform hover:scale-[0.99]
                              ${notification.status === 'pending' ? 'bg-blue-50' : ''}
                            `}
                            style={{
                              animation: `slideIn 0.2s ease-out forwards ${index * 0.05}s`,
                            }}
                            id={notification._id}
                          >
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent notification click event
                                  confirmNotification(notification._id);
                                }}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent notification click event
                                  rejectNotification(notification._id);
                                }}
                                className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Logout Button with Animation */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg 
                transition-all duration-200 hover:bg-red-600 hover:shadow-md 
                transform hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>


        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    transition-all duration-200 ease-in-out
                    ${
                      activeTab === id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'books' && <BookManagement />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'transactions' && <TransactionHistory />}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Users, BookOpen, History, TrendingUp } from 'lucide-react';
import axios from 'axios';
// import { Book, User } from '../../types';
// import DashboardStats from './DashboardStats';
import UserManagement from './admin/UserManagement';
import BookManagement from './admin/BookManagement';
import TransactionHistory from './admin/TransactionHistory';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('books');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeLoans: 0,
    totalTransactions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
    },
    {
      title: 'Active Loans',
      value: stats.activeLoans,
      icon: <History className="w-6 h-6 text-orange-600" />,
    },
    {
      title: 'Total Transactions',
      value: stats.totalTransactions,
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* <DashboardStats stats={dashboardStats} /> */}

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['books', 'users', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'books' && <BookManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'transactions' && <TransactionHistory />}
        </div>
      </div>
    </div>
  );
}
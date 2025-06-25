import { useState, useEffect } from 'react';
import { Calendar, Search, Filter } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  bookId: string;
  bookTitle: string;
  type: 'borrow' | 'return';
  date: string;
  dueDate?: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'borrow' | 'return'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add event listener for refreshTransactions
  useEffect(() => {
    // Initial fetch
    fetchTransactions();

    // Add event listener for refresh
    const handleRefresh = () => {
      fetchTransactions();
    };

    // Listen for both regular event and custom event
    window.addEventListener('refreshTransactions', handleRefresh);

    // Cleanup
    return () => {
      window.removeEventListener('refreshTransactions', handleRefresh);
    };
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Please login first');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/transactions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Log the received data
      console.log('Fetched transactions:', response.data);
      
      setTransactions(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Transaction fetch error:', error);
      toast.error('Failed to fetch transactions');
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.bookTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            placeholder="Search transactions..."
          />
        </div>
        <div className="ml-4 relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'borrow' | 'return')}
            className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Transactions</option>
            <option value="borrow">Borrows Only</option>
            <option value="return">Returns Only</option>
          </select>
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'borrow'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {transaction.type === 'borrow' ? 'Borrowed' : 'Returned'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transaction.bookTitle}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transaction.userName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    <Calendar className="inline-block h-4 w-4 mr-1" />
                    {formatDate(transaction.date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.dueDate && (
                    <div className="text-sm text-gray-500">
                      <Calendar className="inline-block h-4 w-4 mr-1" />
                      {formatDate(transaction.dueDate)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
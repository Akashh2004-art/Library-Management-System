import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Library } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // useAuth ইম্পোর্ট করা হয়েছে

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(); // isAuthenticated স্টেট নেওয়া হয়েছে

  // Get Started বাটনে ক্লিক করলে লগইন স্টেটাস চেক করে রাউট করবে
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-8">
            <Library className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Library Management System</h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
            Your Gateway to Knowledge and Discovery
          </h2>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl">
            Access thousands of books, manage your reading list, and join our community
            of book lovers. Start your reading journey today!
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleGetStarted} // navigate('/login') থেকে handleGetStarted ফাংশনে পরিবর্তন করা হয়েছে
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors duration-200 flex items-center gap-2"
            >
              <Book className="w-5 h-5" />
              Get Started
            </button>
            
            <button
              onClick={() => navigate('/about')}
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg
                       hover:bg-blue-50 transition-colors duration-200"
            >
              Learn More
            </button>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Book className="w-8 h-8 text-blue-600" />}
              title="Vast Collection"
              description="Access thousands of books across multiple genres and categories"
            />
            <FeatureCard
              icon={<Library className="w-8 h-8 text-blue-600" />}
              title="Easy Management"
              description="Borrow and return books with just a few clicks"
            />
            <FeatureCard
              icon={<Book className="w-8 h-8 text-blue-600" />}
              title="Digital Tracking"
              description="Keep track of your reading history and due dates"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex flex-col items-center text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);
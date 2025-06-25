import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

export interface Notification {
  _id: string;
  message: string;
  status: 'pending' | 'confirmed' | 'rejected';  // Updated status types
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  confirmNotification: (notificationId: string) => Promise<void>;  // Added
  rejectNotification: (notificationId: string) => Promise<void>;   // Added
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize notifications as an empty array
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Calculate unreadCount from notifications array
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => n.status === "pending").length
    : 0;

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("adminToken"); // or 'token' depending on your setup

      if (!token) {
        console.log("No admin token found");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/admin/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: "unread", // Filter only unread notifications
          },
        }
      );

      // Ensure we're setting an array
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // If error occurs, set empty array
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        console.log("No admin token found");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/admin/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, status: "pending" }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        console.log("No admin token found");
        return;
      }

      // Backend API call to mark all as read
      await axios.put(
        "http://localhost:5000/api/admin/notifications/read-all",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clear notifications in the state
      setNotifications([]); // Purono notifications clear kore dewa
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Confirm notification
  const confirmNotification = async (notificationId: string) => {
    try {
      console.log('🔍 Starting confirmation process:', notificationId);
  
      const response = await axios.put(
        `http://localhost:5000/api/admin/notifications/${notificationId}/confirm`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
  
      // Log full response details
      console.log('📦 Full notification response:', {
        message: response.data.message,
        notification: response.data.notification,
        transactions: response.data.transactions // This should now contain updated transactions
      });
  
      // Check if bookId exists in notification details
      const bookId = response.data.notification?.details?.bookId || response.data.notification?.bookId;
      
      if (bookId) {
        console.log('📚 Updating book status for ID:', bookId);
        
        try {
          // Update book status with explicit status
          const bookResponse = await axios.put(
            `http://localhost:5000/api/books/${bookId}/status`,
            { 
              status: 'Accepted',
              updateType: 'notification_confirmation'
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
              },
            }
          );
          
          console.log('✅ Book update response:', bookResponse.data);
  
          // Trigger the transaction refresh event
          window.dispatchEvent(new Event('refreshTransactions'));
          
          // Trigger refresh of borrowed books
          window.dispatchEvent(new Event('refreshBorrowedBooks'));
        } catch (error) {
          console.error('❌ Book update error:', error);
        }
      } else {
        console.error('❌ No bookId found in notification!');
      }
  
      // Remove the notification from list
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      return response.data;
    } catch (error) {
      console.error('❌ Confirmation error:', error);
      throw error;
    }
  };

  // Reject notification
  const rejectNotification = async (notificationId: string) => {
    try {
      console.log('🔍 Starting rejection process:', notificationId);
  
      const response = await axios.put(
        `http://localhost:5000/api/admin/notifications/${notificationId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );
  
      // Log full response details
      console.log('📦 Full rejection response:', {
        message: response.data.message,
        notification: response.data.notification,
        transactions: response.data.transactions // This should now contain updated transactions
      });
  
      // Check if bookId exists in notification details
      const bookId = response.data.notification?.details?.bookId || response.data.notification?.bookId;
      
      if (bookId) {
        console.log('📚 Updating book status to Rejected for ID:', bookId);
        
        try {
          // Update book status to Rejected
          const bookResponse = await axios.put(
            `http://localhost:5000/api/books/${bookId}/status`,
            { 
              status: 'Rejected',
              updateType: 'notification_rejection'
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
              },
            }
          );
          
          console.log('✅ Book rejection response:', bookResponse.data);
  
          // Trigger the transaction refresh event
          window.dispatchEvent(new Event('refreshTransactions'));
          
          // Trigger refresh of borrowed books
          window.dispatchEvent(new Event('refreshBorrowedBooks'));
        } catch (error) {
          console.error('❌ Book rejection error:', error);
        }
      } else {
        console.error('❌ No bookId found in notification!');
      }
  
      // Remove notification from list
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      return response.data;
    } catch (error) {
      console.error('❌ Rejection error:', error);
      throw error;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        confirmNotification, // Add confirm
        rejectNotification,  // Add reject
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationProvider;
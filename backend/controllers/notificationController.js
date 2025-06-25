const Notification = require('../models/notificationModel');
const Transaction = require('../models/transactionModel');
const Book = require('../models/bookModel');

// Get all notifications
const getNotifications = async (req, res) => {
    try {
        const { status } = req.query; // Query parameter for filtering notifications

        // Apply filter only if status is provided
        const filter = status ? { status } : {}; 

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { status: 'read' },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { status: 'unread' },
            { status: 'read' }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No unread notifications found' });
        }

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
};

// Confirm notification
// Confirm notification
const confirmNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find notification
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update related transaction if BORROW_REQUEST type
    if (notification.type === 'BORROW_REQUEST' && notification.transactionId) {
      const transaction = await Transaction.findById(notification.transactionId);
      
      if (transaction) {
        // Update transaction status to Accepted
        transaction.status = 'Accepted';
        await transaction.save();
        
        // Update book availability
        if (notification.bookId) {
          const book = await Book.findById(notification.bookId);
          if (book && book.copiesAvailable > 0) {
            book.copiesAvailable -= 1;
            await book.save();
          }
        }
      }
    }

    // Update notification status
    notification.status = 'confirmed';
    await notification.save();

    // Return response with transaction details to update UI
    const updatedTransactions = await Transaction.find()
      .populate('userId', 'name email')
      .populate('bookId', 'title')
      .sort({ date: -1 });

    const formattedTransactions = updatedTransactions.map(transaction => ({
      id: transaction._id,
      userId: transaction.userId._id,
      userName: transaction.userId.name,
      bookId: transaction.bookId._id,
      bookTitle: transaction.bookId.title,
      type: transaction.action === 'lend' ? 'borrow' : 'return',
      date: transaction.date,
      dueDate: transaction.dueDate,
      status: transaction.status
    }));

    res.json({
      message: 'Notification confirmed successfully',
      notification: notification,
      transactions: formattedTransactions,
      status: 'confirmed'
    });

  } catch (error) {
    console.error('Error in confirmNotification:', error);
    res.status(500).json({ message: 'Error confirming notification' });
  }
};

// Reject notification
const rejectNotification = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find notification and populate book details
      const notification = await Notification.findById(id);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      // Extract bookId from notification
      const bookId = notification.details?.bookId;
      console.log('📦 Rejection details:', {
        id: notification._id,
        bookId: bookId,
        details: notification.details
      });
  
      // Update notification status
      notification.status = 'rejected';
      await notification.save();
  
      // Return response with book details
      res.json({
        message: 'Notification rejected successfully',
        notification: {
          ...notification.toObject(),
          bookId: bookId  // Explicitly include bookId
        },
        status: 'rejected'
      });
  
    } catch (error) {
      console.error('Error in rejectNotification:', error);
      res.status(500).json({ message: 'Error rejecting notification' });
    }
  };

// Export the new functions
module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    confirmNotification,
    rejectNotification
};
const Book = require('../models/bookModel');
const Notification = require('../models/notificationModel');

// Get all books
const getBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Error fetching books' });
    }
};

// Add new book
const addBook = async (req, res) => {
    try {
        const { title, author, isbn, department, semester, quantity, description } = req.body;
        const requestedBy = req.user?.username || req.user?.name || 'Unknown User';
        // Log for debugging
        console.log('New book add request:', {
            requestedBy,
            timestamp: new Date().toISOString(),
            bookDetails: { title, author, isbn }
        });

        // Validate all required fields
        if (!title || !author || !isbn || !department || !semester || !quantity || !description) {
            console.log('Missing fields:', {
                title: !title,
                author: !author,
                isbn: !isbn,
                department: !department,
                semester: !semester,
                quantity: !quantity,
                description: !description
            });
            return res.status(400).json({ 
                message: 'All fields are required',
                missing: {
                    title: !title,
                    author: !author,
                    isbn: !isbn,
                    department: !department,
                    semester: !semester,
                    quantity: !quantity,
                    description: !description
                }
            });
        }

        // Book limit check (300 books)
        const totalBooks = await Book.countDocuments();
        if (totalBooks >= 300) {
            return res.status(400).json({ 
                message: 'Maximum book limit reached (300 books allowed). Please delete some books to add new ones.' 
            });
        }

        // Check if book already exists
        const existingBook = await Book.findOne({ isbn });
        if (existingBook) {
            return res.status(400).json({ message: 'Book with this ISBN already exists' });
        }

        // Create new book
        const newBook = new Book({
            title,
            author,
            isbn,
            department,
            semester,
            quantity,
            description,
            availableQuantity: quantity,
            borrowedQuantity: 0
        });

        // Save book
        const savedBook = await newBook.save();
        console.log('Book added successfully:', savedBook);

        res.status(201).json({
            message: 'Book added successfully',
            book: savedBook
        });

    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ 
            message: 'Error adding book',
            error: error.message 
        });
    }
};

// Edit book er function
const updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const updateData = req.body;

        // Validation
        if (!updateData) {
            return res.status(400).json({ message: 'Update data required' });
        }

        // Check book exists ki na
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found!' });
        }

        // ISBN change korle check korbo je new ISBN already exists ki na
        if (updateData.isbn && updateData.isbn !== book.isbn) {
            const existingBook = await Book.findOne({ isbn: updateData.isbn });
            if (existingBook) {
                return res.status(400).json({ message: 'Book with this ISBN already exists!' });
            }
        }

        // Update book
        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            updateData,
            { new: true }  // Updated document return korbe
        );

        res.status(200).json({
            message: 'Book updated successfully!',
            book: updatedBook
        });

    } catch (error) {
        console.error('Book update error:', error);
        res.status(500).json({ message: 'Failed to update book' });
    }
};

// Delete book er function
const deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        
        // Check book exists ki na
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found!' });
        }

        // Check book borrowed ache ki na
        if (book.borrowedQuantity > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete book because some copies are currently borrowed!' 
            });
        }

        // Delete book
        await Book.findByIdAndDelete(bookId);
        
        res.status(200).json({ 
            message: 'Book deleted successfully!' 
        });

    } catch (error) {
        console.error('Book delete error:', error);
        res.status(500).json({ message: 'Failed to delete book' });
    }
};

// Get books by department and semester with availableQuantity > 0
const getBooksByDepartmentAndSemester = async (req, res) => {
    try {
        const { department, semester } = req.query;
        
        console.log('Filtering books:', { department, semester }); // Debug log
        
        if (!department || !semester) {
            return res.status(400).json({ 
                message: 'Both department and semester are required' 
            });
        }

        const books = await Book.find({
            department: department,
            semester: semester,
            availableQuantity: { $gt: 0 } // Only show books that are available
        });

        console.log(`Found ${books.length} books`); // Debug log

        res.json(books);
    } catch (error) {
        console.error('Error in getBooksByDepartmentAndSemester:', error);
        res.status(500).json({ message: 'Error fetching books' });
    }
};

// Add new function for borrow request
const createBorrowRequest = async (req, res) => {
    try {
        const { bookId, bookTitle, isbn, returnDate } = req.body;
        const userId = req.user?._id;
        const requestedBy = req.user?.username || req.user?.name || 'Unknown User';

        // Validate return date
        if (!returnDate) {
            return res.status(400).json({
                success: false,
                message: 'Return date is required'
            });
        }

        const plannedReturnDate = new Date(returnDate);
        const today = new Date();
        const maxReturnDate = new Date(today);
        maxReturnDate.setDate(today.getDate() + 15);

        if (plannedReturnDate > maxReturnDate) {
            return res.status(400).json({
                success: false,
                message: 'Return date cannot be more than 15 days from today'
            });
        }

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ 
                success: false,
                message: 'Book not found!' 
            });
        }

        // Check if book is available
        if (book.availableQuantity <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Book is not available for borrowing!' 
            });
        }

        // Add borrow record with planned return date
        book.borrowRecords.push({
            userId: userId,
            userName: requestedBy,
            borrowDate: new Date(),
            dueDate: maxReturnDate,
            plannedReturnDate: plannedReturnDate,
            status: 'borrowed'
        });

        // Update book quantities
        book.availableQuantity -= 1;
        book.borrowedQuantity += 1;

        // Create notification
        try {
            const notification = new Notification({
                type: 'BORROW_REQUEST',
                message: `${requestedBy} borrowed "${bookTitle}" (Due: ${maxReturnDate.toLocaleDateString()}, Planned Return: ${plannedReturnDate.toLocaleDateString()})`,
                details: {
                    bookId,
                    bookTitle,
                    isbn,
                    requestedBy,
                    dueDate: maxReturnDate,
                    plannedReturnDate
                },
                status: 'unread',
                createdAt: new Date()
            });

            await notification.save();
            console.log('Notification created:', notification);
        } catch (notifError) {
            console.error('Error creating notification:', notifError);
        }

        // Save the book
        await book.save();

        res.status(201).json({
            success: true,
            message: 'Book borrowed successfully!',
            book: {
                id: book._id,
                title: book.title,
                availableQuantity: book.availableQuantity,
                borrowedQuantity: book.borrowedQuantity,
                dueDate: maxReturnDate,
                plannedReturnDate
            }
        });

    } catch (error) {
        console.error('Error in borrow request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process borrow request',
            error: error.message
        });
    }
};

// Return book function
const returnBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const userId = req.user?._id;

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ 
                success: false,
                message: 'Book not found!' 
            });
        }

        // Find the borrow record
        const borrowRecord = book.borrowRecords.find(
            record => 
                record.userId.toString() === userId.toString() && 
                record.status === 'borrowed'
        );

        if (!borrowRecord) {
            return res.status(400).json({ 
                success: false,
                message: 'No active borrow record found for this book!' 
            });
        }

        // Update borrow record
        borrowRecord.returnDate = new Date();
        borrowRecord.status = 'returned';

        // Update book quantities
        book.availableQuantity += 1;
        book.borrowedQuantity -= 1;

        // Create return notification
        const notification = new Notification({
            type: 'GENERAL',
            message: `${req.user?.username || 'A user'} returned "${book.title}"`,
            details: {
                bookId: book._id,
                bookTitle: book.title,
                returnedBy: req.user?.username
            },
            status: 'unread'
        });

        await Promise.all([
            book.save(),
            notification.save()
        ]);

        res.status(200).json({
            success: true,
            message: 'Book returned successfully!',
            book: {
                id: book._id,
                title: book.title,
                availableQuantity: book.availableQuantity,
                borrowedQuantity: book.borrowedQuantity
            }
        });

    } catch (error) {
        console.error('Error returning book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to return book',
            error: error.message
        });
    }
};



// Add updateBookStatus function before module.exports
const updateBookStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, updateType } = req.body;
        
        console.log('📝 Update request:', {
            bookId: id,
            newStatus: status,
            type: updateType
        });

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Update both book and borrow record status
        book.status = status;
        
        if (book.borrowRecords && book.borrowRecords.length > 0) {
            const latestRecord = book.borrowRecords[book.borrowRecords.length - 1];
            latestRecord.status = status;
            console.log('📚 Updated borrow record:', latestRecord);
        }

        await book.save();
        console.log('✅ Book saved with new status:', status);

        res.json({
            success: true,
            message: 'Status updated successfully',
            book: {
                _id: book._id,
                title: book.title,
                status: status,
                borrowRecords: book.borrowRecords
            }
        });

    } catch (error) {
        console.error('❌ Status update error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getBooks, 
    addBook,
    updateBook,
    deleteBook,
    getBooksByDepartmentAndSemester,
    createBorrowRequest,
    returnBook,
    updateBookStatus
};

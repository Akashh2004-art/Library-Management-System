const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (replace with your connection string)
mongoose.connect('mongodb://localhost:27017/libraryDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => console.log(err));

// Routes
app.use('/api/books', booksRouter);

app.listen(3000, () => {
  console.log(`Server is running on port ${PORT}`);
});

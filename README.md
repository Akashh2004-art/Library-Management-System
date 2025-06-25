# 📚 EduStack - Full-Stack Library Management System

**EduStack** is a comprehensive full-stack Library Management System (LMS) built for students and admins. Users can browse available books, borrow and return them, while admins can manage books and users efficiently.

---

## 🚀 Features

### 👨‍🎓 User Side
- 📚 Browse available books
- 🔄 Borrow or return books
- 👁️ View borrowed books history
- 🔐 JWT-based secure user authentication
- 📱 Responsive UI (Desktop & Mobile)

### 🧑‍💼 Admin Side
- ➕ Add/Edit/Delete books
- 👥 Manage users and transactions
- 🔐 JWT-based secure admin login (email or phone)
- 🗂️ View all transactions in real-time

---

## 🏗️ Tech Stack

| Layer     | Technology                        |
|-----------|------------------------------------|
| Frontend  | React.js (Vite), TypeScript, Tailwind CSS |
| Backend   | Node.js, Express.js |
| Database  | MongoDB            |
| Auth      | JWT                               |
| Email     | Firebase           |

---

## 📁 Folder Structure

```
project-root/
├── backend/
│   ├── controllers/          # Logic for auth, user, book, transaction, admin
│   ├── middleware/           # JWT auth middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Route handlers
│   ├── utils/                # Helper functions
│   ├── .env                  # Environment variables
│   └── app.js                # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/              # API interface
│   │   ├── assets/           # Images and static files
│   │   ├── components/
│   │   │   ├── auth/         # Login, Signup, OTP
│   │   │   ├── dashboard/    # User/Admin dashboards
│   │   │   ├── layout/       # Navbar, ProtectedRoutes
│   │   ├── context/          # Auth & Notification context
│   │   ├── profile/          # User profile components
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Entry point
│   ├── .env                  # Frontend environment variables
│   └── vite.config.ts        # Vite configuration
```

---

## 🔐 Environment Variables Setup

### 🖥️ Backend `.env`

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET_USER=your_user_jwt_secret
JWT_SECRET_ADMIN=your_admin_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password_or_app_password
```



## ⚙️ Local Setup Instructions

### 1️⃣ Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---


## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📬 Contact

For any queries or suggestions, feel free to reach out:  
**Email:** akashsaha0751@gmail.com  
**Location:** Birshibpur, Uluberia, Howrah

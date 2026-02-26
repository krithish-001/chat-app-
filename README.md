# 💬 ChatApp - Modern Real-Time Messaging Platform

A full-stack, production-ready chat application built with the MERN stack (MongoDB, Express, React, Node.js) featuring real-time messaging, group chats, and a modern UI.

![ChatApp Banner](https://via.placeholder.com/1200x400/667eea/ffffff?text=ChatApp+-+Real-Time+Messaging)

## ✨ Features

### 🔐 Authentication & User Management
- Secure user registration and login with JWT
- Password hashing with bcrypt
- Profile customization with picture upload
- User search functionality

### 💬 Messaging
- **Real-time one-to-one chat** with Socket.io
- **Group chat** support
- Message timestamps
- Typing indicators ("User is typing...")
- Message seen/delivered status
- Emoji support
- Image and file sharing

### 🎨 User Experience
- **Modern, responsive UI** with Tailwind CSS
- **Dark/Light theme toggle**
- Online/offline status indicators
- Smooth animations with Framer Motion
- Mobile-friendly design
- Custom fonts (DM Sans, Sora)

### ⚡ Real-Time Features
- Live message delivery
- Instant online status updates
- Real-time typing indicators
- Socket.io for bidirectional communication

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Cloud storage

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Socket.io Client** - Real-time client
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **React Icons** - Icons
- **Emoji Picker React** - Emoji support

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Cloudinary config
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, upload, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── socket/          # Socket.io handlers
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_super_secret_key_here
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

   Server runs at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

4. **Start the app**
   ```bash
   npm start
   ```

   App runs at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/logout` | Logout user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/search?query=` | Search users |
| GET | `/api/users/conversations` | Get conversations |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Send message |
| GET | `/api/messages/:userId` | Get messages |
| PUT | `/api/messages/seen/:userId` | Mark as seen |
| DELETE | `/api/messages/:messageId` | Delete message |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create group |
| GET | `/api/groups` | Get user groups |
| GET | `/api/groups/:id` | Get group by ID |
| GET | `/api/groups/:id/messages` | Get group messages |
| PUT | `/api/groups/:id/members` | Add members |
| DELETE | `/api/groups/:id/members/:memberId` | Remove member |
| DELETE | `/api/groups/:id/leave` | Leave group |

## 🔌 Socket.io Events

### Client → Server
- `user-connected` - User comes online
- `send-message` - Send private message
- `send-group-message` - Send group message
- `typing` - Typing indicator
- `group-typing` - Group typing
- `message-seen` - Mark message as seen

### Server → Client
- `user-status-change` - User online/offline
- `receive-message` - New message
- `receive-group-message` - New group message
- `user-typing` - Typing status
- `group-user-typing` - Group typing
- `message-seen-update` - Seen status

## 🌐 Deployment

### Backend (Render / Railway)

1. Push to GitHub
2. Create new web service
3. Set environment variables
4. Deploy from Git

### Frontend (Vercel / Netlify)

1. Build the app:
   ```bash
   npm run build
   ```
2. Deploy `build` folder
3. Set environment variables
4. Configure redirects for React Router

### MongoDB Atlas

1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get connection string
3. Update `MONGODB_URI`

### Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get credentials
3. Update Cloudinary env variables

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Input validation
- ✅ XSS protection
- ✅ Secure file uploads

## 🎨 UI/UX Highlights

- **Modern gradient backgrounds**
- **Smooth animations** on page transitions
- **Custom scrollbar** styling
- **Responsive design** (mobile, tablet, desktop)
- **Dark mode** support
- **Professional typography** (DM Sans, Sora)
- **Intuitive user interface**
- **Real-time visual feedback**

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Built with ❤️ by a senior full-stack engineer

## 🙏 Acknowledgments

- Socket.io for real-time functionality
- Tailwind CSS for beautiful styling
- MongoDB for flexible data storage
- React team for amazing framework

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation
- Review the API endpoints

---

**⭐ If you find this project helpful, please give it a star!**

# BillKhata - Bill Management System

A full-stack application for managing shared bills and expenses with role-based authentication.

## Features

- **Authentication**: JWT-based secure authentication  
- **Role-Based Access**: Manager and Member roles with different permissions
- **Room Management**: Create and join shared expense rooms
- **Bill Tracking**: Create, view, and manage bills with payment status tracking
- **MongoDB Database**: Persistent data storage in MongoDB BILL database

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend  
- React 19
- TypeScript
- Vite
- Axios for API calls

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Install Backend Dependencies**
```bash
cd server
npm install
```

2. **Install Frontend Dependencies**
```bash
npm install
```

### Running the Application

1. **Start the Backend Server** (Terminal 1)
```bash
cd server
npm run dev
```
The server will run on `http://localhost:5000`

2. **Start the Frontend** (Terminal 2)
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## Usage

### For Managers:
1. Sign up with Manager role
2. Create a new room with a unique name
3. Share the 6-digit room code with members
4. Approve member join requests
5. Create and manage bills

### For Members:
1. Sign up with Member role
2. Join a room using the 6-digit code
3. Wait for manager approval
4. View bills and update payment status

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Rooms
- `POST /api/rooms/create` - Create room (Manager only)
- `POST /api/rooms/join` - Request to join room
- `GET /api/rooms/:roomId/members` - Get room members
- `GET /api/rooms/:roomId/pending` - Get pending requests (Manager only)
- `PUT /api/rooms/:roomId/approve/:userId` - Approve member (Manager only)

### Bills
- `GET /api/bills/:roomId` - Get all bills for room
- `POST /api/bills` - Create bill (Manager only)
- `PUT /api/bills/:billId/share/:userId` - Update payment status
- `GET /api/bills/:roomId/stats` - Get bill statistics

## Environment Variables

### Backend (`server/.env`)
```
MONGODB_URI=mongodb+srv://meal:BlUntsfgPGpR2SkW@mymongo.rhcri.mongodb.net/BILL?retryWrites=true&w=majority&appName=MyMongo
JWT_SECRET=billkhata-super-secret-jwt-key-change-in-production-2024
PORT=5000
NODE_ENV=development
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

## Database Structure

### Collections:
- **users**: User accounts with authentication
- **rooms**: Room/Khata information with members
- **bills**: Bills with shares and payment tracking

## Security Features

- Passwords hashed with bcrypt
- JWT tokens for stateless authentication
- Protected routes with authentication middleware
- Role-based access control
- CORS configuration

## License

ISC

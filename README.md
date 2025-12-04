# BillKhata - Expense Management Application

A full-stack expense management application for roommates to track bills, meals, shopping, and more.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or connection string)

### Installation

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables:**
   
   Create `.env` in the root directory:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
   
   Create `server/.env`:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

**Development mode - Run both frontend and backend together (recommended):**
```bash
npm run dev:all
```

This will start:
- Frontend (Vite): http://localhost:3000
- Backend (Express): http://localhost:5000

**Or run them separately in development:**

Frontend only:
```bash
npm run dev
```

Backend only:
```bash
cd server
npm run dev
```

### Build for Production

**Build the frontend:**
```bash
npm run build:all
```

This creates an optimized production build in the `dist` folder.

**Run in production mode:**
```bash
npm run start:all
```

This will start:
- Frontend (Preview server): http://localhost:4173
- Backend (Production): http://localhost:5000

**Or run them separately in production:**

Frontend only (serves built files):
```bash
npm run preview
```

Backend only:
```bash
cd server
npm start
```

## Features

- 👥 User authentication (Manager/Member roles)
- 🏠 Room management
- 💰 Bill tracking and splitting
- 🍽️ Meal management
- 🛒 Shopping list
- 📊 Reports and analytics
- 🔔 Real-time notifications
- 🌓 Dark mode support

## Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- Tailwind CSS (via inline styles)

**Backend:**
- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## Project Structure

```
billkhata/
├── components/          # React components
├── contexts/           # React contexts (Auth, Theme, Notifications)
├── pages/              # Page components
├── services/           # API service layer
├── server/             # Backend server
│   ├── models/        # Mongoose models
│   ├── routes/        # Express routes
│   └── middleware/    # Auth middleware
├── hooks/             # Custom React hooks
└── types.ts           # TypeScript type definitions
```

## License

ISC

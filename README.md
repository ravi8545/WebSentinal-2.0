# WebSentinal

**WebSentinal** is a Smart Website Monitoring Platform designed to track uptime, performance, and reliability of your web applications. It consists of a robust Node.js backend for monitoring and alerting, and a modern React frontend for managing websites and viewing reports.

## Features

- **Website Monitoring:** Actively monitors registered websites for uptime and performance via a dedicated monitor service.
- **Alerting System:** Notifies you when a website goes down or performance degrades. Includes support for alert grouping and email notifications via Nodemailer.
- **Authentication:** Secure user authentication using JWT and Google OAuth2.
- **Dashboard & Reports:** Modern, responsive UI to view monitoring logs, alerts, and performance reports.
- **Integrations:** Connect with third-party tools for advanced capabilities.

## Project Structure

The repository is divided into two main modules:

- `/Backend`: A Node.js API built with Express and MongoDB. Handles the core monitoring engine, authentication, and API endpoints.
- `/frontend`: A React application built with Vite and Tailwind CSS. Provides the user interface for the SaaS platform.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (running locally or a cloud instance like MongoDB Atlas)

### 1. Backend Setup

Navigate to the Backend directory:
```bash
cd Backend
```

Install dependencies:
```bash
npm install
```

Make sure you have a `.env` file in the `Backend` folder. Key environment variables include:
```env
PORT=3000
# Add your MongoDB connection string
MONGODB_URI=your_mongodb_connection_string
# Add your authentication secrets
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Start the backend server (dev mode):
```bash
npm run dev
```
The backend API will run on `http://localhost:3000`. The monitoring service will start automatically when the server starts.

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Tech Stack

### Backend
- **Node.js & Express:** API routing and server framework
- **MongoDB & Mongoose:** Database and ODM
- **Passport.js:** Authentication (Local & Google OAuth2)
- **JSON Web Tokens (JWT):** Secure session management
- **Nodemailer:** Email delivery for alerts

### Frontend
- **React (Vite):** Fast, modern frontend framework
- **Tailwind CSS:** Utility-first CSS framework for UI styling
- **Axios:** HTTP client for API requests
- **React Icons:** Icon library

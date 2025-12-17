# Resume AI - Client

A React-based frontend application for the AI Resume Analysis and Interview Assistant system.

## Features

- 🔐 **Authentication**: User registration and login with JWT
- 📄 **Resume Management**: Upload and manage PDF resumes
- 🤖 **RAG Query**: Ask questions about your resume using AI
- 💼 **Interview Practice**: Interactive interview simulation with AI-generated questions
- 📊 **PDF Reports**: Generate interview evaluation reports

## Tech Stack

- **React 19.2.0** - UI framework
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite 7** - Build tool and dev server
- **SWC** - Fast compiler

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults to `http://localhost:5000/api`):
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
client/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout.jsx   # Main layout with navigation
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── config/          # Configuration files
│   │   └── api.js       # Axios instance and interceptors
│   ├── context/         # React contexts
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── UploadResume.jsx
│   │   ├── Interview.jsx
│   │   └── RAGQuery.jsx
│   ├── services/        # API service layer
│   │   ├── authService.js
│   │   ├── resumeService.js
│   │   ├── ragService.js
│   │   └── interviewService.js
│   ├── App.jsx          # Main app component with routing
│   └── main.jsx         # Entry point
├── public/              # Static assets
└── package.json
```

## Available Routes

- `/login` - User login page
- `/register` - User registration page
- `/dashboard` - Main dashboard (protected)
- `/upload` - Upload resume page (protected)
- `/interview?resumeId=<id>` - Interview practice (protected)
- `/rag?resumeId=<id>` - RAG query interface (protected)

## Features Overview

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Automatic token injection in API requests
- Protected routes that redirect to login if not authenticated

### Resume Management
- Upload PDF resumes (max 5MB)
- View list of uploaded resumes
- Drag-and-drop file upload
- Automatic chunking and embedding on upload

### Interview Practice
- AI-generated interview questions
- Three modes: Mixed, Technical, Behavioral
- Answer submission and scoring
- Interview history tracking
- PDF report generation

### RAG Query
- Ask questions about your resume
- Select specific resume or search all
- AI-powered answers using RAG (Retrieval-Augmented Generation)

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

- `VITE_API_URL` - Backend API base URL (default: `http://localhost:5000/api`)

## Notes

- The app uses localStorage for token storage
- All API calls include authentication tokens automatically
- The app redirects to login on 401 errors
- CORS is configured on the backend for `http://localhost:5173`

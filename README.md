# AutoTask - Task Management System

Full-stack task management application with automated email notifications and user performance tracking.

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- PostgreSQL + Prisma ORM
- Google OAuth 2.0
- JWT Authentication
- Nodemailer (Gmail notifications)
- Node-cron (scheduled tasks)

### Frontend
- React 19 + TypeScript
- Vite
- React Router v6
- TanStack Query
- Zustand (state management)
- Tailwind CSS
- Google OAuth (@react-oauth/google)

## Features

- ✅ Google OAuth Login
- ✅ Role-based access (Admin/User)
- ✅ CRUD operations for tasks
- ✅ File attachments for tasks
- ✅ Automated email notifications (deadline reminders, overdue alerts)
- ✅ Task scoring system
- ✅ User performance tracking
- ✅ Admin dashboard with statistics
- ✅ Export users to Excel

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gmail account for email notifications
- Google OAuth Client ID

### Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment variables
# Create .env file with:
# VITE_API_URL=http://localhost:5000/api
# VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/autotask
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## API Endpoints

### Authentication
- POST `/api/auth/google` - Google OAuth login

### Admin Routes
- GET `/api/admin/tasks` - Get all tasks
- POST `/api/admin/tasks` - Create task
- GET `/api/admin/tasks/:id` - Get task details
- PUT `/api/admin/tasks/:id/complete` - Complete & score task
- PUT `/api/admin/tasks/:id/reset-score` - Reset task score
- DELETE `/api/admin/tasks/:id` - Delete task
- GET `/api/admin/users` - Get all users
- POST `/api/admin/users` - Create user
- DELETE `/api/admin/users/:id` - Delete user
- GET `/api/admin/users/export` - Export users to Excel

### User Routes
- GET `/api/user/tasks` - Get my tasks
- GET `/api/user/tasks/:id` - Get task details
- GET `/api/user/profile` - Get user profile

## Deployment

### Backend (Render.com)
1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`
   - Add environment variables

### Frontend (Render.com / Vercel / Netlify)
1. Create new Static Site
2. Configure:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Add environment variables

### Database (Render.com PostgreSQL)
1. Create PostgreSQL database
2. Copy DATABASE_URL to backend environment variables
3. Run migrations: `npx prisma migrate deploy`

## License

MIT

## Author

Developed with ❤️ by GitHub Copilot

# AutoTask Backend - Hệ Thống Quản Lý Công Việc

## 📋 Mô Tả

Hệ thống backend cho ứng dụng quản lý công việc (Task Management), hỗ trợ Admin giao việc, chấm điểm và User theo dõi tiến độ công việc. Hệ thống tích hợp Google OAuth, tự động gửi email thông báo và cron job để cập nhật trạng thái công việc.

## 🚀 Tính Năng Chính

### Authentication & Authorization
- ✅ Google OAuth 2.0 đăng nhập
- ✅ JWT token authentication
- ✅ Role-based access control (ADMIN/USER)

### Admin Features
- ✅ Tạo công việc và giao cho User
- ✅ Upload files đính kèm (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)
- ✅ Chấm điểm công việc (0-100)
- ✅ Reset điểm công việc
- ✅ Xóa công việc (soft delete)
- ✅ Quản lý Users (thêm, xóa, export Excel)
- ✅ Export báo cáo Excel về Users

### User Features
- ✅ Xem danh sách công việc được giao
- ✅ Xem chi tiết công việc và files đính kèm
- ✅ Xem điểm cá nhân và thống kê

### Automation
- ✅ Cron job tự động cập nhật trạng thái OVERDUE (mỗi 15 phút)
- ✅ Cron job gửi email nhắc nhở deadline (hằng ngày 9:00 AM)
- ✅ Email thông báo khi có công việc mới
- ✅ Email thông báo khi công việc được chấm điểm
- ✅ Email thông báo khi công việc bị xóa

## 🛠️ Công Nghệ Sử Dụng

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Google OAuth 2.0 + JWT
- **Email:** Nodemailer (Gmail SMTP)
- **File Upload:** Multer
- **Cron Jobs:** node-cron
- **Excel Export:** ExcelJS

## 📦 Cài Đặt

### 1. Prerequisites

- Node.js (v18 trở lên)
- PostgreSQL (v14 trở lên)
- npm hoặc yarn

### 2. Clone và Cài Đặt Dependencies

```bash
cd backend
npm install
```

### 3. Cấu Hình Environment Variables

Copy `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

Cấu hình các biến sau trong `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/autotask?schema=public"

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=AutoTask System <your-email@gmail.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### 4. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view database
npm run prisma:studio
```

### 5. Chạy Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### POST /api/auth/google
Đăng nhập bằng Google OAuth ID Token

**Request Body:**
```json
{
  "idToken": "google-id-token-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "USER",
      "score": 0
    }
  }
}
```

### Admin APIs (Require Authentication + ADMIN Role)

#### Tasks Management

**POST /api/admin/tasks** - Tạo task mới
```bash
# With file upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

title: "Task title"
description: "Task description"
assignedUserId: "user-uuid"
deadline: "2024-12-31T23:59:59Z"
files: [file1, file2]
```

**GET /api/admin/tasks** - Lấy danh sách tasks
```bash
GET /api/admin/tasks?page=1&limit=15&status=PENDING&assignedUserId=uuid
```

**GET /api/admin/tasks/:taskId** - Lấy chi tiết task

**PUT /api/admin/tasks/:taskId/complete** - Chấm điểm và hoàn thành task
```json
{
  "score": 85
}
```

**PUT /api/admin/tasks/:taskId/reset-score** - Reset điểm task

**DELETE /api/admin/tasks/:taskId** - Xóa task

#### Users Management

**GET /api/admin/users** - Lấy danh sách users
```bash
GET /api/admin/users?page=1&limit=15&sortBy=score
```

**POST /api/admin/users** - Tạo user mới
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "googleId": "google-id"
}
```

**DELETE /api/admin/users/:userId** - Xóa user (soft delete)

**GET /api/admin/users/export** - Export users ra file Excel

### User APIs (Require Authentication)

**GET /api/user/tasks** - Lấy danh sách tasks của bản thân
```bash
GET /api/user/tasks?page=1&limit=15
```

**GET /api/user/tasks/:taskId** - Xem chi tiết task

**GET /api/user/profile/score** - Xem điểm và thống kê cá nhân

## 🗂️ Cấu Trúc Project

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client
│   │   └── index.ts           # App configuration
│   ├── controllers/
│   │   ├── admin/             # Admin controllers
│   │   ├── user/              # User controllers
│   │   └── auth.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── admin/
│   │   ├── user/
│   │   ├── auth.routes.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── task.service.ts
│   │   └── user.service.ts
│   ├── jobs/
│   │   └── cron.jobs.ts       # Cron jobs
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── utils/
│   │   ├── errorHandler.ts
│   │   └── jwt.ts
│   └── app.ts                 # Main app entry
├── uploads/                   # File uploads directory
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Security Features

- ✅ JWT token authentication
- ✅ Google OAuth verification
- ✅ Role-based access control
- ✅ File upload validation (type & size)
- ✅ Input validation với express-validator
- ✅ SQL injection protection (Prisma ORM)
- ✅ CORS configuration

## 📧 Email Configuration (Gmail)

Để sử dụng Gmail SMTP, bạn cần:

1. Bật 2-Step Verification trong Google Account
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Sử dụng App Password trong `EMAIL_PASSWORD` environment variable

## 🤝 Google OAuth Setup

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable Google+ API
4. Tạo OAuth 2.0 Client ID (Web Application)
5. Thêm authorized redirect URIs
6. Copy Client ID và paste vào `GOOGLE_CLIENT_ID`

## 📊 Database Schema

### Users Table
- id, googleId, email, name, avatar
- role (ADMIN/USER)
- isActive (boolean)
- score, completedOnTimeCount, completedLateCount, incompleteCount

### Tasks Table
- id, title, description
- adminId, assignedUserId
- createdAt, deadline, completedAt
- status (PENDING/OVERDUE/COMPLETED)
- score (0-100)
- isDeleted (soft delete)

### TaskFiles Table
- id, taskId
- fileUrl, fileName, fileSize, mimeType

## 🔄 Cron Jobs

### Update Overdue Tasks
- **Tần suất:** Mỗi 15 phút
- **Chức năng:** Cập nhật tasks từ PENDING → OVERDUE nếu quá deadline

### Send Deadline Reminders
- **Tần suất:** Hằng ngày lúc 9:00 AM
- **Chức năng:** Gửi email nhắc nhở cho tasks có deadline trong 24h tới

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Kiểm tra PostgreSQL đang chạy
# Kiểm tra DATABASE_URL trong .env
# Chạy migration lại
npm run prisma:migrate
```

### Email Not Sending
```bash
# Kiểm tra Gmail App Password
# Kiểm tra EMAIL_USER và EMAIL_PASSWORD trong .env
# Kiểm tra firewall/antivirus
```

### TypeScript Errors
```bash
# Re-generate Prisma Client
npm run prisma:generate

# Clear node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

MIT License

## 👨‍💻 Author

AutoTask Development Team

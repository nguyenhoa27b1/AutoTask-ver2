# 📡 API ENDPOINTS DOCUMENTATION

Base URL: `http://localhost:5000/api`

---

## 🔓 Authentication Endpoints

### POST /auth/google
Đăng nhập bằng Google OAuth ID Token

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4..."
}
```

**Response (Success - Active User):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://lh3.googleusercontent.com/...",
      "role": "USER",
      "score": 85
    }
  }
}
```

**Response (New User - Needs Approval):**
```json
{
  "success": true,
  "message": "Account created. Please wait for admin approval.",
  "data": {
    "needsApproval": true
  }
}
```

---

## 👨‍💼 ADMIN ENDPOINTS

**All admin endpoints require:**
- Header: `Authorization: Bearer {token}`
- User role: `ADMIN`

### 📋 Task Management

#### POST /admin/tasks
Tạo task mới và giao cho user

**Request (multipart/form-data):**
```
title: "Hoàn thành báo cáo"
description: "Viết báo cáo tổng kết tháng 12"
assignedUserId: "123e4567-e89b-12d3-a456-426614174001"
deadline: "2024-12-31T23:59:59.000Z"
files: [file1.pdf, file2.docx]
```

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "task-uuid",
    "title": "Hoàn thành báo cáo",
    "description": "Viết báo cáo tổng kết tháng 12",
    "adminId": "admin-uuid",
    "assignedUserId": "user-uuid",
    "deadline": "2024-12-31T23:59:59.000Z",
    "status": "PENDING",
    "score": null,
    "createdAt": "2024-12-01T10:00:00.000Z",
    "assignedUser": {
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

---

#### GET /admin/tasks
Lấy danh sách tất cả tasks

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 15)
- `status` (PENDING | OVERDUE | COMPLETED)
- `assignedUserId` (uuid)

**Example:**
```
GET /admin/tasks?page=1&limit=15&status=PENDING
```

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "task-uuid",
      "title": "Hoàn thành báo cáo",
      "description": "...",
      "status": "PENDING",
      "deadline": "2024-12-31T23:59:59.000Z",
      "score": null,
      "assignedUser": {
        "id": "user-uuid",
        "email": "user@example.com",
        "name": "John Doe"
      },
      "admin": {
        "id": "admin-uuid",
        "email": "admin@example.com",
        "name": "Admin"
      },
      "files": [
        {
          "id": "file-uuid",
          "fileName": "report.pdf",
          "fileUrl": "uploads/report-123456.pdf",
          "fileSize": 1024000,
          "mimeType": "application/pdf"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 50,
    "totalPages": 4
  }
}
```

---

#### GET /admin/tasks/:taskId
Lấy chi tiết một task

**Response:**
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": "task-uuid",
    "title": "Hoàn thành báo cáo",
    "description": "...",
    "status": "PENDING",
    "deadline": "2024-12-31T23:59:59.000Z",
    "completedAt": null,
    "score": null,
    "assignedUser": { ... },
    "admin": { ... },
    "files": [ ... ]
  }
}
```

---

#### PUT /admin/tasks/:taskId/complete
Chấm điểm và đánh dấu task hoàn thành

**Request:**
```json
{
  "score": 85
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task completed and scored successfully",
  "data": {
    "id": "task-uuid",
    "status": "COMPLETED",
    "score": 85,
    "completedAt": "2024-12-15T14:30:00.000Z"
  }
}
```

**Logic:**
- Cập nhật task status → COMPLETED
- Gán điểm (0-100)
- Cập nhật user statistics:
  - Nếu hoàn thành đúng hạn: +1 `completedOnTimeCount`
  - Nếu hoàn thành trễ: +1 `completedLateCount`
  - Cộng điểm vào `score` của user
- Gửi email thông báo

---

#### PUT /admin/tasks/:taskId/reset-score
Reset điểm task về null và đổi status về PENDING

**Response:**
```json
{
  "success": true,
  "message": "Task score reset successfully"
}
```

---

#### DELETE /admin/tasks/:taskId
Xóa task (soft delete)

**Rules:**
- ✅ Có thể xóa task PENDING hoặc OVERDUE
- ❌ KHÔNG thể xóa task COMPLETED

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### 👥 User Management

#### GET /admin/users
Lấy danh sách users

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 15)
- `sortBy` (score | createdAt, default: score)

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://...",
      "role": "USER",
      "score": 285,
      "completedOnTimeCount": 8,
      "completedLateCount": 2,
      "incompleteCount": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

#### POST /admin/users
Tạo user mới (hoặc kích hoạt user đã tồn tại)

**Request:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "googleId": "google-oauth-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "user-uuid",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "USER",
    "isActive": true
  }
}
```

---

#### DELETE /admin/users/:userId
Vô hiệu hóa user (soft delete)

**Rules:**
- ❌ KHÔNG thể xóa ADMIN users

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

---

#### GET /admin/users/export
Export danh sách users ra file Excel

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- File download: `users-report-{timestamp}.xlsx`

**Excel Format:**
| Email | Tên | Vai trò | Điểm tổng | Hoàn thành đúng hạn | Hoàn thành trễ | Chưa hoàn thành | Ngày tạo |
|-------|-----|---------|-----------|---------------------|----------------|-----------------|----------|
| ... | ... | ... | ... | ... | ... | ... | ... |

---

## 👤 USER ENDPOINTS

**All user endpoints require:**
- Header: `Authorization: Bearer {token}`
- User role: `USER` (hoặc ADMIN)

### GET /user/tasks
Lấy danh sách tasks được giao cho bản thân

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 15)

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": [
    {
      "id": "task-uuid",
      "title": "Hoàn thành báo cáo",
      "description": "...",
      "status": "PENDING",
      "deadline": "2024-12-31T23:59:59.000Z",
      "score": null,
      "admin": {
        "email": "admin@example.com",
        "name": "Admin"
      },
      "files": [ ... ]
    }
  ],
  "pagination": { ... }
}
```

**Sorting:** OVERDUE → PENDING → COMPLETED (theo deadline tăng dần)

---

### GET /user/tasks/:taskId
Xem chi tiết task (chỉ được xem task của mình)

**Response:**
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "id": "task-uuid",
    "title": "Hoàn thành báo cáo",
    "description": "...",
    "status": "PENDING",
    "deadline": "2024-12-31T23:59:59.000Z",
    "score": null,
    "admin": { ... },
    "files": [
      {
        "id": "file-uuid",
        "fileName": "requirements.pdf",
        "fileUrl": "uploads/requirements-123456.pdf",
        "fileSize": 2048000,
        "mimeType": "application/pdf"
      }
    ]
  }
}
```

---

### GET /user/profile/score
Xem điểm và thống kê cá nhân

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "role": "USER",
    "score": 285,
    "completedOnTimeCount": 8,
    "completedLateCount": 2,
    "incompleteCount": 1
  }
}
```

---

## 🏥 Health Check

### GET /api/health

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-12-01T10:30:45.123Z"
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error: Score must be between 0 and 100",
  "error": "Validation error: Score must be between 0 and 100"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided",
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Task not found",
  "error": "Task not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Something went wrong"
}
```

---

## 📨 Email Notifications

Hệ thống tự động gửi email trong các trường hợp:

1. **Task được tạo:** Gửi ngay khi Admin tạo task mới
2. **Task được chấm điểm:** Gửi ngay khi Admin complete task
3. **Task bị xóa:** Gửi ngay khi Admin xóa task
4. **Nhắc nhở deadline:** Gửi hằng ngày (9:00 AM) cho tasks có deadline < 24h

---

## 🔄 Cron Jobs

### Update Overdue Tasks
- **Tần suất:** Mỗi 15 phút
- **Logic:** Cập nhật tasks có deadline < now và status = PENDING → OVERDUE

### Send Deadline Reminders
- **Tần suất:** Hằng ngày 9:00 AM
- **Logic:** Gửi email cho tasks có deadline trong 24h tới

---

## 📦 File Upload

**Allowed Types:**
- PDF (.pdf)
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- Images (.jpg, .jpeg, .png)

**Max Size:** 10MB per file

**Max Files:** 5 files per task

**Access:** Files được serve tại `/uploads/{filename}`

Example: `http://localhost:5000/uploads/report-1234567890.pdf`

---

## 🔐 Authentication Flow

1. Frontend gọi Google OAuth và lấy ID Token
2. Frontend gửi ID Token đến `POST /api/auth/google`
3. Backend verify token với Google
4. Backend kiểm tra user trong database:
   - Nếu user chưa tồn tại → Tạo mới (isActive = false) → Cần admin approve
   - Nếu user tồn tại nhưng isActive = false → Báo lỗi cần approve
   - Nếu user tồn tại và isActive = true → Tạo JWT token → Return
5. Frontend lưu JWT token
6. Frontend gửi JWT trong header `Authorization: Bearer {token}` cho các request sau

---

Happy coding! 🚀

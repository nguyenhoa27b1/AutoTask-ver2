# 🚀 QUICK START GUIDE

## Bước 1: Cài Đặt Dependencies

```powershell
cd backend
npm install
```

## Bước 2: Setup Database PostgreSQL

### Option 1: Cài PostgreSQL Local

1. Download PostgreSQL: https://www.postgresql.org/download/windows/
2. Install với password: `postgres123` (hoặc tùy chọn)
3. Mở pgAdmin 4 hoặc psql:

```sql
CREATE DATABASE autotask;
CREATE USER autotask_user WITH PASSWORD 'autotask123';
GRANT ALL PRIVILEGES ON DATABASE autotask TO autotask_user;
```

### Option 2: Dùng Docker

```powershell
docker run --name autotask-postgres -e POSTGRES_PASSWORD=postgres123 -e POSTGRES_DB=autotask -p 5432:5432 -d postgres:14
```

## Bước 3: Tạo File .env

```powershell
cp .env.example .env
```

Sửa file `.env` với thông tin của bạn:

```env
DATABASE_URL="postgresql://autotask_user:autotask123@localhost:5432/autotask?schema=public"
PORT=5000
NODE_ENV=development
JWT_SECRET=my-super-secret-key-for-development-only
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=AutoTask System <your-email@gmail.com>
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

## Bước 4: Setup Google OAuth

1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới (hoặc chọn project có sẵn)
3. Enable **Google+ API**
4. Credentials → Create Credentials → OAuth Client ID
5. Application Type: **Web Application**
6. Authorized JavaScript origins: `http://localhost:3000`
7. Authorized redirect URIs: `http://localhost:3000`
8. Copy **Client ID** và paste vào `.env`

## Bước 5: Setup Gmail App Password

1. Truy cập: https://myaccount.google.com/security
2. Bật **2-Step Verification**
3. Truy cập: https://myaccount.google.com/apppasswords
4. Chọn app: **Mail**, device: **Windows Computer**
5. Generate → Copy password (16 ký tự)
6. Paste vào `.env` → `EMAIL_PASSWORD`

## Bước 6: Run Database Migrations

```powershell
npm run prisma:generate
npm run prisma:migrate
```

## Bước 7: (Optional) Seed Data - Tạo Admin User

Mở pgAdmin hoặc psql:

```sql
INSERT INTO users (id, google_id, email, name, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin-google-id-123',
  'admin@example.com',
  'Admin User',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

## Bước 8: Start Development Server

```powershell
npm run dev
```

Server sẽ chạy tại: **http://localhost:5000**

## Bước 9: Test API

### Health Check
```powershell
curl http://localhost:5000/api/health
```

### Test Login (sau khi có Google ID Token)
```powershell
curl -X POST http://localhost:5000/api/auth/google `
  -H "Content-Type: application/json" `
  -d '{"idToken": "your-google-id-token"}'
```

## 🎉 DONE!

API endpoints:
- Health: `GET http://localhost:5000/api/health`
- Auth: `POST http://localhost:5000/api/auth/google`
- Admin Tasks: `http://localhost:5000/api/admin/tasks`
- Admin Users: `http://localhost:5000/api/admin/users`
- User Tasks: `http://localhost:5000/api/user/tasks`
- User Profile: `http://localhost:5000/api/user/profile/score`

## 🔧 Useful Commands

```powershell
# Development
npm run dev                    # Start dev server with auto-reload
npm run build                  # Build for production
npm start                      # Start production server

# Database
npm run prisma:generate        # Generate Prisma Client
npm run prisma:migrate         # Run migrations
npm run prisma:studio          # Open Prisma Studio (GUI)

# View logs
# (Logs sẽ hiện trong terminal khi chạy npm run dev)
```

## 📝 Next Steps

1. Tạo Frontend application
2. Integrate Google OAuth trong Frontend
3. Test toàn bộ flow: Login → Create Task → Email notification
4. Deploy lên production (xem DEPLOYMENT.md)

## ⚠️ Troubleshooting

### Error: "Cannot connect to database"
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL trong .env
- Kiểm tra username/password

### Error: "Email sending failed"
- Kiểm tra Gmail App Password
- Kiểm tra 2-Step Verification đã bật
- Kiểm tra EMAIL_USER và EMAIL_PASSWORD

### Error: "Module not found"
- Xóa node_modules: `rm -rf node_modules`
- Cài lại: `npm install`

### Error: Prisma Client not generated
- Chạy: `npm run prisma:generate`

Happy coding! 🚀

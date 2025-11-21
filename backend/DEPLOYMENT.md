# 🚀 HƯỚNG DẪN DEPLOYMENT - AUTOTASK BACKEND

## 📋 Mục Lục
1. [Chuẩn Bị Deploy](#1-chuẩn-bị-deploy)
2. [Deploy lên Azure App Service](#2-deploy-lên-azure-app-service)
3. [Deploy lên Railway](#3-deploy-lên-railway)
4. [Deploy lên Render](#4-deploy-lên-render)
5. [Deploy lên VPS (Ubuntu)](#5-deploy-lên-vps-ubuntu)

---

## 1. Chuẩn Bị Deploy

### Checklist Trước Khi Deploy

- [ ] Code đã test kỹ trên local
- [ ] Database PostgreSQL đã sẵn sàng
- [ ] Google OAuth Client ID đã được tạo
- [ ] Gmail App Password đã được tạo (cho email service)
- [ ] Frontend URL đã xác định
- [ ] Environment variables đã được chuẩn bị

### Build Production

```bash
cd backend
npm install
npm run build
```

Kiểm tra folder `dist/` đã được tạo thành công.

---

## 2. Deploy lên Azure App Service

### Bước 1: Cài Đặt Azure CLI

```bash
# Windows (PowerShell)
winget install Microsoft.AzureCLI

# Hoặc download từ: https://aka.ms/installazurecliwindows
```

### Bước 2: Login Azure

```bash
az login
```

### Bước 3: Tạo Resource Group

```bash
az group create --name autotask-rg --location eastasia
```

### Bước 4: Tạo PostgreSQL Database

```bash
# Tạo PostgreSQL server
az postgres flexible-server create \
  --resource-group autotask-rg \
  --name autotask-db-server \
  --location eastasia \
  --admin-user adminuser \
  --admin-password YourStrongPassword123! \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32

# Cho phép Azure services truy cập
az postgres flexible-server firewall-rule create \
  --resource-group autotask-rg \
  --name autotask-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Tạo database
az postgres flexible-server db create \
  --resource-group autotask-rg \
  --server-name autotask-db-server \
  --database-name autotask
```

Connection String sẽ có dạng:
```
postgresql://adminuser:YourStrongPassword123!@autotask-db-server.postgres.database.azure.com:5432/autotask?sslmode=require
```

### Bước 5: Tạo App Service Plan

```bash
az appservice plan create \
  --name autotask-plan \
  --resource-group autotask-rg \
  --sku B1 \
  --is-linux
```

### Bước 6: Tạo Web App

```bash
az webapp create \
  --resource-group autotask-rg \
  --plan autotask-plan \
  --name autotask-backend \
  --runtime "NODE:18-lts"
```

### Bước 7: Configure Environment Variables

```bash
az webapp config appsettings set \
  --resource-group autotask-rg \
  --name autotask-backend \
  --settings \
    DATABASE_URL="postgresql://adminuser:YourStrongPassword123!@autotask-db-server.postgres.database.azure.com:5432/autotask?sslmode=require" \
    NODE_ENV="production" \
    PORT="8080" \
    JWT_SECRET="your-super-secret-key-here" \
    JWT_EXPIRES_IN="7d" \
    GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com" \
    EMAIL_HOST="smtp.gmail.com" \
    EMAIL_PORT="587" \
    EMAIL_SECURE="false" \
    EMAIL_USER="your-email@gmail.com" \
    EMAIL_PASSWORD="your-app-password" \
    EMAIL_FROM="AutoTask <your-email@gmail.com>" \
    FRONTEND_URL="https://your-frontend-url.com" \
    MAX_FILE_SIZE="10485760" \
    UPLOAD_DIR="./uploads"
```

### Bước 8: Deploy Code

```bash
# Tạo file .deployment
echo "[config]
command = deploy.sh" > .deployment

# Tạo file deploy.sh
echo "#!/bin/bash
npm install
npm run build
npm run prisma:generate
npm run prisma:migrate deploy" > deploy.sh

# Deploy
az webapp deployment source config-zip \
  --resource-group autotask-rg \
  --name autotask-backend \
  --src autotask-backend.zip
```

### Bước 9: Enable Logging

```bash
az webapp log config \
  --resource-group autotask-rg \
  --name autotask-backend \
  --application-logging filesystem \
  --level verbose

# Xem logs
az webapp log tail \
  --resource-group autotask-rg \
  --name autotask-backend
```

**URL:** `https://autotask-backend.azurewebsites.net`

---

## 3. Deploy lên Railway

### Bước 1: Cài Railway CLI

```bash
npm install -g @railway/cli
```

### Bước 2: Login

```bash
railway login
```

### Bước 3: Initialize Project

```bash
cd backend
railway init
```

### Bước 4: Tạo PostgreSQL Database

```bash
railway add --database postgresql
```

### Bước 5: Set Environment Variables

Tạo file `.env.production`:

```env
DATABASE_URL=${{DATABASE_URL}}
NODE_ENV=production
PORT=${{PORT}}
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://your-frontend.com
```

### Bước 6: Configure Railway

Tạo file `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build && npm run prisma:generate"
  },
  "deploy": {
    "startCommand": "npm run prisma:migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Bước 7: Deploy

```bash
railway up
```

Railway sẽ tự động:
- Build code
- Run migrations
- Deploy app
- Tạo public URL

**URL:** Railway sẽ cung cấp URL tự động (ví dụ: `autotask-production.up.railway.app`)

---

## 4. Deploy lên Render

### Bước 1: Tạo Repository trên GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/autotask-backend.git
git push -u origin main
```

### Bước 2: Tạo PostgreSQL Database trên Render

1. Đăng nhập https://render.com
2. New → PostgreSQL
3. Name: `autotask-db`
4. Database: `autotask`
5. User: `autotask_user`
6. Region: Singapore
7. Create Database

Lưu lại **Internal Database URL** và **External Database URL**

### Bước 3: Tạo Web Service

1. New → Web Service
2. Connect GitHub repository
3. Name: `autotask-backend`
4. Region: Singapore
5. Branch: `main`
6. Runtime: Node
7. Build Command: `npm install && npm run build && npm run prisma:generate`
8. Start Command: `npm run prisma:migrate deploy && npm start`

### Bước 4: Set Environment Variables

Trong Render Dashboard → Environment:

```
DATABASE_URL=<Internal Database URL from step 2>
NODE_ENV=production
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=AutoTask <your-email@gmail.com>
FRONTEND_URL=https://your-frontend.com
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Bước 5: Deploy

Click **Create Web Service** - Render sẽ tự động deploy.

**URL:** `https://autotask-backend.onrender.com`

---

## 5. Deploy lên VPS (Ubuntu)

### Bước 1: Kết Nối VPS

```bash
ssh root@your-vps-ip
```

### Bước 2: Cài Đặt Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Nginx
apt install nginx -y

# Install PM2 (Process Manager)
npm install -g pm2
```

### Bước 3: Setup PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE autotask;
CREATE USER autotask_user WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE autotask TO autotask_user;
\q
```

### Bước 4: Upload Code

```bash
# Tạo thư mục app
mkdir -p /var/www/autotask-backend
cd /var/www/autotask-backend

# Clone repository (hoặc upload qua FTP/SCP)
git clone https://github.com/yourusername/autotask-backend.git .

# Install dependencies
npm install
```

### Bước 5: Configure Environment

```bash
# Tạo file .env
nano .env
```

Paste nội dung:

```env
DATABASE_URL="postgresql://autotask_user:your-strong-password@localhost:5432/autotask"
NODE_ENV=production
PORT=5000
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=AutoTask <your-email@gmail.com>
FRONTEND_URL=https://your-frontend.com
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Bước 6: Build và Run Migrations

```bash
npm run build
npm run prisma:generate
npm run prisma:migrate deploy
```

### Bước 7: Start App với PM2

```bash
# Start app
pm2 start dist/app.js --name autotask-backend

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Bước 8: Configure Nginx Reverse Proxy

```bash
nano /etc/nginx/sites-available/autotask
```

Paste:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/autotask /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### Bước 9: Setup SSL với Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your-domain.com

# Auto-renewal
certbot renew --dry-run
```

### Bước 10: Setup Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

**URL:** `https://your-domain.com`

---

## 🔐 Security Checklist

- [ ] JWT_SECRET là random string mạnh
- [ ] DATABASE_URL không bị expose
- [ ] Google OAuth redirect URIs đã được cập nhật
- [ ] CORS origin chỉ cho phép frontend domain
- [ ] SSL/HTTPS đã được enable
- [ ] Firewall đã được config đúng
- [ ] Database backup đã được setup
- [ ] Rate limiting đã được implement (nếu cần)

---

## 📊 Monitoring & Logs

### Azure
```bash
az webapp log tail --resource-group autotask-rg --name autotask-backend
```

### Railway
```bash
railway logs
```

### Render
Dashboard → Logs tab

### VPS (PM2)
```bash
pm2 logs autotask-backend
pm2 monit
```

---

## 🐛 Common Issues

### Database Connection Error
- Kiểm tra DATABASE_URL format
- Kiểm tra firewall rules
- Kiểm tra SSL mode (Azure cần `?sslmode=require`)

### Email Not Sending
- Kiểm tra Gmail App Password
- Kiểm tra 2-Step Verification đã bật
- Kiểm tra EMAIL_USER và EMAIL_PASSWORD

### File Upload Issues
- Kiểm tra UPLOAD_DIR permissions
- Kiểm tra MAX_FILE_SIZE
- Kiểm tra disk space

### Cron Jobs Not Running
- Kiểm tra timezone của server
- Kiểm tra PM2 logs
- Restart app: `pm2 restart autotask-backend`

---

## 📞 Support

Nếu gặp vấn đề trong quá trình deploy, hãy kiểm tra:
1. Logs của application
2. Database connection
3. Environment variables
4. Network/Firewall rules

Good luck với deployment! 🚀

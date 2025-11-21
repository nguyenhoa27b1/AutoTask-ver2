# 🚀 SETUP SCRIPT FOR WINDOWS
# Run this in PowerShell: .\setup.ps1

Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║            🚀 AutoTask Backend Setup 🚀                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Check Node.js
Write-Host "`n✅ Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "`n✅ Checking PostgreSQL..." -ForegroundColor Yellow
$pgVersion = psql --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   PostgreSQL version: $pgVersion" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  PostgreSQL not found in PATH" -ForegroundColor Yellow
    Write-Host "   Please make sure PostgreSQL is installed and running" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Dependencies installed successfully" -ForegroundColor Green

# Check .env file
Write-Host "`n🔧 Checking .env file..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  .env file not found, copying from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "   ✅ .env file created" -ForegroundColor Green
    Write-Host "   ⚠️  IMPORTANT: Please edit .env file with your configuration!" -ForegroundColor Red
}

# Generate Prisma Client
Write-Host "`n🔨 Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Prisma Client generated successfully" -ForegroundColor Green

# Run migrations
Write-Host "`n🗄️  Running database migrations..." -ForegroundColor Yellow
Write-Host "   Make sure PostgreSQL is running and DATABASE_URL in .env is correct!" -ForegroundColor Cyan
$confirm = Read-Host "   Continue with migration? (y/n)"
if ($confirm -eq "y" -or $confirm -eq "Y") {
    npm run prisma:migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Migration failed. Please check your database connection." -ForegroundColor Red
        Write-Host "   Verify DATABASE_URL in .env file" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Migrations completed successfully" -ForegroundColor Green
        
        # Ask to seed
        Write-Host "`n🌱 Seed sample data?" -ForegroundColor Yellow
        $seedConfirm = Read-Host "   This will create admin and test users (y/n)"
        if ($seedConfirm -eq "y" -or $seedConfirm -eq "Y") {
            npm run prisma:seed
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Sample data seeded successfully" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "   ⏭️  Skipped migration" -ForegroundColor Yellow
}

# Setup complete
Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║            ✅ Setup Complete! ✅                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "   2. Make sure PostgreSQL is running" -ForegroundColor White
Write-Host "   3. Run: npm run dev" -ForegroundColor White
Write-Host "   4. Open: http://localhost:5000/api/health" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - QUICKSTART.md   - Quick start guide" -ForegroundColor White
Write-Host "   - README.md       - Full documentation" -ForegroundColor White
Write-Host "   - API_DOCS.md     - API endpoints" -ForegroundColor White
Write-Host "   - DEPLOYMENT.md   - Deployment guide" -ForegroundColor White

Write-Host "`n🚀 Happy coding!`n" -ForegroundColor Green

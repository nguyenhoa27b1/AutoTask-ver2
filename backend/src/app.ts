import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './utils/errorHandler';
import cronJobs from './jobs/cron.jobs';

const app: Application = express();

// Middlewares
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(config.upload.uploadDir));

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'AutoTask API Server',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║            🚀 AutoTask Backend Server 🚀                   ║
║                                                            ║
║  Status:      ✅ Running                                   ║
║  Port:        ${PORT}                                       ║
║  Environment: ${config.nodeEnv}                             ║
║  API Docs:    http://localhost:${PORT}/api/health           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Start cron jobs
  cronJobs.startAll();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

export default app;

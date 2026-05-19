import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './core/config/env.config';
import { logger } from './core/utils/logger';
import { sendError } from './core/utils/response.helper';
import aiRoutes from './modules/ai/routes/ai.routes';
import profileVerificationRoutes from './modules/profileVerification/routes/profileVerification.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Rate Limiting Structure (Bonus)
// In a real production app, use 'express-rate-limit'
app.use((req, res, next) => {
  // Logic for rate limiting can be added here
  next();
});

// Logs for every request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/profile-verification', profileVerificationRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  sendError(res, 'Resource not found', 404);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled Exception', err);
  sendError(res, 'An unexpected error occurred', 500, config.env === 'development' ? err.message : undefined);
});

// Start Server
if (require.main === module) {
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.env} mode`);
  });
}

export default app;

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/environment';
import rootRouter from './routes';
import { requestLogger } from './middlewares/logger.middleware';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Middlewares
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Base route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to TinhDev Shop API!',
    apiDocumentation: '/api/health',
  });
});

// API Routes
app.use('/api', rootRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

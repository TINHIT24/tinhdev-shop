import { Request, Response } from 'express';
import { env } from '../config/environment';

export const getHealthStatus = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Backend server is running smoothly!',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      nodeVersion: process.version,
    },
  });
};

import { Request, Response } from 'express';
import { env } from '../config/environment';
import prisma from '../config/prisma';

export const getHealthStatus = async (_req: Request, res: Response): Promise<void> => {
  let dbStatus = 'Disconnected';
  try {
    // Run a lightweight query to test DB connection
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'Connected';
  } catch (error) {
    dbStatus = 'Connection failed';
    console.error('Database connection error in health check:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Backend server is running smoothly!',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      nodeVersion: process.version,
      database: {
        provider: 'PostgreSQL',
        status: dbStatus,
      },
    },
  });
};

import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://tinhdev:123456@localhost:5432/tinhdev_shop?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'tinhdev-shop-super-secret-jwt-key-2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'tinhdev-shop-super-secret-refresh-key-2026',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
};

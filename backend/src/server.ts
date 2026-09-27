import app from './app';
import { env } from './config/environment';

const server = app.listen(env.PORT, () => {
  console.log(`Server is running at http://localhost:${env.PORT}`);
  console.log(`Health check available at http://localhost:${env.PORT}/api/health`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

// Shut down gracefully
const shutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

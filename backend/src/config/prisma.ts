import { PrismaClient } from '@prisma/client';
import { env } from './environment';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.isDev ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.isDev) {
  global.prisma = prisma;
}

export default prisma;

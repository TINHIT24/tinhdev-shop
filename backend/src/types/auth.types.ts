import { Request } from 'express';
import { Role } from '@prisma/client';

export { Role }

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

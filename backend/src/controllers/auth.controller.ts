import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../types/auth.types';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, fullName, phone, role } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, and fullName are required.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const result = await authService.register({
      email,
      password,
      fullName,
      phone,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Email already registered.') {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
      return;
    }

    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === 'Invalid email or password.' ||
      error.message.includes('deactivated')
    ) {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'refreshToken is required in request body.',
      });
      return;
    }

    const tokens = await authService.refreshTokens(token);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully!',
      data: tokens,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token.',
    });
  }
};

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const user = await authService.getProfile(req.user.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

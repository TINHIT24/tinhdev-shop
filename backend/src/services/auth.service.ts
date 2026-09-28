import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password.util';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.util';
import { Role, TokenPayload } from '../types/auth.types';

export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: Role;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Đăng ký tài khoản người dùng mới
   */
  async register(data: RegisterDTO) {
    const email = data.email.toLowerCase().trim();

    // 1. Kiểm tra email đã tồn tại hay chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Email already registered.');
    }

    // 2. Mã hóa mật khẩu
    const hashedPassword = await hashPassword(data.password);

    // 3. Tạo user mới trong CSDL
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: data.fullName.trim(),
        phone: data.phone,
        role: data.role || Role.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // 4. Sinh bộ Tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 5. Lưu refresh token vào database (hạn 7 ngày)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Đăng nhập hệ thống
   */
  async login(data: LoginDTO) {
    const email = data.email.toLowerCase().trim();

    // 1. Tìm user theo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // 2. Kiểm tra tài khoản có bị khóa không
    if (!user.isActive) {
      throw new Error('Account has been deactivated. Please contact support.');
    }

    // 3. Đối chiếu mật khẩu
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    // 4. Sinh Tokens mới
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 5. Lưu refresh token mới vào database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Trả về thông tin (không bao gồm password)
    const { password: _, ...userInfo } = user;

    return {
      user: userInfo,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Cấp lại Access Token mới từ Refresh Token
   */
  async refreshTokens(refreshToken: string) {
    // 1. Xác thực cú pháp token
    const decoded = verifyRefreshToken(refreshToken);

    // 2. Kiểm tra token có lưu trong database và còn hạn không
    const savedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      if (savedToken) {
        await prisma.refreshToken.delete({ where: { id: savedToken.id } });
      }
      throw new Error('Refresh token is invalid or expired. Please login again.');
    }

    // 3. Cơ chế Token Rotation: Xóa token cũ, sinh bộ token mới
    await prisma.refreshToken.delete({
      where: { id: savedToken.id },
    });

    const payload: TokenPayload = {
      userId: savedToken.user.id,
      email: savedToken.user.email,
      role: savedToken.user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: savedToken.user.id,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Lấy thông tin cá nhân
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }
}

export const authService = new AuthService();

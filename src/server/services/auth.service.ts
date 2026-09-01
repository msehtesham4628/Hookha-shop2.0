import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/store.js';
import { User, Role } from '../../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sultan_super_secret_jwt_key_994829104';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sultan_super_secret_refresh_jwt_key_10382918';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export class AuthService {
  public generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`.trim()
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  public generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`.trim()
    };
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
  }

  public verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public async createAndStoreOTP(identifier: string, type: 'EMAIL' | 'SMS'): Promise<string> {
    // Invalidate existing OTPs for this identifier
    db.otps = db.otps.filter(o => o.identifier !== identifier);

    const otpCode = this.generateOTP();
    const codeHash = await bcrypt.hash(otpCode, 6);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    db.otps.push({
      identifier,
      codeHash,
      type,
      expiresAt,
      attempts: 0
    });

    return otpCode;
  }

  public async verifyOTP(identifier: string, code: string): Promise<{ valid: boolean; reason?: string }> {
    const record = db.otps.find(o => o.identifier === identifier);
    if (!record) {
      return { valid: false, reason: 'OTP expired or not requested' };
    }

    if (Date.now() > record.expiresAt) {
      db.otps = db.otps.filter(o => o.identifier !== identifier);
      return { valid: false, reason: 'OTP has expired. Please request a new one.' };
    }

    if (record.attempts >= 5) {
      db.otps = db.otps.filter(o => o.identifier !== identifier);
      return { valid: false, reason: 'Too many failed attempts. Please request a new code.' };
    }

    record.attempts += 1;
    const isMatch = await bcrypt.compare(code, record.codeHash);

    if (!isMatch) {
      return { valid: false, reason: 'Invalid verification code' };
    }

    // Single use: remove OTP after success
    db.otps = db.otps.filter(o => o.identifier !== identifier);
    return { valid: true };
  }

  public createPasswordResetToken(email: string): string {
    // Invalidate old tokens for this email
    db.passwordResetTokens = db.passwordResetTokens.filter(t => t.email !== email);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    db.passwordResetTokens.push({ token, email, expiresAt });
    return token;
  }

  public verifyPasswordResetToken(token: string): { valid: boolean; email?: string } {
    const record = db.passwordResetTokens.find(t => t.token === token);
    if (!record || Date.now() > record.expiresAt) {
      return { valid: false };
    }
    return { valid: true, email: record.email };
  }

  public invalidatePasswordResetToken(token: string) {
    db.passwordResetTokens = db.passwordResetTokens.filter(t => t.token !== token);
  }
}

export const authService = new AuthService();

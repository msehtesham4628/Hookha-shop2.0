import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/store.js';
import { authService } from '../services/auth.service.js';
import { emailService } from '../services/email.service.js';
import { smsService } from '../services/sms.service.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimit.middleware.js';
import { User } from '../../types/index.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// POST /api/auth/register
router.post('/register', authRateLimiter, async (req, res) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid registration fields', details: parse.error.format() }
      });
    }

    const { email, password, firstName, lastName, phone } = parse.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email address already exists.' }
      });
    }

    const passwordHash = await authService.hashPassword(password);
    const newUser: User & { passwordHash: string } = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: normalizedEmail,
      firstName,
      lastName,
      phone,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: false,
      isPhoneVerified: false,
      totalSpent: 0,
      orderCount: 0,
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);

    const accessToken = authService.generateAccessToken(newUser);
    const refreshToken = authService.generateRefreshToken(newUser);

    // Send welcome email in background
    emailService.sendEmail({
      to: normalizedEmail,
      subject: 'Welcome to Fumare Hookah — Premier Hookahs & Shisha',
      html: `<div style="font-family:sans-serif;padding:30px;"><h2>Welcome to Fumare Hookah, ${firstName}!</h2><p>Your account is ready. Discover our curated collection of luxury hookahs, handmade bowls, and rare dark leaf tobaccos.</p></div>`
    }).catch(console.error);

    res.cookie('auth_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });

    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: safeUser,
        token: accessToken,
        refreshToken
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Registration failed' }
    });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, async (req, res) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    const { email, password } = parse.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Account is suspended. Please contact concierge.' }
      });
    }

    const isMatch = await authService.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    }

    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    res.cookie('auth_token', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });

    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user: safeUser,
        token: accessToken,
        refreshToken
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Login failed' }
    });
  }
});

// POST /api/admin/auth/login (Admin portal login)
router.post('/admin-login', authRateLimiter, async (req, res) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' }
      });
    }

    const { email, password } = parse.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid staff credentials' }
      });
    }

    if (user.role === 'CUSTOMER') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: 'Account does not have administrative privileges.' }
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Staff account suspended.' }
      });
    }

    const isMatch = await authService.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid staff credentials' }
      });
    }

    user.lastLoginAt = new Date().toISOString();
    db.logAudit(
      { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
      'ADMIN_LOGIN',
      'AUTH',
      user.id,
      { method: 'PASSWORD' }
    );

    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    const { passwordHash: _, ...safeUser } = user;
    const roleRecord = db.roles.find(r => r.code === user.role);

    return res.json({
      success: true,
      message: 'Admin authentication successful',
      data: {
        user: safeUser,
        permissions: roleRecord ? roleRecord.permissions : [],
        token: accessToken,
        refreshToken
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Admin login failed' }
    });
  }
});

// POST /api/auth/send-email-otp
router.post('/send-email-otp', otpRateLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_EMAIL', message: 'Valid email is required' }
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const otpCode = await authService.createAndStoreOTP(normalizedEmail, 'EMAIL');
  await emailService.sendOTP(normalizedEmail, otpCode);

  return res.json({
    success: true,
    message: `A 6-digit security code has been transmitted to ${normalizedEmail}`
  });
});

// POST /api/auth/verify-email-otp
router.post('/verify-email-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Email and OTP code are required' }
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const verifyResult = await authService.verifyOTP(normalizedEmail, code);

  if (!verifyResult.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_OTP', message: verifyResult.reason || 'Verification failed' }
    });
  }

  let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    // Auto-create customer upon first verified OTP login
    const firstName = normalizedEmail.split('@')[0];
    user = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: normalizedEmail,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: '',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: false,
      totalSpent: 0,
      orderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(user);
  } else {
    user.isEmailVerified = true;
    user.lastLoginAt = new Date().toISOString();
  }

  const token = authService.generateAccessToken(user);
  const refreshToken = authService.generateRefreshToken(user);

  res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });

  const { passwordHash: _, ...safeUser } = user;

  return res.json({
    success: true,
    message: 'Authentication verified',
    data: { user: safeUser, token, refreshToken }
  });
});

// POST /api/auth/send-sms-otp
router.post('/send-sms-otp', otpRateLimiter, async (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 7) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_PHONE', message: 'Valid phone number is required' }
    });
  }

  const otpCode = await authService.createAndStoreOTP(phone, 'SMS');
  await smsService.sendOTP(phone, otpCode);

  return res.json({
    success: true,
    message: `A 6-digit SMS verification code was sent to ${phone}`
  });
});

// POST /api/auth/verify-sms-otp
router.post('/verify-sms-otp', async (req, res) => {
  const { phone, code, email, firstName, lastName } = req.body;
  if (!phone || !code) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_REQUEST', message: 'Phone and code are required' }
    });
  }

  const verifyResult = await authService.verifyOTP(phone, code);
  if (!verifyResult.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_OTP', message: verifyResult.reason || 'Verification failed' }
    });
  }

  let user = db.users.find(u => u.phone === phone);
  if (!user) {
    const assignedEmail = email || `phone_${phone.replace(/\D/g, '')}@sultanhookah.user`;
    user = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: assignedEmail,
      firstName: firstName || 'Member',
      lastName: lastName || '',
      phone,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: !!email,
      isPhoneVerified: true,
      totalSpent: 0,
      orderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(user);
  } else {
    user.isPhoneVerified = true;
    user.lastLoginAt = new Date().toISOString();
  }

  const token = authService.generateAccessToken(user);
  const refreshToken = authService.generateRefreshToken(user);

  res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });

  const { passwordHash: _, ...safeUser } = user;

  return res.json({
    success: true,
    message: 'Phone verified successfully',
    data: { user: safeUser, token, refreshToken }
  });
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  const { credential, email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_GOOGLE_AUTH', message: 'Google account email is required' }
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isBootstrappedAdmin = normalizedEmail === 'ehtesham4628@gmail.com' || normalizedEmail.endsWith('@worldhookahmarket.com');
  let user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    const parts = (name || '').split(' ');
    const firstName = parts[0] || 'Google';
    const lastName = parts.slice(1).join(' ') || 'User';

    user = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: normalizedEmail,
      firstName,
      lastName,
      avatarUrl,
      role: isBootstrappedAdmin ? 'SUPER_ADMIN' : 'CUSTOMER',
      status: 'ACTIVE',
      isEmailVerified: true,
      isPhoneVerified: false,
      totalSpent: 0,
      orderCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(user);
  } else {
    if (isBootstrappedAdmin && user.role !== 'SUPER_ADMIN') {
      user.role = 'SUPER_ADMIN';
    }
    user.isEmailVerified = true;
    user.lastLoginAt = new Date().toISOString();
    if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
  }

  const token = authService.generateAccessToken(user);
  const refreshToken = authService.generateRefreshToken(user);

  res.cookie('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });

  const { passwordHash: _, ...safeUser } = user;

  return res.json({
    success: true,
    message: 'Signed in via Google',
    data: { user: safeUser, token, refreshToken }
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authRateLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_EMAIL', message: 'Email is required' }
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (user) {
    const token = authService.createPasswordResetToken(normalizedEmail);
    await emailService.sendPasswordReset(normalizedEmail, token);
  }

  // Consistent positive response to prevent user enumeration
  return res.json({
    success: true,
    message: 'If an account exists with this email, password reset instructions have been dispatched.'
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Valid token and minimum 8-character password are required' }
    });
  }

  const verify = authService.verifyPasswordResetToken(token);
  if (!verify.valid || !verify.email) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Password reset link has expired or is invalid.' }
    });
  }

  const user = db.users.find(u => u.email.toLowerCase() === verify.email!.toLowerCase());
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'Account not found' }
    });
  }

  user.passwordHash = await authService.hashPassword(newPassword);
  user.updatedAt = new Date().toISOString();
  authService.invalidatePasswordResetToken(token);

  return res.json({
    success: true,
    message: 'Password has been securely reset. You may now sign in.'
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const roleRecord = db.roles.find(r => r.code === user.role);
  const permissions = roleRecord ? roleRecord.permissions : [];

  const { passwordHash: _, ...safeUser } = user as any;

  return res.json({
    success: true,
    data: {
      user: safeUser,
      permissions
    }
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({
    success: true,
    message: 'Signed out successfully'
  });
});

export default router;

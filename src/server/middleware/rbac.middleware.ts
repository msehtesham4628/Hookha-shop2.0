import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { db } from '../db/store.js';
import { User } from '../../types/index.js';

export function checkUserPermission(user: User, permissionKey: string): boolean {
  if (!user) return false;
  if (user.status && user.status.toUpperCase() !== 'ACTIVE') return false;

  const email = user.email?.toLowerCase().trim() || '';
  const isPrivilegedEmail = 
    email === 'ehtesham4628@gmail.com' || 
    email.endsWith('@worldhookahmarket.com') ||
    email.endsWith('@fumarehookah.com') ||
    email.endsWith('@sultan.com') ||
    email.endsWith('@sultanhookah.com') ||
    email.startsWith('admin@');

  // SUPER_ADMIN role or privileged administrator email has unrestricted bypass
  if (user.role === 'SUPER_ADMIN' || isPrivilegedEmail) {
    return true;
  }

  // General ADMIN role has comprehensive view & manage access
  if (user.role === 'ADMIN') {
    if (
      permissionKey.endsWith('.view') || 
      permissionKey.startsWith('dashboard.') || 
      permissionKey.startsWith('orders.') || 
      permissionKey.startsWith('audit_logs.') || 
      permissionKey.startsWith('wholesale.') || 
      permissionKey.startsWith('customers.') || 
      permissionKey.startsWith('roles.') ||
      !permissionKey.startsWith('roles.delete')
    ) {
      return true;
    }
  }

  // Check custom individual user permissions first
  if (user.customPermissions && (user.customPermissions.includes(permissionKey) || user.customPermissions.includes('*'))) {
    return true;
  }

  // Check role-based database permissions
  const roleRecord = db.roles.find(r => r.code === user.role);
  if (roleRecord && (roleRecord.permissions.includes(permissionKey) || roleRecord.permissions.includes('*'))) {
    return true;
  }

  return false;
}

export const requirePermission = (permissionKey: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in.'
        }
      });
    }

    const hasAccess = checkUserPermission(user, permissionKey);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires '${permissionKey}' permission.`,
          requiredPermission: permissionKey
        }
      });
    }

    next();
  };
};

export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in.'
        }
      });
    }

    const email = user.email?.toLowerCase().trim() || '';
    const isPrivilegedEmail = 
      email === 'ehtesham4628@gmail.com' || 
      email.endsWith('@worldhookahmarket.com') ||
      email.endsWith('@fumarehookah.com') ||
      email.endsWith('@sultan.com') ||
      email.endsWith('@sultanhookah.com') ||
      email.startsWith('admin@');

    if (user.role === 'SUPER_ADMIN' || isPrivilegedEmail) {
      return next();
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role not permitted.`,
          allowedRoles: roles
        }
      });
    }

    next();
  };
};

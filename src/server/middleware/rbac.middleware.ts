import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { db } from '../db/store.js';
import { User } from '../../types/index.js';

export function checkUserPermission(user: User, permissionKey: string): boolean {
  if (!user || user.status !== 'ACTIVE') return false;

  // SUPER_ADMIN role has unrestricted bypass across all system endpoints
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // Check custom individual user permissions first
  if (user.customPermissions && user.customPermissions.includes(permissionKey)) {
    return true;
  }

  // Check role-based database permissions
  const roleRecord = db.roles.find(r => r.code === user.role);
  if (roleRecord && roleRecord.permissions.includes(permissionKey)) {
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
          message: 'Authentication required'
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
          message: 'Authentication required'
        }
      });
    }

    if (user.role === 'SUPER_ADMIN') {
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

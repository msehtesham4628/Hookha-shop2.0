import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';
import { db } from '../db/store.js';
import { User } from '../../types/index.js';

// Pre-defined wildcard permissions for built-in administrative roles
const ADMIN_ALLOWED_NAMESPACES = [
  'dashboard.',
  'orders.',
  'audit_logs.',
  'wholesale.',
  'customers.',
  'roles.'
];

export function checkUserPermission(user: User | undefined, permissionKey: string): boolean {
  if (!user || (user.status && user.status.toUpperCase() !== 'ACTIVE')) {
    return false;
  }

  // 1. Absolute bypass for Super Admin
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  // 2. Explicit User-level Overrides
  if (user.customPermissions?.length) {
    if (user.customPermissions.includes('*') || user.customPermissions.includes(permissionKey)) {
      return true;
    }
  }

  // 3. Built-in ADMIN Role Policy
  if (user.role === 'ADMIN') {
    // Explicit deny list for standard Admins
    if (permissionKey.startsWith('roles.delete')) {
      return false;
    }
    // Allow standard admin namespaces or generic read permissions
    if (
      permissionKey.endsWith('.view') ||
      ADMIN_ALLOWED_NAMESPACES.some((prefix) => permissionKey.startsWith(prefix))
    ) {
      return true;
    }
  }

  // 4. Role-based DB permissions
  const roleRecord = db.roles.find((r) => r.code === user.role);
  if (roleRecord?.permissions) {
    return (
      roleRecord.permissions.includes('*') || 
      roleRecord.permissions.includes(permissionKey)
    );
  }

  return false;
}

export const requirePermission = (permissionKey: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in.' }
      });
    }

    if (!checkUserPermission(user, permissionKey)) {
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
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in.' }
      });
    }

    if (user.role === 'SUPER_ADMIN' || roles.includes(user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied. Role not permitted.',
        allowedRoles: roles
      }
    });
  };
};

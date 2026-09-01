import { Router } from 'express';
import { db } from '../db/store.js';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';

const router = Router();

const getUserId = (req: AuthenticatedRequest): string => {
  return req.user ? req.user.id : (req.headers['x-guest-id'] as string) || 'guest_default';
};

// GET /api/wishlist
router.get('/', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const record = db.wishlists.find(w => w.userId === userId);
  const productIds = record ? record.productIds : [];

  const products = db.products.filter(p => productIds.includes(p.id) && p.isActive);

  return res.json({
    success: true,
    data: {
      items: products,
      productIds
    }
  });
});

// POST /api/wishlist/:productId
router.post('/:productId', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const { productId } = req.params;

  let record = db.wishlists.find(w => w.userId === userId);
  if (!record) {
    record = { userId, productIds: [] };
    db.wishlists.push(record);
  }

  if (!record.productIds.includes(productId)) {
    record.productIds.push(productId);
  }

  return res.json({
    success: true,
    message: 'Added to wishlist',
    data: { productIds: record.productIds }
  });
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const { productId } = req.params;

  const record = db.wishlists.find(w => w.userId === userId);
  if (record) {
    record.productIds = record.productIds.filter(id => id !== productId);
  }

  return res.json({
    success: true,
    message: 'Removed from wishlist',
    data: { productIds: record ? record.productIds : [] }
  });
});

export default router;

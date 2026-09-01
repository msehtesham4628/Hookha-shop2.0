import { Router } from 'express';
import { db } from '../db/store.js';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Cart, CartItem } from '../../types/index.js';

const router = Router();

const getOrCreateUserId = (req: AuthenticatedRequest): string => {
  if (req.user) return req.user.id;
  const guestId = (req.headers['x-guest-id'] as string) || (req.query.guestId as string) || 'guest_default';
  return guestId;
};

export const calculateCartTotals = (userId: string, couponCode?: string): Cart => {
  const userItems = db.cartItems.filter(item => item.userId === userId);
  const cartItems: CartItem[] = [];

  let subtotal = 0;
  let itemCount = 0;

  for (const item of userItems) {
    const product = db.products.find(p => p.id === item.productId && p.isActive);
    if (!product) continue;

    const unitPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
    const qty = Math.min(item.quantity, Math.max(1, product.stock));
    const totalPrice = unitPrice * qty;

    subtotal += totalPrice;
    itemCount += qty;

    cartItems.push({
      id: item.id,
      productId: product.id,
      product,
      quantity: qty,
      selectedFlavor: item.selectedFlavor,
      selectedColor: item.selectedColor,
      unitPrice,
      totalPrice
    });
  }

  // Coupon discount calculation
  let couponDiscount = 0;
  if (couponCode) {
    const coupon = db.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
    if (coupon) {
      const isMinSpendMet = !coupon.minOrderAmount || subtotal >= coupon.minOrderAmount;
      if (isMinSpendMet) {
        if (coupon.discountType === 'PERCENTAGE') {
          couponDiscount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && couponDiscount > coupon.maxDiscountAmount) {
            couponDiscount = coupon.maxDiscountAmount;
          }
        } else {
          couponDiscount = Math.min(subtotal, coupon.discountValue);
        }
      }
    }
  }

  const shippingFee = subtotal >= db.settings.freeShippingThreshold || subtotal === 0 ? 0 : db.settings.standardShippingFee;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const estimatedTax = (taxableAmount * db.settings.taxRatePercent) / 100;
  const grandTotal = taxableAmount + shippingFee + estimatedTax;

  return {
    items: cartItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discountTotal: Math.round(couponDiscount * 100) / 100,
    couponCode: couponDiscount > 0 ? couponCode : undefined,
    couponDiscount: Math.round(couponDiscount * 100) / 100,
    shippingFee: Math.round(shippingFee * 100) / 100,
    estimatedTax: Math.round(estimatedTax * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    itemCount
  };
};

// GET /api/cart
router.get('/', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = getOrCreateUserId(req);
  const couponCode = req.query.coupon as string | undefined;
  const cart = calculateCartTotals(userId, couponCode);
  return res.json({ success: true, data: cart });
});

// POST /api/cart/items
router.post('/items', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = getOrCreateUserId(req);
  const { productId, quantity = 1, selectedFlavor, selectedColor } = req.body;

  const product = db.products.find(p => p.id === productId && p.isActive);
  if (!product) {
    return res.status(404).json({
      success: false,
      error: { code: 'PRODUCT_NOT_FOUND', message: 'Product is unavailable.' }
    });
  }

  if (product.stock <= 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'OUT_OF_STOCK', message: 'This item is currently sold out.' }
    });
  }

  let existingItem = db.cartItems.find(
    item => item.userId === userId && item.productId === productId && item.selectedFlavor === selectedFlavor && item.selectedColor === selectedColor
  );

  const desiredQty = Math.max(1, parseInt(quantity, 10) || 1);

  if (existingItem) {
    const updatedQty = existingItem.quantity + desiredQty;
    if (updatedQty > product.stock) {
      existingItem.quantity = product.stock;
    } else {
      existingItem.quantity = updatedQty;
    }
  } else {
    db.cartItems.push({
      id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      productId,
      quantity: Math.min(desiredQty, product.stock),
      selectedFlavor,
      selectedColor
    });
  }

  const cart = calculateCartTotals(userId);
  return res.json({ success: true, message: 'Item added to bag', data: cart });
});

// PUT /api/cart/items/:id
router.put('/items/:id', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = getOrCreateUserId(req);
  const { id } = req.params;
  const { quantity } = req.body;

  const item = db.cartItems.find(i => i.id === id && i.userId === userId);
  if (!item) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Cart item not found.' } });
  }

  const newQty = parseInt(quantity, 10);
  if (isNaN(newQty) || newQty <= 0) {
    db.cartItems = db.cartItems.filter(i => i.id !== id);
  } else {
    const product = db.products.find(p => p.id === item.productId);
    if (product && newQty > product.stock) {
      item.quantity = product.stock;
    } else {
      item.quantity = newQty;
    }
  }

  const cart = calculateCartTotals(userId);
  return res.json({ success: true, data: cart });
});

// DELETE /api/cart/items/:id
router.delete('/items/:id', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = getOrCreateUserId(req);
  const { id } = req.params;

  db.cartItems = db.cartItems.filter(i => !(i.id === id && i.userId === userId));
  const cart = calculateCartTotals(userId);
  return res.json({ success: true, message: 'Item removed from bag', data: cart });
});

// DELETE /api/cart
router.delete('/', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = getOrCreateUserId(req);
  db.cartItems = db.cartItems.filter(i => i.userId !== userId);
  return res.json({ success: true, message: 'Shopping bag cleared', data: calculateCartTotals(userId) });
});

// POST /api/cart/apply-coupon
router.post('/apply-coupon', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = getOrCreateUserId(req);
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_COUPON', message: 'Coupon code required' } });
  }

  const coupon = db.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  if (!coupon) {
    return res.status(400).json({ success: false, error: { code: 'COUPON_NOT_FOUND', message: 'Coupon code is invalid or expired.' } });
  }

  const cart = calculateCartTotals(userId, code);
  if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      error: { code: 'MIN_SPEND_NOT_MET', message: `This coupon requires a minimum subtotal of $${coupon.minOrderAmount.toFixed(2)}.` }
    });
  }

  return res.json({
    success: true,
    message: `Coupon code '${coupon.code}' applied successfully!`,
    data: cart
  });
});

export default router;

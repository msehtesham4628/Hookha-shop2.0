import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/store.js';
import { authenticateToken, optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';
import { calculateCartTotals } from './cart.routes.js';
import { Order, OrderItem, Address } from '../../types/index.js';

const router = Router();

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  shippingAddress: z.object({
    fullName: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phone: z.string()
  }),
  billingAddress: z.object({
    fullName: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phone: z.string()
  }),
  couponCode: z.string().optional(),
  ageConfirmed: z.boolean(),
  paymentMethod: z.enum(['STRIPE', 'CREDIT_CARD', 'BANK_TRANSFER']).default('STRIPE')
});

// POST /api/checkout/validate
router.post('/validate', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user ? req.user.id : (req.headers['x-guest-id'] as string) || 'guest_default';
  const { couponCode, ageConfirmed } = req.body;

  if (db.settings.ageVerificationRequired && !ageConfirmed) {
    return res.status(400).json({
      success: false,
      error: { code: 'AGE_VERIFICATION_REQUIRED', message: `You must confirm you are at least ${db.settings.minimumPurchaseAge} years old.` }
    });
  }

  const cart = calculateCartTotals(userId, couponCode);

  if (cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMPTY_CART', message: 'Your shopping bag is empty.' }
    });
  }

  // Verify stock for all items
  for (const item of cart.items) {
    const product = db.products.find(p => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'STOCK_ERROR',
          message: `Insufficient inventory for ${product ? product.name : 'an item'}. Available: ${product ? product.stock : 0}`
        }
      });
    }
  }

  return res.json({
    success: true,
    data: {
      cart,
      storeSettings: {
        currency: db.settings.currency,
        currencySymbol: db.settings.currencySymbol,
        freeShippingThreshold: db.settings.freeShippingThreshold
      }
    }
  });
});

// POST /api/payments/create (Atomic stock reservation & payment intent creation)
router.post('/create-payment', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const parse = checkoutSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Incomplete checkout information', details: parse.error.format() }
      });
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      billingAddress,
      couponCode,
      ageConfirmed,
      paymentMethod
    } = parse.data;

    if (db.settings.ageVerificationRequired && !ageConfirmed) {
      return res.status(400).json({
        success: false,
        error: { code: 'AGE_VERIFICATION_REQUIRED', message: `Age verification required (${db.settings.minimumPurchaseAge}+).` }
      });
    }

    const userId = req.user ? req.user.id : `guest_${Date.now()}`;
    const cart = calculateCartTotals(userId, couponCode);

    if (cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'EMPTY_CART', message: 'Your shopping bag is empty.' }
      });
    }

    // Atomic stock check and deduction
    const orderItems: OrderItem[] = [];
    for (const item of cart.items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (!prod || prod.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Sorry, '${item.product.name}' only has ${prod ? prod.stock : 0} items remaining.`
          }
        });
      }
    }

    // Deduct stock and record inventory transaction
    for (const item of cart.items) {
      const prod = db.products.find(p => p.id === item.productId)!;
      const prevStock = prod.stock;
      prod.stock -= item.quantity;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        productSku: prod.sku,
        productImage: prod.images[0]?.url || '',
        price: item.unitPrice,
        quantity: item.quantity,
        flavor: item.selectedFlavor,
        color: item.selectedColor,
        subtotal: item.totalPrice
      });

      db.inventoryTransactions.push({
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        previousStock: prevStock,
        newStock: prod.stock,
        adjustment: -item.quantity,
        reason: 'ORDER_PLACED',
        actor: customerName,
        notes: `Reserved for online order checkout`,
        createdAt: new Date().toISOString()
      });
    }

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = `SLT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      items: orderItems,
      shippingAddress: { ...shippingAddress, id: `addr-${Date.now()}` },
      billingAddress: { ...billingAddress, id: `addr-b-${Date.now()}` },
      subtotal: cart.subtotal,
      discount: cart.discountTotal,
      shippingFee: cart.shippingFee,
      tax: cart.estimatedTax,
      total: cart.grandTotal,
      couponCode: cart.couponCode,
      paymentMethod,
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      timeline: [
        {
          status: 'PLACED',
          timestamp: new Date().toISOString(),
          note: 'Customer initiated checkout with verified stock reservation',
          actor: customerName
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(newOrder);

    // Update coupon usage count if used
    if (cart.couponCode) {
      const coupon = db.coupons.find(c => c.code.toUpperCase() === cart.couponCode!.toUpperCase());
      if (coupon) coupon.usageCount += 1;
    }

    // Clear cart
    db.cartItems = db.cartItems.filter(i => i.userId !== userId);

    // Generate Stripe payment intent
    const amountInCents = Math.round(cart.grandTotal * 100);
    const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntent(orderId, amountInCents);

    newOrder.paymentIntentId = paymentIntentId;

    return res.status(201).json({
      success: true,
      data: {
        order: newOrder,
        clientSecret,
        paymentIntentId,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_sultan_hookah_mock'
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'CHECKOUT_FAILED', message: err.message || 'Payment initiation failed.' }
    });
  }
});

// POST /api/payments/confirm-simulated (For testing / sandbox checkout completion)
router.post('/confirm-simulated', async (req, res) => {
  const { orderId, paymentIntentId } = req.body;
  if (!orderId) {
    return res.status(400).json({ success: false, error: { code: 'ORDER_ID_REQUIRED', message: 'Order ID is required' } });
  }

  const updatedOrder = await paymentService.processOrderPaymentSuccess(orderId, paymentIntentId || `pi_${Date.now()}`, 'Instant Sandbox Card');

  if (!updatedOrder) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
  }

  // Update user stats if registered user
  const user = db.users.find(u => u.id === updatedOrder.userId || u.email.toLowerCase() === updatedOrder.customerEmail.toLowerCase());
  if (user) {
    user.orderCount = (user.orderCount || 0) + 1;
    user.totalSpent = (user.totalSpent || 0) + updatedOrder.total;
  }

  return res.json({
    success: true,
    message: 'Payment confirmed successfully',
    data: { order: updatedOrder }
  });
});

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  const event = req.body;
  // Handle Stripe webhook events
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;
    if (orderId) {
      await paymentService.processOrderPaymentSuccess(orderId, paymentIntent.id, 'Stripe Webhook');
    }
  }
  return res.json({ received: true });
});

// GET /api/orders (Customer orders)
router.get('/', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const userOrders = db.orders
    .filter(o => o.userId === user.id || o.customerEmail.toLowerCase() === user.email.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    data: { orders: userOrders }
  });
});

// GET /api/orders/:id
router.get('/:id', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id === id || o.orderNumber === id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'ORDER_NOT_FOUND', message: 'Order could not be located.' }
    });
  }

  // Customer authorization check (unless admin)
  if (req.user && req.user.role === 'CUSTOMER' && order.userId !== req.user.id && order.customerEmail.toLowerCase() !== req.user.email.toLowerCase()) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You can only inspect your own orders.' }
    });
  }

  return res.json({
    success: true,
    data: { order }
  });
});

export default router;

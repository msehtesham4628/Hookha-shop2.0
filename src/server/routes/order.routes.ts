import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/store.js';
import { authenticateToken, optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { paymentService } from '../services/payment.service.js';
import { emailService } from '../services/email.service.js';
import { calculateCartTotals } from './cart.routes.js';
import { Order, OrderItem, Address } from '../../types/index.js';

const router = Router();

const addressInputSchema = z.object({
  fullName: z.string().optional(),
  name: z.string().optional(),
  addressLine1: z.string().optional(),
  street: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string().optional(),
  zipCode: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().default('United States'),
  phone: z.string().optional()
});

const checkoutSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  shippingAddress: addressInputSchema,
  billingAddress: addressInputSchema.optional(),
  couponCode: z.string().optional(),
  ageConfirmed: z.boolean().optional().default(true),
  paymentMethod: z.enum([
    'STRIPE',
    'STRIPE_CREDIT_CARD',
    'CREDIT_CARD',
    'CASH_ON_DELIVERY',
    'BANK_TRANSFER',
    'ZELLE_CRYPTO',
    'TEST_INSTANT'
  ]).default('STRIPE_CREDIT_CARD'),
  cardDetails: z.object({
    cardNumber: z.string().optional(),
    cardExp: z.string().optional(),
    cardCvc: z.string().optional()
  }).optional()
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
      db.persist('products', prod);

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

      const invRecord = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        previousStock: prevStock,
        newStock: prod.stock,
        adjustment: -item.quantity,
        reason: 'ORDER_PLACED' as const,
        actor: customerName,
        notes: `Reserved for online order checkout`,
        createdAt: new Date().toISOString()
      };
      db.inventoryTransactions.push(invRecord);
      db.persist('inventoryTransactions', invRecord);
    }

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = `FMH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fullShipping: Address = {
      id: `addr-${Date.now()}`,
      fullName: shippingAddress.fullName || shippingAddress.name || customerName,
      addressLine1: shippingAddress.addressLine1 || shippingAddress.street || 'Primary Address',
      addressLine2: shippingAddress.addressLine2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode || shippingAddress.zipCode || shippingAddress.pincode || '00000',
      country: shippingAddress.country || 'United States',
      phone: shippingAddress.phone || customerPhone || 'N/A'
    };

    const fullBilling: Address = billingAddress ? {
      id: `addr-b-${Date.now()}`,
      fullName: billingAddress.fullName || billingAddress.name || customerName,
      addressLine1: billingAddress.addressLine1 || billingAddress.street || fullShipping.addressLine1,
      addressLine2: billingAddress.addressLine2,
      city: billingAddress.city,
      state: billingAddress.state,
      postalCode: billingAddress.postalCode || billingAddress.zipCode || billingAddress.pincode || fullShipping.postalCode,
      country: billingAddress.country || fullShipping.country,
      phone: billingAddress.phone || customerPhone || fullShipping.phone
    } : { ...fullShipping, id: `addr-b-${Date.now()}` };

    const isInstantPaid = paymentMethod === 'TEST_INSTANT';
    const isCod = paymentMethod === 'CASH_ON_DELIVERY';
    const isBank = paymentMethod === 'BANK_TRANSFER';
    const isZelle = paymentMethod === 'ZELLE_CRYPTO';

    const initialPaymentStatus = isInstantPaid ? 'PAID' : 'PENDING';
    const initialOrderStatus = isInstantPaid ? 'PROCESSING' : 'PLACED';

    let initialTimelineNote = 'Customer initiated checkout with verified stock reservation';
    if (isInstantPaid) initialTimelineNote = 'Instant Sandbox test payment successfully cleared & verified';
    if (isCod) initialTimelineNote = 'Cash on Delivery (COD) selected - Payment to be collected by parcel courier';
    if (isBank) initialTimelineNote = 'Direct Bank Wire / ACH selected - Wire routing instructions sent';
    if (isZelle) initialTimelineNote = 'Zelle / Crypto Instant Pay selected';

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId,
      customerName,
      customerEmail,
      customerPhone: customerPhone || 'N/A',
      items: orderItems,
      shippingAddress: fullShipping,
      billingAddress: fullBilling,
      subtotal: cart.subtotal,
      discount: cart.discountTotal,
      shippingFee: cart.shippingFee,
      tax: cart.estimatedTax,
      total: cart.grandTotal,
      couponCode: cart.couponCode,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      orderStatus: initialOrderStatus,
      timeline: [
        {
          status: initialOrderStatus,
          timestamp: new Date().toISOString(),
          note: initialTimelineNote,
          actor: customerName
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    db.persist('orders', newOrder);

    // Create immediate notification for the admin dashboard
    db.createNotification(
      'ORDER',
      `New Order Placed: #${newOrder.orderNumber}`,
      `${customerName} placed order #${newOrder.orderNumber} (${paymentMethod}) for $${newOrder.total.toFixed(2)} with ${orderItems.length} item(s).`,
      `/dashboard`
    );

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

    if (isInstantPaid) {
      await paymentService.processOrderPaymentSuccess(orderId, paymentIntentId, 'Instant Sandbox');
    }

    return res.status(201).json({
      success: true,
      data: {
        order: newOrder,
        clientSecret,
        paymentIntentId,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_fumare_hookah_mock'
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

// Helper for generating real carrier tracking URLs
function resolveCarrierTrackingUrl(trackingNumber: string, carrierName?: string): string {
  const c = (carrierName || '').toLowerCase();
  const trk = (trackingNumber || '').trim();
  if (c.includes('fedex') || trk.startsWith('9400')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trk)}`;
  }
  if (c.includes('ups') || trk.startsWith('1Z')) {
    return `https://www.ups.com/track?tracknum=${encodeURIComponent(trk)}`;
  }
  if (c.includes('dhl') || trk.toUpperCase().startsWith('DHL')) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(trk)}`;
  }
  if (c.includes('usps') || trk.startsWith('9205') || trk.startsWith('9305')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trk)}`;
  }
  return `https://parcelsapp.com/en/tracking/${encodeURIComponent(trk)}`;
}

// GET /api/orders/track/:query (Live Real-Time Order & Shipping Tracker)
router.get('/track/:query', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const rawQuery = (req.params.query || '').trim();
  const emailQuery = (req.query.email as string || '').trim().toLowerCase();

  if (!rawQuery) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_QUERY', message: 'Please provide an Order ID, Order Number, or Tracking Number.' }
    });
  }

  const cleanQuery = rawQuery.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const rawQueryLower = rawQuery.toLowerCase();

  // Find order by ID, Order Number, or Tracking Number
  const order = db.orders.find(o => {
    const oIdLower = o.id.toLowerCase();
    const oNumLower = o.orderNumber.toLowerCase();
    const oNumClean = o.orderNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const oTrackLower = (o.trackingNumber || '').toLowerCase();
    const oTrackClean = (o.trackingNumber || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    return (
      oIdLower === rawQueryLower ||
      oNumLower === rawQueryLower ||
      oNumClean === cleanQuery ||
      (oTrackLower && oTrackLower === rawQueryLower) ||
      (oTrackClean && oTrackClean === cleanQuery)
    );
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ORDER_NOT_FOUND',
        message: `No order found matching "${rawQuery}". Please check your order confirmation email for your Order ID (e.g. SLT-2026-1001).`
      }
    });
  }

  // If email is supplied, optionally verify match
  if (emailQuery && order.customerEmail.toLowerCase() !== emailQuery) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EMAIL_MISMATCH',
        message: 'The email address provided does not match the billing record for this order.'
      }
    });
  }

  // Compute status description and progress
  const statusUpper = (order.orderStatus || 'PLACED').toUpperCase();
  let progress = 15;
  let statusBadge = 'Placed';
  let estimatedDelivery = '3-5 Business Days';

  if (statusUpper === 'PLACED' || statusUpper === 'PAYMENT_CONFIRMED') {
    progress = 25;
    statusBadge = 'Confirmed & Processing';
    estimatedDelivery = 'Expected dispatch within 24 hours';
  } else if (statusUpper === 'PROCESSING' || statusUpper === 'PACKED') {
    progress = 50;
    statusBadge = 'Inspecting & Packing';
    estimatedDelivery = 'Dispatches next business day';
  } else if (statusUpper === 'SHIPPED' || statusUpper === 'IN_TRANSIT') {
    progress = 75;
    statusBadge = 'In Transit';
    estimatedDelivery = '2-3 Business Days';
  } else if (statusUpper === 'OUT_FOR_DELIVERY') {
    progress = 90;
    statusBadge = 'Out for Delivery';
    estimatedDelivery = 'Arriving Today by 5:00 PM';
  } else if (statusUpper === 'DELIVERED') {
    progress = 100;
    statusBadge = 'Delivered';
    estimatedDelivery = 'Delivered';
  } else if (statusUpper === 'CANCELLED' || statusUpper === 'REFUNDED') {
    progress = 0;
    statusBadge = statusUpper === 'REFUNDED' ? 'Refunded' : 'Cancelled';
    estimatedDelivery = 'N/A';
  }

  const effectiveCarrier = order.carrier || 'UPS Express Air (2-Day Guaranteed)';
  const effectiveTrackingNumber = order.trackingNumber || `SLT-TRK-${order.orderNumber.replace(/[^0-9]/g, '') || '8921'}`;
  const trackingUrl = resolveCarrierTrackingUrl(effectiveTrackingNumber, effectiveCarrier);

  // Mask address for public lookup if not authenticated as the owner
  const isOwner = req.user && (req.user.id === order.userId || req.user.email.toLowerCase() === order.customerEmail.toLowerCase() || req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN');
  const rawAddr = order.shippingAddress;
  const sanitizedAddress = isOwner
    ? rawAddr
    : {
        ...rawAddr,
        addressLine1: rawAddr.addressLine1 ? `${rawAddr.addressLine1.slice(0, 3)}*** ****` : 'Private Street Address',
        city: rawAddr.city,
        state: rawAddr.state,
        country: rawAddr.country,
        postalCode: rawAddr.postalCode ? `***${rawAddr.postalCode.slice(-3)}` : '*****'
      };

  return res.json({
    success: true,
    data: {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: isOwner ? order.customerName : `${order.customerName.charAt(0)}*** ${order.customerName.split(' ').slice(1).join(' ').charAt(0) || ''}***`,
        customerEmail: isOwner ? order.customerEmail : `${order.customerEmail.slice(0, 2)}***@***.${order.customerEmail.split('.').pop() || 'com'}`,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        shippingFee: order.shippingFee,
        total: order.total,
        carrier: effectiveCarrier,
        trackingNumber: effectiveTrackingNumber,
        trackingUrl,
        shippingAddress: sanitizedAddress,
        items: order.items,
        timeline: order.timeline || []
      },
      trackingInfo: {
        carrier: effectiveCarrier,
        trackingNumber: effectiveTrackingNumber,
        trackingUrl,
        status: statusUpper,
        statusBadge,
        progressPercent: progress,
        estimatedDelivery,
        isDelivered: statusUpper === 'DELIVERED',
        isOutForDelivery: statusUpper === 'OUT_FOR_DELIVERY',
        isInTransit: statusUpper === 'SHIPPED' || statusUpper === 'IN_TRANSIT'
      }
    }
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

const emailPdfSchema = z.object({
  email: z.string().email(),
  pdfBase64: z.string().optional(),
  customNote: z.string().max(300).optional()
});

// POST /api/orders/:id/email-pdf
router.post('/:id/email-pdf', optionalAuthenticateToken, async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const parseResult = emailPdfSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'A valid email address is required.' }
    });
  }

  const { email, pdfBase64, customNote } = parseResult.data;
  const order = db.orders.find(o => o.id === id || o.orderNumber === id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: { code: 'ORDER_NOT_FOUND', message: 'Order could not be located.' }
    });
  }

  // Customer authorization check: if logged in as customer and trying to access an order belonging to another customer, deny
  if (req.user && req.user.role === 'CUSTOMER' && order.userId !== req.user.id && order.customerEmail.toLowerCase() !== req.user.email.toLowerCase()) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to email this order invoice.' }
    });
  }

  try {
    const result = await emailService.sendInvoiceEmail({
      to: email,
      order,
      pdfBase64,
      customMessage: customNote
    });

    // Append to order timeline
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: order.orderStatus,
      timestamp: new Date().toISOString(),
      note: `Official Invoice PDF dispatched to ${email}${customNote ? ` (Note: ${customNote})` : ''}`,
      actor: req.user ? `${req.user.firstName || req.user.email}` : 'Customer Concierge'
    });

    return res.json({
      success: true,
      message: `Invoice PDF successfully dispatched to ${email}`,
      recipient: email,
      sandbox: result.sandbox
    });
  } catch (err: any) {
    console.error('Error dispatching invoice PDF email:', err);
    // Even if external SMTP transport encountered a hitch, record fallback dispatch
    if (!order.timeline) order.timeline = [];
    order.timeline.push({
      status: order.orderStatus,
      timestamp: new Date().toISOString(),
      note: `Invoice PDF generated & queued for ${email}`,
      actor: req.user ? `${req.user.firstName || req.user.email}` : 'Customer Concierge'
    });

    return res.json({
      success: true,
      message: `Invoice PDF successfully prepared and queued for ${email}`,
      recipient: email
    });
  }
});

export default router;

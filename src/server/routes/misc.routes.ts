import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/store.js';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { generalRateLimiter } from '../middleware/rateLimit.middleware.js';
import { Review, WholesaleApplication } from '../../types/index.js';

const router = Router();

// GET /api/categories
router.get('/categories', (req, res) => {
  const activeCategories = db.categories
    .filter(c => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(cat => ({
      ...cat,
      productCount: db.products.filter(p => p.categorySlug === cat.slug && p.isActive).length
    }));

  return res.json({ success: true, data: activeCategories });
});

// GET /api/categories/:slug
router.get('/categories/:slug', (req, res) => {
  const { slug } = req.params;
  const category = db.categories.find(c => c.slug === slug || c.id === slug);
  if (!category) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
  }

  const products = db.products.filter(p => p.categorySlug === category.slug && p.isActive);
  return res.json({ success: true, data: { category, products } });
});

// GET /api/brands
router.get('/brands', (req, res) => {
  const activeBrands = db.brands
    .filter(b => b.isActive)
    .map(brand => ({
      ...brand,
      productCount: db.products.filter(p => p.brandSlug === brand.slug && p.isActive).length
    }));

  return res.json({ success: true, data: activeBrands });
});

// GET /api/brands/:slug
router.get('/brands/:slug', (req, res) => {
  const { slug } = req.params;
  const brand = db.brands.find(b => b.slug === slug || b.id === slug);
  if (!brand) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brand not found' } });
  }

  const products = db.products.filter(p => p.brandSlug === brand.slug && p.isActive);
  return res.json({ success: true, data: { brand, products } });
});

// GET /api/products/:id/reviews
router.get('/products/:id/reviews', (req, res) => {
  const { id } = req.params;
  const reviews = db.reviews
    .filter(r => (r.productId === id || r.productId === db.products.find(p => p.slug === id)?.id) && r.status === 'APPROVED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({ success: true, data: reviews });
});

// POST /api/products/:id/reviews
router.post('/products/:id/reviews', optionalAuthenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { rating, title, comment, userName, userEmail } = req.body;

  const product = db.products.find(p => p.id === id || p.slug === id);
  if (!product) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
  }

  const numRating = parseInt(rating, 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_RATING', message: 'Rating must be between 1 and 5' } });
  }

  if (!title || !comment) {
    return res.status(400).json({ success: false, error: { code: 'REQUIRED_FIELDS', message: 'Title and comment are required' } });
  }

  const userId = req.user ? req.user.id : `guest_reviewer_${Date.now()}`;
  const reviewerName = req.user ? `${req.user.firstName} ${req.user.lastName}`.trim() : (userName || 'Hookah Connoisseur');
  const reviewerEmail = req.user ? req.user.email : userEmail;

  // Calculate verified purchase status by checking customer paid orders
  const isVerifiedPurchase = db.orders.some(
    o => o.paymentStatus === 'PAID' &&
         (o.userId === userId || (reviewerEmail && o.customerEmail.toLowerCase() === reviewerEmail.toLowerCase())) &&
         o.items.some(item => item.productId === product.id)
  );

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId: product.id,
    productName: product.name,
    userId,
    userName: reviewerName,
    rating: numRating,
    title,
    comment,
    isVerifiedPurchase,
    status: 'APPROVED', // Auto-approved in demo mode
    createdAt: new Date().toISOString()
  };

  db.reviews.push(newReview);

  // Recalculate product aggregate rating
  const approvedReviews = db.reviews.filter(r => r.productId === product.id && r.status === 'APPROVED');
  const avg = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
  product.rating = Math.round(avg * 100) / 100;
  product.reviewCount = approvedReviews.length;

  db.createNotification('REVIEW', 'New Product Review', `${reviewerName} reviewed ${product.name} (${numRating}★)`, `/admin/reviews`);

  return res.status(201).json({
    success: true,
    message: 'Thank you! Your verified review has been submitted.',
    data: newReview
  });
});

// POST /api/wholesale/apply
router.post('/wholesale/apply', generalRateLimiter, (req, res) => {
  const { companyName, contactName, email, phone, businessType, taxId, website, estimatedMonthlyVolume, notes } = req.body;

  if (!companyName || !contactName || !email || !phone || !estimatedMonthlyVolume) {
    return res.status(400).json({
      success: false,
      error: { code: 'REQUIRED_FIELDS', message: 'Please fill in all mandatory business fields.' }
    });
  }

  const app: WholesaleApplication = {
    id: `whs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    companyName,
    contactName,
    email,
    phone,
    businessType: businessType || 'LOUNGE',
    taxId,
    website,
    estimatedMonthlyVolume,
    notes,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.wholesaleApplications.push(app);

  db.createNotification(
    'WHOLESALE',
    'New Wholesale B2B Application',
    `${companyName} (${businessType}) applied for wholesale pricing. Volume: ${estimatedMonthlyVolume}`,
    `/admin/wholesale`
  );

  return res.status(201).json({
    success: true,
    message: 'Your wholesale account application has been received. Our B2B concierge team will review your business credentials within 24 business hours.',
    data: app
  });
});

// POST /api/newsletter/subscribe
router.post('/newsletter/subscribe', generalRateLimiter, (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_EMAIL', message: 'Valid email required' } });
  }

  const normalized = email.toLowerCase().trim();
  const exists = db.newsletterSubscribers.some(s => s.email === normalized);

  if (!exists) {
    db.newsletterSubscribers.push({ email: normalized, createdAt: new Date().toISOString() });
  }

  return res.json({
    success: true,
    message: 'You have been added to the Sultan Private Reserve newsletter.'
  });
});

// POST /api/newsletter/unsubscribe
router.post('/newsletter/unsubscribe', (req, res) => {
  const { email } = req.body;
  if (email) {
    db.newsletterSubscribers = db.newsletterSubscribers.filter(s => s.email !== email.toLowerCase().trim());
  }
  return res.json({ success: true, message: 'Unsubscribed successfully' });
});

// POST /api/contact
router.post('/contact', generalRateLimiter, (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: { code: 'REQUIRED_FIELDS', message: 'Name, email, and message are required' } });
  }

  const msg = {
    id: `msg-${Date.now()}`,
    name,
    email,
    phone,
    subject: subject || 'General Inquiry',
    message,
    createdAt: new Date().toISOString()
  };

  db.contactMessages.push(msg);
  db.createNotification('SYSTEM', 'New Contact Message', `Message from ${name} regarding "${subject || 'General Inquiry'}"`);

  return res.json({
    success: true,
    message: 'Thank you. Your message has been received by our concierge desk.'
  });
});

// GET /api/settings
router.get('/settings', (req, res) => {
  return res.json({
    success: true,
    data: {
      storeName: db.settings.storeName,
      supportEmail: db.settings.supportEmail,
      supportPhone: db.settings.supportPhone,
      currency: db.settings.currency,
      currencySymbol: db.settings.currencySymbol,
      freeShippingThreshold: db.settings.freeShippingThreshold,
      standardShippingFee: db.settings.standardShippingFee,
      ageVerificationRequired: db.settings.ageVerificationRequired,
      minimumPurchaseAge: db.settings.minimumPurchaseAge,
      bannerAnnouncement: db.settings.bannerAnnouncement
    }
  });
});

export default router;

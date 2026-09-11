import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/store.js';
import { optionalAuthenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { generalRateLimiter } from '../middleware/rateLimit.middleware.js';
import { Review, WholesaleApplication, Category } from '../../types/index.js';

const router = Router();

const normalizeCatalogSlug = (value: unknown) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const CATEGORY_ALIASES: Record<string, string[]> = {
  tobacco: ['tobacco', 'hookah-tobacco', 'shisha-tobacco', 'shisha'],
  hookahs: ['hookah', 'hookahs', 'water-pipe', 'water-pipes'],
  bowls: ['bowl', 'bowls', 'hookah-bowl', 'hookah-bowls'],
  bases: ['base', 'bases', 'hookah-base', 'hookah-bases', 'vase', 'vases'],
  coal: ['coal', 'coals', 'charcoal', 'charcoals', 'hookah-coal', 'hookah-charcoal'],
  accessories: ['accessory', 'accessories', 'hookah-accessories'],
  'e-hookah': ['e-hookah', 'e-hookah-electronic', 'electronic-hookah', 'electronic-hookahs'],
  vapes: ['vape', 'vapes', 'vape-pod', 'vape-pods', 'pod-systems', 'disposable-vapes']
};

const productCategoryValues = (product: any): string[] => Array.from(new Set([
  product?.categorySlug,
  product?.category,
  (product as any)?.categoryName,
  (product as any)?.productCategory
].filter(Boolean).map(normalizeCatalogSlug)));

const productMatchesCategory = (product: any, category: Category) => {
  if (!product?.isActive) return false;
  const requested = new Set<string>([
    normalizeCatalogSlug(category.slug),
    normalizeCatalogSlug(category.name)
  ].filter(Boolean));
  const canonical = normalizeCatalogSlug(category.slug || category.name);
  for (const alias of CATEGORY_ALIASES[canonical] || []) requested.add(normalizeCatalogSlug(alias));
  const values = productCategoryValues(product);
  return values.some(value => requested.has(value));
};

const getStorefrontCategories = (): Category[] => {
  const categories = [...db.categories];
  const existing = new Set(categories.map(c => normalizeCatalogSlug(c.slug)));
  const discovered = new Map<string, string>();
  for (const product of db.products) {
    if (!product?.isActive) continue;
    const rawName = String(product.category || (product as any).categoryName || '').trim();
    const rawSlug = String(product.categorySlug || rawName).trim();
    const slug = normalizeCatalogSlug(rawSlug);
    if (!slug || discovered.has(slug)) continue;
    discovered.set(slug, rawName || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  }
  for (const [slug, name] of discovered) {
    if (existing.has(slug)) continue;
    categories.push({
      id: `cat-${slug}`,
      name,
      slug,
      description: `${name} from the Fumare Hookah catalog.`,
      subcategories: [],
      productCount: 0,
      isActive: true,
      sortOrder: 100 + categories.length
    });
    existing.add(slug);
  }
  return categories;
};

// GET /api/categories
router.get('/categories', (req, res) => {
  const activeCategories = getStorefrontCategories()
    .filter(c => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(cat => ({
      ...cat,
      productCount: db.products.filter(p => p.isActive && productMatchesCategory(p, cat)).length
    }));

  return res.json({ success: true, data: activeCategories });
});

// GET /api/categories/:slug
router.get('/categories/:slug', (req, res) => {
  const { slug } = req.params;
  const normalizedSlug = normalizeCatalogSlug(slug);
  const category = getStorefrontCategories().find(c =>
    normalizeCatalogSlug(c.slug) === normalizedSlug ||
    normalizeCatalogSlug(c.id) === normalizedSlug ||
    normalizeCatalogSlug(c.name) === normalizedSlug
  );
  if (!category) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
  }

  const products = db.products.filter(p => p.isActive && productMatchesCategory(p, category));
  return res.json({
    success: true,
    data: {
      category: { ...category, productCount: products.length },
      products,
      pagination: { total: products.length, page: 1, limit: products.length, totalPages: 1 }
    }
  });
});

// GET /api/brands
router.get('/brands', (req, res) => {
  const activeBrands = db.brands
    .filter(b => b.isActive && !db.isBrandDeleted(b.id) && !db.isBrandDeleted(b.slug) && !db.isBrandDeleted(b.name))
    .map(brand => ({
      ...brand,
      productCount: db.products.filter(p => p.brandSlug === brand.slug && p.isActive && !db.isProductDeleted(p.id)).length
    }));

  return res.json({ success: true, data: activeBrands });
});

// GET /api/brands/:slug
router.get('/brands/:slug', (req, res) => {
  const { slug } = req.params;
  const normalizedSlug = normalizeCatalogSlug(slug);
  let brand = db.brands.find(b =>
    normalizeCatalogSlug(b.slug) === normalizedSlug ||
    normalizeCatalogSlug(b.id) === normalizedSlug ||
    normalizeCatalogSlug(b.name) === normalizedSlug
  );

  // Fallback: If brand not explicitly registered in store, locate from catalog products
  if (!brand) {
    const sample = db.products.find(p =>
      p.isActive &&
      (normalizeCatalogSlug(p.brandSlug) === normalizedSlug || normalizeCatalogSlug(p.brand) === normalizedSlug)
    );
    if (sample) {
      const bName = sample.brand || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      brand = {
        id: `brand-${normalizedSlug}`,
        name: bName,
        slug: normalizedSlug,
        origin: 'Global Artisan',
        description: `Certified authentic ${bName} merchandise, flavors, and luxury hookah accessories.`,
        logoUrl: sample.images[0]?.url || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400',
        productCount: 0,
        isActive: true
      };
    }
  }

  if (!brand) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brand not found' } });
  }

  const brandClean = brand.name ? brand.name.toLowerCase() : '';
  const products = db.products.filter(p =>
    p.isActive &&
    (
      normalizeCatalogSlug(p.brandSlug) === normalizedSlug ||
      normalizeCatalogSlug(p.brand) === normalizedSlug ||
      (brandClean && p.brand.toLowerCase() === brandClean)
    )
  );
  return res.json({
    success: true,
    data: {
      brand: { ...brand, productCount: products.length },
      products
    }
  });
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
  db.persist('reviews', newReview);

  // Recalculate product aggregate rating
  const approvedReviews = db.reviews.filter(r => r.productId === product.id && r.status === 'APPROVED');
  const avg = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
  product.rating = Math.round(avg * 100) / 100;
  product.reviewCount = approvedReviews.length;
  db.persist('products', product);

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

  const application: WholesaleApplication = {
    id: `wholesale-${Date.now()}`,
    companyName,
    contactName,
    email,
    phone,
    businessType: businessType || 'OTHER',
    taxId,
    website,
    estimatedMonthlyVolume: String(estimatedMonthlyVolume ?? ''),
    notes,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.wholesaleApplications.push(application);
  db.persist('wholesaleApplications', application);

  db.createNotification(
    'WHOLESALE',
    'New Wholesale B2B Application',
    `${companyName} (${businessType || 'OTHER'}) applied for wholesale pricing. Volume: ${estimatedMonthlyVolume}`,
    `/admin/wholesale`
  );

  return res.status(201).json({
    success: true,
    message: 'Your wholesale account application has been received. Our B2B concierge team will review your business credentials within 24 business hours.',
    data: application
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
    const subscriber = { id: normalized, email: normalized, createdAt: new Date().toISOString() };
    db.newsletterSubscribers.push(subscriber);
    db.persist('newsletterSubscribers', subscriber);
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
    const normalized = email.toLowerCase().trim();
    db.newsletterSubscribers = db.newsletterSubscribers.filter(s => s.email !== normalized);
    db.deletePersisted('newsletterSubscribers', { email: normalized });
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
  db.persist('contactMessages', msg);
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
      ...db.settings
    }
  });
});

export default router;

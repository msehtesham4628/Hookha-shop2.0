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
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const productMatchesCategory = (product: any, category: Category) => {
  const categorySlug = normalizeCatalogSlug(category.slug);
  return normalizeCatalogSlug(product.categorySlug) === categorySlug ||
    normalizeCatalogSlug(product.category) === categorySlug ||
    normalizeCatalogSlug(product.category) === normalizeCatalogSlug(category.name);
};

const getStorefrontCategories = (): Category[] => {
  const categories = [...db.categories];
  const existingSlugs = new Set(categories.map(c => normalizeCatalogSlug(c.slug)));
  const productCategories = new Map<string, string>();

  for (const product of db.products) {
    if (!product.isActive) continue;
    const name = String(product.category || '').trim();
    const slug = normalizeCatalogSlug(product.categorySlug || name);
    if (slug && name && !productCategories.has(slug)) productCategories.set(slug, name);
  }

  for (const [slug, name] of productCategories) {
    if (existingSlugs.has(slug)) continue;
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
    existingSlugs.add(slug);
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

  const application: WholesaleApplication = {
    id: `wholesale-${Date.now()}`,
    companyName,
    contactName,
    email,
    phone,
    businessType: businessType || 'OTHER',
    taxId,
    website,
    estimatedMonthlyVolume: Number(estimatedMonthlyVolume),
    notes,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.wholesaleApplications.push(application);
  return res.status(201).json({ success: true, data: application });
});

export default router;

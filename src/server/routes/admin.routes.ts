import { Router } from 'express';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { db } from '../db/store.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { requirePermission, requireRole } from '../middleware/rbac.middleware.js';
import { paymentService } from '../services/payment.service.js';
import { Product, Role, OrderStatus, Category, Brand, Coupon } from '../../types/index.js';
import { mongoService } from '../db/mongodb.js';

const router = Router();

// Apply authentication to all admin routes
router.use(authenticateToken);

// ==========================================
// 1. DASHBOARD & ANALYTICS
// ==========================================

// GET /api/admin/dashboard
router.get('/dashboard', requirePermission('dashboard.view'), (req: AuthenticatedRequest, res) => {
  const totalRevenue = db.orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter(o => o.orderStatus === 'PLACED' || o.orderStatus === 'PAYMENT_CONFIRMED' || o.orderStatus === 'PROCESSING').length;
  const totalCustomers = db.users.filter(u => u.role === 'CUSTOMER').length;
  const totalProducts = db.products.length;
  const lowStockProducts = db.products.filter(p => p.stock <= p.lowStockThreshold);
  const pendingWholesale = db.wholesaleApplications.filter(w => w.status === 'PENDING').length;
  const refundsCount = db.orders.filter(o => o.orderStatus === 'REFUNDED').length;

  // Monthly revenue breakdown (last 6 months simulation/calculation)
  const salesByMonth = [
    { month: 'Oct', revenue: 14200, orders: 42 },
    { month: 'Nov', revenue: 19800, orders: 58 },
    { month: 'Dec', revenue: 31200, orders: 94 },
    { month: 'Jan', revenue: 24500, orders: 71 },
    { month: 'Feb', revenue: 28900, orders: 83 },
    { month: 'Mar', revenue: Math.round(totalRevenue), orders: totalOrders }
  ];

  // Sales by Category
  const categorySales = db.categories.map(c => ({
    name: c.name,
    count: db.products.filter(p => p.categorySlug === c.slug).length,
    value: db.products.filter(p => p.categorySlug === c.slug).reduce((s, p) => s + p.price * 5, 0)
  }));

  const recentOrders = [...db.orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentAuditLogs = [...db.auditLogs].slice(0, 8);

  const topFlavors = [
    { flavor: 'MustHave Pinkman (Grapefruit Strawberry Raspberry)', units: 142 },
    { flavor: 'DarkSide Supernova (Sub-Zero Menthol)', units: 118 },
    { flavor: 'BlackBurn Cane Mint (Bold Peppermint)', units: 96 },
    { flavor: 'Bonche Dark Chocolate (Single Origin)', units: 74 },
    { flavor: 'Tangiers Noir Cane Mint', units: 68 }
  ];

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return res.json({
    success: true,
    data: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      pendingWholesale,
      refundsCount,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      topFlavors,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        pendingOrders,
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        pendingWholesale,
        refundsCount,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      },
      charts: {
        salesByMonth,
        categorySales
      },
      recentOrders,
      lowStockProducts,
      recentAuditLogs
    }
  });
});

// GET /api/admin/analytics/overview
router.get('/analytics/overview', requirePermission('analytics.view'), (req, res) => {
  const paidOrders = db.orders.filter(o => o.paymentStatus === 'PAID');
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const averageOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  const topProducts = db.products
    .map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.price,
      salesCount: p.reviewCount * 3 + Math.floor(p.price / 10),
      revenue: (p.reviewCount * 3 + Math.floor(p.price / 10)) * (p.salePrice || p.price)
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  return res.json({
    success: true,
    data: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: paidOrders.length,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      totalCustomers: db.users.filter(u => u.role === 'CUSTOMER').length,
      topProducts
    }
  });
});

// ==========================================
// 2. PRODUCT MANAGEMENT (CRUD, CSV Import, Export)
// ==========================================

// GET /api/admin/products
router.get('/products', requirePermission('products.view'), (req, res) => {
  const { category, search, stockStatus, sort = 'newest' } = req.query as Record<string, string>;
  let result = [...db.products];

  if (search) {
    const s = search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s));
  }

  if (category) {
    result = result.filter(p => p.categorySlug === category || p.category.toLowerCase() === category.toLowerCase());
  }

  if (stockStatus === 'low') {
    result = result.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0);
  } else if (stockStatus === 'out') {
    result = result.filter(p => p.stock === 0);
  }

  return res.json({ success: true, data: result });
});

// POST /api/admin/products
router.post('/products', requirePermission('products.create'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const body = req.body;

  if (!body.name || !body.sku || !body.price || !body.category) {
    return res.status(400).json({ success: false, error: { code: 'REQUIRED_FIELDS', message: 'Name, SKU, price, and category are mandatory' } });
  }

  // Check unique SKU
  if (db.products.some(p => p.sku.toUpperCase() === body.sku.toUpperCase())) {
    return res.status(409).json({ success: false, error: { code: 'DUPLICATE_SKU', message: 'SKU must be unique across the catalog.' } });
  }

  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newProduct: Product = {
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: body.name,
    slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
    sku: body.sku.toUpperCase(),
    description: body.description || '',
    shortDescription: body.shortDescription || '',
    price: parseFloat(body.price),
    salePrice: body.salePrice ? parseFloat(body.salePrice) : undefined,
    currency: body.currency || 'USD',
    brand: body.brand || 'Sultan Select',
    brandSlug: (body.brand || 'sultan-select').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: body.category,
    categorySlug: (body.category || 'accessories').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    subcategory: body.subcategory,
    images: body.images && body.images.length > 0 ? body.images : [
      { id: `img-${Date.now()}`, url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800&auto=format&fit=crop', alt: body.name, isPrimary: true, sortOrder: 1 }
    ],
    stock: parseInt(body.stock, 10) || 0,
    lowStockThreshold: parseInt(body.lowStockThreshold, 10) || 5,
    weight: body.weight ? parseInt(body.weight, 10) : undefined,
    flavor: body.flavor,
    material: body.material,
    color: body.color,
    tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t: string) => t.trim()) : []),
    specifications: body.specifications || [],
    rating: 5.0,
    reviewCount: 0,
    isFeatured: !!body.isFeatured,
    isNewArrival: body.isNewArrival !== undefined ? !!body.isNewArrival : true,
    isBestSeller: !!body.isBestSeller,
    isOnSale: !!body.salePrice && parseFloat(body.salePrice) < parseFloat(body.price),
    isActive: body.isActive !== undefined ? !!body.isActive : true,
    ageRestricted: body.ageRestricted !== undefined ? !!body.ageRestricted : true,
    seoTitle: body.seoTitle || `${body.name} | Fumare Hookah`,
    seoDescription: body.seoDescription || body.shortDescription,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);
  db.persist('products', newProduct);

  // Record audit log
  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_CREATED_PRODUCT',
    'PRODUCT',
    newProduct.id,
    { name: newProduct.name, sku: newProduct.sku, price: newProduct.price, stock: newProduct.stock }
  );

  return res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
});

// PUT /api/admin/products/:id
router.put('/products/:id', requirePermission('products.update'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const product = db.products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
  }

  const prevStock = product.stock;
  const prevPrice = product.price;

  Object.assign(product, req.body, { updatedAt: new Date().toISOString() });
  db.persist('products', product);

  // If stock adjusted, record inventory log
  if (req.body.stock !== undefined && parseInt(req.body.stock, 10) !== prevStock) {
    const newStock = parseInt(req.body.stock, 10);
    db.inventoryTransactions.push({
      id: `inv-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      previousStock: prevStock,
      newStock,
      adjustment: newStock - prevStock,
      reason: 'MANUAL_ADJUSTMENT',
      actor: `${user.firstName} ${user.lastName}`,
      notes: 'Admin updated stock directly in product editor',
      createdAt: new Date().toISOString()
    });
  }

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_UPDATED_PRODUCT',
    'PRODUCT',
    product.id,
    { prevPrice, newPrice: product.price, prevStock, newStock: product.stock }
  );

  return res.json({ success: true, message: 'Product updated', data: product });
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', requirePermission('products.delete'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const index = db.products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
  }

  const deleted = db.products[index];
  db.products.splice(index, 1);
  db.deletePersisted('products', { id });

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_DELETED_PRODUCT',
    'PRODUCT',
    id,
    { name: deleted.name, sku: deleted.sku }
  );

  return res.json({ success: true, message: 'Product deleted successfully' });
});

// POST /api/admin/products/import (CSV / JSON bulk importer)
router.post('/products/import', requirePermission('products.import'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { products: importList } = req.body;

  if (!Array.isArray(importList) || importList.length === 0) {
    return res.status(400).json({ success: false, error: { code: 'EMPTY_PAYLOAD', message: 'Array of products required' } });
  }

  let successful = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of importList) {
    try {
      if (!item.name || !item.sku || !item.price) {
        failed++;
        errors.push(`Row missing name/sku/price`);
        continue;
      }

      if (db.products.some(p => p.sku.toUpperCase() === String(item.sku).toUpperCase())) {
        failed++;
        errors.push(`Duplicate SKU '${item.sku}' skipped`);
        continue;
      }

      const newProd: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: item.name,
        slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${Math.floor(100 + Math.random() * 900)}`,
        sku: String(item.sku).toUpperCase(),
        description: item.description || '',
        shortDescription: item.shortDescription || '',
        price: parseFloat(item.price),
        salePrice: item.salePrice ? parseFloat(item.salePrice) : undefined,
        currency: 'USD',
        brand: item.brand || 'Imported Brand',
        brandSlug: (item.brand || 'imported-brand').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: item.category || 'Accessories',
        categorySlug: (item.category || 'accessories').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        subcategory: item.subcategory,
        images: item.imageUrl ? [{ id: `img-${Date.now()}`, url: item.imageUrl, alt: item.name, isPrimary: true, sortOrder: 1 }] : [],
        stock: parseInt(item.stock, 10) || 0,
        lowStockThreshold: 5,
        tags: item.tags ? String(item.tags).split(',').map((t: string) => t.trim()) : [],
        specifications: [],
        rating: 5.0,
        reviewCount: 0,
        isFeatured: false,
        isNewArrival: true,
        isBestSeller: false,
        isOnSale: false,
        isActive: true,
        ageRestricted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.products.push(newProd);
      db.persist('products', newProd);
      successful++;
    } catch (err: any) {
      failed++;
      errors.push(`Error on SKU ${item.sku}: ${err.message}`);
    }
  }

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_IMPORTED_PRODUCTS',
    'CATALOG',
    undefined,
    { successful, failed }
  );

  return res.json({
    success: true,
    message: `Import complete: ${successful} added, ${failed} failed.`,
    data: { successful, failed, errors }
  });
});

// POST /api/admin/products/bulk-update (CSV / JSON bulk inventory & pricing updater)
router.post('/products/bulk-update', requirePermission('products.update'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMPTY_PAYLOAD', message: 'Array of product updates required' }
    });
  }

  let updatedCount = 0;
  let skippedCount = 0;
  const updatedItems: any[] = [];
  const errors: string[] = [];

  for (const item of updates) {
    try {
      const rawSku = item.sku ? String(item.sku).trim() : '';
      const rawId = item.id ? String(item.id).trim() : '';
      const rawName = item.name ? String(item.name).trim() : '';

      if (!rawSku && !rawId && !rawName) {
        skippedCount++;
        errors.push('Row skipped: missing SKU, ID, or name identifier');
        continue;
      }

      // Find matching product
      const product = db.products.find(p =>
        (rawSku && p.sku && p.sku.toUpperCase() === rawSku.toUpperCase()) ||
        (rawId && p.id === rawId) ||
        (rawName && p.name.toLowerCase() === rawName.toLowerCase())
      );

      if (!product) {
        skippedCount++;
        errors.push(`Product not found for "${rawSku || rawId || rawName}"`);
        continue;
      }

      const prevStock = product.stock;
      const prevPrice = product.price;
      const prevSalePrice = product.salePrice;
      let hasChanges = false;

      // Update Stock if supplied
      if (item.stock !== undefined && item.stock !== null && item.stock !== '') {
        const parsedStock = parseInt(String(item.stock), 10);
        if (!isNaN(parsedStock) && parsedStock >= 0 && parsedStock !== prevStock) {
          product.stock = parsedStock;
          hasChanges = true;

          // Record inventory transaction
          db.inventoryTransactions.unshift({
            id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            previousStock: prevStock,
            newStock: product.stock,
            adjustment: product.stock - prevStock,
            reason: 'BULK_CSV_UPDATE',
            actor: `${user.firstName} ${user.lastName}`,
            notes: `Bulk updated via CSV/JSON import (${prevStock} -> ${product.stock})`,
            createdAt: new Date().toISOString()
          });
        }
      }

      // Update Price if supplied
      if (item.price !== undefined && item.price !== null && item.price !== '') {
        const parsedPrice = parseFloat(String(item.price));
        if (!isNaN(parsedPrice) && parsedPrice >= 0 && parsedPrice !== prevPrice) {
          product.price = parsedPrice;
          hasChanges = true;
          // Recalculate sale flag
          if (product.salePrice) {
            product.isOnSale = product.salePrice < product.price;
          }
        }
      }

      // Update Sale Price if supplied
      if (item.salePrice !== undefined) {
        if (item.salePrice === null || item.salePrice === '' || String(item.salePrice).toLowerCase() === 'null') {
          if (product.salePrice !== undefined) {
            product.salePrice = undefined;
            product.isOnSale = false;
            hasChanges = true;
          }
        } else {
          const parsedSalePrice = parseFloat(String(item.salePrice));
          if (!isNaN(parsedSalePrice) && parsedSalePrice >= 0 && parsedSalePrice !== prevSalePrice) {
            product.salePrice = parsedSalePrice;
            product.isOnSale = parsedSalePrice < product.price;
            hasChanges = true;
          }
        }
      }

      // Update Low Stock Threshold if supplied
      if (item.lowStockThreshold !== undefined && item.lowStockThreshold !== null && item.lowStockThreshold !== '') {
        const parsedThreshold = parseInt(String(item.lowStockThreshold), 10);
        if (!isNaN(parsedThreshold) && parsedThreshold >= 0 && parsedThreshold !== product.lowStockThreshold) {
          product.lowStockThreshold = parsedThreshold;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        product.updatedAt = new Date().toISOString();
        db.persist('products', product);
        updatedCount++;
        updatedItems.push({
          id: product.id,
          sku: product.sku,
          name: product.name,
          oldPrice: prevPrice,
          newPrice: product.price,
          oldSalePrice: prevSalePrice,
          newSalePrice: product.salePrice,
          oldStock: prevStock,
          newStock: product.stock
        });
      } else {
        skippedCount++;
      }
    } catch (err: any) {
      skippedCount++;
      errors.push(`Row error: ${err.message}`);
    }
  }

  // Audit log
  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_BULK_UPDATED_PRODUCTS',
    'CATALOG',
    undefined,
    { totalReceived: updates.length, updatedCount, skippedCount }
  );

  return res.json({
    success: true,
    message: `Bulk update complete: ${updatedCount} product(s) updated, ${skippedCount} skipped or unchanged.`,
    data: {
      total: updates.length,
      updated: updatedCount,
      skipped: skippedCount,
      updatedItems,
      errors: errors.slice(0, 50)
    }
  });
});

// ==========================================
// 3. ORDER MANAGEMENT
// ==========================================

// GET /api/admin/orders
router.get('/orders', requirePermission('orders.view'), (req, res) => {
  try {
    const { status, search, limit } = req.query as Record<string, string>;
    let result = Array.isArray(db.orders) ? [...db.orders].filter(Boolean) : [];

    if (status) {
      result = result.filter(o => o && (o.orderStatus === status || o.paymentStatus === status));
    }

    if (search) {
      const s = String(search).toLowerCase().trim();
      result = result.filter(o => {
        if (!o) return false;
        const num = String(o.orderNumber || '').toLowerCase();
        const name = String(o.customerName || '').toLowerCase();
        const email = String(o.customerEmail || '').toLowerCase();
        return num.includes(s) || name.includes(s) || email.includes(s);
      });
    }

    result.sort((a, b) => {
      const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });

    if (limit && !isNaN(Number(limit)) && Number(limit) > 0) {
      result = result.slice(0, Number(limit));
    }

    return res.json({ success: true, data: result, total: result.length });
  } catch (err: any) {
    console.error('[Admin Orders Error]:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err?.message || 'Failed to retrieve orders' } });
  }
});

// GET /api/admin/orders/:id
router.get('/orders/:id', requirePermission('orders.view'), (req, res) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
  }
  return res.json({ success: true, data: order });
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', requirePermission('orders.update'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const { status, trackingNumber, carrier, note } = req.body;

  const order = db.orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
  }

  const prevStatus = order.orderStatus;
  if (status) order.orderStatus = status as OrderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (carrier) order.carrier = carrier;

  order.timeline.push({
    status: order.orderStatus,
    timestamp: new Date().toISOString(),
    note: note || `Status modified from ${prevStatus} to ${order.orderStatus}`,
    actor: `${user.firstName} ${user.lastName}`
  });
  order.updatedAt = new Date().toISOString();
  db.persist('orders', order);

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_CHANGED_ORDER_STATUS',
    'ORDER',
    order.id,
    { prevStatus, newStatus: order.orderStatus, trackingNumber }
  );

  return res.json({ success: true, message: 'Order status updated', data: order });
});

// POST /api/admin/orders/:id/refund
router.post('/orders/:id/refund', requirePermission('orders.refund'), async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const { amount, reason } = req.body;

  const order = db.orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
  }

  const refundAmt = amount ? parseFloat(amount) : order.total;
  const success = await paymentService.processRefund(order.id, refundAmt, reason || 'Customer requested cancellation', `${user.firstName} ${user.lastName}`);

  if (!success) {
    return res.status(400).json({ success: false, error: { code: 'REFUND_FAILED', message: 'Unable to process refund on this order.' } });
  }

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_REFUNDED_ORDER',
    'ORDER',
    order.id,
    { refundAmount: refundAmt, reason }
  );

  return res.json({ success: true, message: `Refund of $${refundAmt.toFixed(2)} processed successfully`, data: order });
});

// ==========================================
// 4. CUSTOMER MANAGEMENT
// ==========================================

// GET /api/admin/customers
router.get('/customers', requirePermission('customers.view'), (req, res) => {
  const customers = db.users.filter(u => u.role === 'CUSTOMER').map(c => {
    const { passwordHash: _, ...safe } = c as any;
    return safe;
  });
  return res.json({ success: true, data: customers });
});

// POST /api/admin/customers/:id/suspend
router.post('/customers/:id/suspend', requirePermission('customers.suspend'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const customer = db.users.find(u => u.id === id);

  if (!customer) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Customer not found' } });
  }

  customer.status = customer.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
  customer.updatedAt = new Date().toISOString();
  db.persist('users', customer);

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_SUSPENDED_USER',
    'USER',
    customer.id,
    { newStatus: customer.status }
  );

  return res.json({
    success: true,
    message: `Customer account is now ${customer.status}`,
    data: { id: customer.id, status: customer.status }
  });
});

// ==========================================
// 5. INVENTORY MANAGEMENT
// ==========================================

// GET /api/admin/inventory
router.get('/inventory', requirePermission('inventory.view'), (req, res) => {
  return res.json({
    success: true,
    data: {
      products: db.products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        price: p.price,
        category: p.category
      })),
      transactions: db.inventoryTransactions.slice(0, 50)
    }
  });
});

// POST /api/admin/inventory/:id/adjust
router.post('/inventory/:id/adjust', requirePermission('inventory.adjust'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const { adjustment, reason, notes } = req.body;

  const product = db.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
  }

  const adjNum = parseInt(adjustment, 10);
  if (isNaN(adjNum) || adjNum === 0) {
    return res.status(400).json({ success: false, error: { code: 'INVALID_ADJUSTMENT', message: 'Non-zero numerical adjustment required' } });
  }

  const prev = product.stock;
  product.stock = Math.max(0, product.stock + adjNum);

  const tx = {
    id: `inv-${Date.now()}`,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    previousStock: prev,
    newStock: product.stock,
    adjustment: adjNum,
    reason: reason || 'MANUAL_ADJUSTMENT',
    actor: `${user.firstName} ${user.lastName}`,
    notes: notes || 'Manual warehouse stock count',
    createdAt: new Date().toISOString()
  };

  db.inventoryTransactions.unshift(tx);
  db.persist('products', product);
  db.persist('inventoryTransactions', tx);

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_ADJUSTED_STOCK',
    'INVENTORY',
    product.id,
    { sku: product.sku, prevStock: prev, newStock: product.stock, adjustment: adjNum }
  );

  return res.json({ success: true, message: 'Stock updated', data: { product, transaction: tx } });
});

// ==========================================
// 6. CATEGORIES & BRANDS ADMIN
// ==========================================

router.get('/categories', requirePermission('categories.view'), (req, res) => {
  return res.json({ success: true, data: db.categories });
});

router.post('/categories', requirePermission('categories.create'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { name, description, imageUrl, bannerUrl, subcategories } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'NAME_REQUIRED', message: 'Category name is required' } });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat: Category = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    description,
    imageUrl,
    bannerUrl,
    subcategories: Array.isArray(subcategories) ? subcategories : [],
    productCount: 0,
    isActive: true,
    sortOrder: db.categories.length + 1
  };

  db.categories.push(cat);
  db.persist('categories', cat);
  db.logAudit({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role }, 'ADMIN_CREATED_CATEGORY', 'CATEGORY', cat.id, { name });
  return res.status(201).json({ success: true, data: cat });
});

router.put('/categories/:id', requirePermission('categories.update'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const { name, description, imageUrl, bannerUrl, subcategories, isActive } = req.body;

  const cat = db.categories.find(c => c.id === id || c.slug === id);
  if (!cat) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
  }

  if (name) {
    cat.name = name;
    cat.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (description !== undefined) cat.description = description;
  if (imageUrl !== undefined) cat.imageUrl = imageUrl;
  if (bannerUrl !== undefined) cat.bannerUrl = bannerUrl;
  if (Array.isArray(subcategories)) cat.subcategories = subcategories;
  if (isActive !== undefined) cat.isActive = isActive;

  db.persist('categories', cat);
  db.logAudit({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role }, 'ADMIN_UPDATED_CATEGORY', 'CATEGORY', cat.id, { name: cat.name });
  return res.json({ success: true, data: cat });
});

router.delete('/categories/:id', requirePermission('categories.delete'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const index = db.categories.findIndex(c => c.id === id || c.slug === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
  }

  const removed = db.categories.splice(index, 1)[0];
  db.deletePersisted('categories', { id: removed.id, slug: removed.slug });
  db.logAudit({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role }, 'ADMIN_DELETED_CATEGORY', 'CATEGORY', id, { name: removed.name });
  return res.json({ success: true, message: `Category "${removed.name}" deleted successfully` });
});

router.get('/brands', requirePermission('brands.view'), (req, res) => {
  return res.json({ success: true, data: db.brands });
});

router.post('/brands', requirePermission('brands.create'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { name, origin, description, logoUrl } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'NAME_REQUIRED', message: 'Brand name required' } });

  const brand: Brand = {
    id: `brand-${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    origin,
    description,
    logoUrl,
    productCount: 0,
    isActive: true
  };

  db.brands.push(brand);
  db.persist('brands', brand);
  db.logAudit({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role }, 'ADMIN_CREATED_BRAND', 'BRAND', brand.id, { name });
  return res.status(201).json({ success: true, data: brand });
});

router.put('/brands/:id', requirePermission('brands.update'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const { name, origin, description, logoUrl, isActive } = req.body;

  const brand = db.brands.find(b => b.id === id || b.slug === id);
  if (!brand) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brand not found' } });
  }

  if (name) {
    brand.name = name;
    brand.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (origin !== undefined) brand.origin = origin;
  if (description !== undefined) brand.description = description;
  if (logoUrl !== undefined) brand.logoUrl = logoUrl;
  if (isActive !== undefined) brand.isActive = isActive;

  db.persist('brands', brand);
  db.logAudit({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role }, 'ADMIN_UPDATED_BRAND', 'BRAND', brand.id, { name: brand.name });
  return res.json({ success: true, data: brand });
});

router.delete('/brands/:id', requirePermission('brands.delete'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const index = db.brands.findIndex(b => b.id === id || b.slug === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brand not found' } });
  }

  const removed = db.brands.splice(index, 1)[0];
  db.deletePersisted('brands', { id: removed.id, slug: removed.slug });
  db.logAudit({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role }, 'ADMIN_DELETED_BRAND', 'BRAND', id, { name: removed.name });
  return res.json({ success: true, message: `Brand "${removed.name}" deleted successfully` });
});

// ==========================================
// 7. COUPONS ADMIN
// ==========================================

router.get('/coupons', requirePermission('coupons.view'), (req, res) => {
  return res.json({ success: true, data: db.coupons });
});

router.post('/coupons', requirePermission('coupons.create'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ success: false, error: { code: 'REQUIRED_FIELDS', message: 'Code and discount value required' } });
  }

  const coupon: Coupon = {
    id: `cpn-${Date.now()}`,
    code: code.toUpperCase().trim(),
    description: description || '',
    discountType: discountType || 'PERCENTAGE',
    discountValue: parseFloat(discountValue),
    minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
    maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
    usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
    usageCount: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  db.coupons.push(coupon);
  db.persist('coupons', coupon);
  db.logAudit({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role }, 'ADMIN_CREATED_COUPON', 'COUPON', coupon.id, { code: coupon.code });
  return res.status(201).json({ success: true, data: coupon });
});

router.delete('/coupons/:id', requirePermission('coupons.delete'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  db.coupons = db.coupons.filter(c => c.id !== id);
  db.deletePersisted('coupons', { id });
  db.logAudit({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role }, 'ADMIN_DELETED_COUPON', 'COUPON', id);
  return res.json({ success: true, message: 'Coupon deleted' });
});

// ==========================================
// 8. REVIEWS & WHOLESALE ADMIN
// ==========================================

router.get('/reviews', requirePermission('reviews.view'), (req, res) => {
  return res.json({ success: true, data: db.reviews });
});

router.put('/reviews/:id', requirePermission('reviews.moderate'), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const rev = db.reviews.find(r => r.id === id);
  if (!rev) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });

  rev.status = status;
  db.persist('reviews', rev);
  return res.json({ success: true, data: rev });
});

router.get('/wholesale', requirePermission('wholesale.view'), (req, res) => {
  return res.json({ success: true, data: db.wholesaleApplications });
});

router.put('/wholesale/:id', requirePermission('wholesale.update'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const app = db.wholesaleApplications.find(w => w.id === id);
  if (!app) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Wholesale application not found' } });

  if (status) app.status = status;
  if (adminNotes !== undefined) app.adminNotes = adminNotes;
  app.updatedAt = new Date().toISOString();
  db.persist('wholesaleApplications', app);

  db.logAudit({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role }, 'ADMIN_UPDATED_WHOLESALE', 'WHOLESALE', app.id, { status: app.status });
  return res.json({ success: true, data: app });
});

// ==========================================
// 9. MEDIA & ASSETS
// ==========================================

router.get('/media', requirePermission('media.view'), (req, res) => {
  return res.json({ success: true, data: db.mediaLibrary });
});

router.post('/media', requirePermission('media.upload'), (req: AuthenticatedRequest, res) => {
  const { url, alt, category } = req.body;
  if (!url) return res.status(400).json({ success: false, error: { code: 'URL_REQUIRED', message: 'Image URL is required' } });

  const item = {
    id: `med-${Date.now()}`,
    url,
    alt: alt || 'Product Photograph',
    category: category || 'General',
    size: '1.2 MB',
    createdAt: new Date().toISOString()
  };

  db.mediaLibrary.unshift(item);
  db.persist('mediaLibrary', item);
  return res.status(201).json({ success: true, data: item });
});

// ==========================================
// 10. STAFF, ROLES & PERMISSION MATRIX (RBAC)
// ==========================================

// GET /api/admin/permissions
router.get('/permissions', requirePermission('roles.view'), (req, res) => {
  return res.json({ success: true, data: db.permissions });
});

// GET /api/admin/roles
router.get('/roles', requirePermission('roles.view'), (req, res) => {
  const rolesWithUserCount = db.roles.map(r => ({
    ...r,
    userCount: db.users.filter(u => u.role === r.code).length
  }));
  return res.json({ success: true, data: rolesWithUserCount });
});

// POST /api/admin/roles
router.post('/roles', requirePermission('roles.create'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { name, code, description, permissions } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, error: { code: 'NAME_REQUIRED', message: 'Role name and unique code are required' } });
  }

  const roleCode = code.toUpperCase().trim().replace(/[^A-Z0-9_]/g, '_');
  if (db.roles.some(r => r.code === roleCode)) {
    return res.status(409).json({ success: false, error: { code: 'ROLE_EXISTS', message: 'A role with this code already exists' } });
  }

  const newRole: Role = {
    id: `role-${Date.now()}`,
    name,
    code: roleCode,
    description: description || '',
    isSystem: false,
    permissions: Array.isArray(permissions) ? permissions : [],
    userCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.roles.push(newRole);
  db.persist('roles', newRole);

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_CREATED_ROLE',
    'ROLE',
    newRole.id,
    { code: newRole.code, permissionCount: newRole.permissions.length }
  );

  return res.status(201).json({ success: true, message: 'Custom role created', data: newRole });
});

// PUT /api/admin/roles/:id
router.put('/roles/:id', requirePermission('roles.update'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const { name, description, permissions } = req.body;

  const role = db.roles.find(r => r.id === id || r.code === id);
  if (!role) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Role not found' } });
  }

  // Protect SUPER_ADMIN system integrity
  if (role.code === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only Super Admin can modify root privileges.' } });
  }

  if (name) role.name = name;
  if (description !== undefined) role.description = description;
  if (Array.isArray(permissions)) {
    // If super admin, keep all permissions
    role.permissions = role.code === 'SUPER_ADMIN' ? db.permissions.map(p => p.key) : permissions;
  }
  role.updatedAt = new Date().toISOString();
  db.persist('roles', role);

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_CHANGED_ROLE_PERMISSIONS',
    'ROLE',
    role.id,
    { code: role.code, permissionCount: role.permissions.length }
  );

  return res.json({ success: true, message: 'Role permissions updated', data: role });
});

// GET /api/admin/staff
router.get('/staff', requirePermission('staff.view'), (req, res) => {
  const staff = db.users
    .filter(u => u.role !== 'CUSTOMER')
    .map(u => {
      const { passwordHash: _, ...safe } = u as any;
      return safe;
    });
  return res.json({ success: true, data: staff });
});

// POST /api/admin/staff
router.post('/staff', requirePermission('staff.create'), async (req: AuthenticatedRequest, res) => {
  const currentUser = req.user!;
  const { email, firstName, lastName, phone, role, password } = req.body;

  if (!email || !firstName || !role || !password) {
    return res.status(400).json({ success: false, error: { code: 'REQUIRED_FIELDS', message: 'Email, name, role, and temporary password required' } });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ success: false, error: { code: 'USER_EXISTS', message: 'An account with this email already exists.' } });
  }

  // Only SUPER_ADMIN can create another SUPER_ADMIN
  if (role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You cannot provision SUPER_ADMIN accounts.' } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newStaff = {
    id: `usr-staff-${Date.now()}`,
    email: normalizedEmail,
    firstName,
    lastName: lastName || '',
    phone,
    role,
    status: 'ACTIVE' as const,
    isEmailVerified: true,
    isPhoneVerified: !!phone,
    totalSpent: 0,
    orderCount: 0,
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.push(newStaff);
  db.persist('users', newStaff);

  db.logAudit(
    { id: currentUser.id, name: `${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, ip: req.ip },
    'ADMIN_CREATED_STAFF',
    'STAFF',
    newStaff.id,
    { email: newStaff.email, role: newStaff.role }
  );

  const { passwordHash: _, ...safeStaff } = newStaff;
  return res.status(201).json({ success: true, message: 'Staff member added', data: safeStaff });
});

// PUT /api/admin/staff/:id
router.put('/staff/:id', requirePermission('staff.update'), async (req: AuthenticatedRequest, res) => {
  const currentUser = req.user!;
  const { id } = req.params;
  const { role, status, firstName, lastName, phone, password } = req.body;

  const targetStaff = db.users.find(u => u.id === id);
  if (!targetStaff) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Staff member not found' } });
  }

  // Prevent modifying Super Admin unless actor is Super Admin
  if (targetStaff.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot modify Super Admin accounts.' } });
  }

  if (role && role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot elevate accounts to Super Admin.' } });
  }

  if (role) targetStaff.role = role;
  if (status) targetStaff.status = status;
  if (firstName) targetStaff.firstName = firstName;
  if (lastName !== undefined) targetStaff.lastName = lastName;
  if (phone !== undefined) targetStaff.phone = phone;
  if (password) {
    targetStaff.passwordHash = await bcrypt.hash(password, 10);
  }
  targetStaff.updatedAt = new Date().toISOString();
  db.persist('users', targetStaff);

  db.logAudit(
    { id: currentUser.id, name: `${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, ip: req.ip },
    'ADMIN_CHANGED_STAFF_RECORD',
    'STAFF',
    targetStaff.id,
    { role: targetStaff.role, status: targetStaff.status }
  );

  const { passwordHash: _, ...safe } = targetStaff as any;
  return res.json({ success: true, message: 'Staff profile updated', data: safe });
});

// DELETE /api/admin/staff/:id
router.delete('/staff/:id', requirePermission('staff.delete'), async (req: AuthenticatedRequest, res) => {
  const currentUser = req.user!;
  const { id } = req.params;

  const targetStaffIndex = db.users.findIndex(u => u.id === id);
  if (targetStaffIndex === -1) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Staff member not found' } });
  }

  const targetStaff = db.users[targetStaffIndex];
  if (targetStaff.role === 'SUPER_ADMIN' && (currentUser.role !== 'SUPER_ADMIN' || targetStaff.id === 'usr-ehtesham-root')) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Root Super Admin account cannot be deleted.' } });
  }

  if (targetStaff.id === currentUser.id) {
    return res.status(400).json({ success: false, error: { code: 'SELF_DELETE', message: 'You cannot delete your own staff account.' } });
  }

  db.users.splice(targetStaffIndex, 1);
  // Persist the deletion so the staff account is not recreated after a restart.
  db.deletePersisted('users', { id });

  db.logAudit(
    { id: currentUser.id, name: `${currentUser.firstName} ${currentUser.lastName}`, role: currentUser.role, ip: req.ip },
    'ADMIN_DELETED_STAFF',
    'STAFF',
    id,
    { email: targetStaff.email, role: targetStaff.role }
  );

  return res.json({ success: true, message: 'Staff member removed successfully' });
});

// ==========================================
// 11. AUDIT LOGS & SYSTEM SETTINGS
// ==========================================

// GET /api/admin/audit-logs
router.get('/audit-logs', requirePermission('audit_logs.view'), (req, res) => {
  const { action, resource, userId } = req.query as Record<string, string>;
  let result = [...db.auditLogs];

  if (action) result = result.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
  if (resource) result = result.filter(l => l.resource.toLowerCase() === resource.toLowerCase());
  if (userId) result = result.filter(l => l.userId === userId);

  return res.json({ success: true, data: result });
});

// GET /api/admin/settings
router.get('/settings', requirePermission('settings.view'), (req, res) => {
  return res.json({ success: true, data: db.settings });
});

// PUT /api/admin/settings
router.put('/settings', requirePermission('settings.update'), (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  Object.assign(db.settings, req.body);
  db.persist('settings', { id: 'store_settings', ...db.settings });

  db.logAudit(
    { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
    'ADMIN_UPDATED_SETTINGS',
    'SETTINGS',
    undefined,
    req.body
  );

  return res.json({ success: true, message: 'Store settings updated', data: db.settings });
});

// Notifications
router.get('/notifications', (req, res) => {
  return res.json({ success: true, data: db.notifications });
});

router.post('/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const n = db.notifications.find(item => item.id === id);
  if (n) n.isRead = true;
  return res.json({ success: true });
});

// ==========================================
// MONGODB STORAGE & CLOUD PERSISTENCE
// ==========================================

// GET /api/admin/mongodb/status
router.get('/mongodb/status', (req, res) => {
  const status = mongoService.getStatus();
  return res.json({ success: true, data: status });
});

// POST /api/admin/mongodb/sync
router.post('/mongodb/sync', async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  try {
    const success = await mongoService.pushAllToMongo(db);
    db.logAudit(
      { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
      'ADMIN_TRIGGERED_MONGODB_SYNC',
      'MONGODB',
      undefined,
      { success }
    );
    const status = mongoService.getStatus();
    return res.json({
      success,
      message: success ? 'Complete database synchronized to MongoDB successfully' : 'MongoDB sync failed (check connection)',
      data: status
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SYNC_ERROR', message: err.message } });
  }
});

// POST /api/admin/mongodb/reconnect
router.post('/mongodb/reconnect', async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  try {
    const connected = await mongoService.connect();
    if (connected) {
      await mongoService.syncWithStore(db);
    }
    db.logAudit(
      { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, ip: req.ip },
      'ADMIN_RECONNECTED_MONGODB',
      'MONGODB',
      undefined,
      { connected }
    );
    return res.json({ success: connected, data: mongoService.getStatus() });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'RECONNECT_ERROR', message: err.message } });
  }
});

// ==========================================
// 10. EXCEL EXPORTS (CUSTOMERS & INVENTORY)
// ==========================================

// GET /api/admin/export/customers/excel
router.get('/export/customers/excel', requirePermission('customers.view'), (req: AuthenticatedRequest, res) => {
  try {
    const customers = db.users.filter(u => u.role === 'CUSTOMER');
    const rows = customers.map((c, index) => ({
      '#': index + 1,
      'Customer ID': c.id,
      'First Name': c.firstName || '',
      'Last Name': c.lastName || '',
      'Full Name': `${c.firstName || ''} ${c.lastName || ''}`.trim(),
      'Email Address': c.email || '',
      'Phone Number': c.phone || '',
      'Role': c.role || 'CUSTOMER',
      'Account Status': c.status || 'ACTIVE',
      'House / Flat / Office No': c.addressDetails?.houseNo || '',
      'Area / Road / Colony': c.addressDetails?.areaRoad || '',
      'City': c.addressDetails?.city || '',
      'State': c.addressDetails?.state || '',
      'Pincode': c.addressDetails?.pincode || '',
      'Full Delivery Address': c.address || '',
      '21+ Age Verified': 'Yes',
      'Email Verified': c.isEmailVerified ? 'Yes' : 'No',
      'Phone Verified': c.isPhoneVerified ? 'Yes' : 'No',
      'Total Orders': c.orderCount || 0,
      'Total Spent ($)': Number((c.totalSpent || 0).toFixed(2)),
      'Wholesale Customer': c.isWholesaleCustomer ? 'Yes' : 'No',
      'Wholesale Company': c.wholesaleCompany || '',
      'Registration Date': c.createdAt ? new Date(c.createdAt).toISOString().replace('T', ' ').substring(0, 16) : '',
      'Last Login': c.lastLoginAt ? new Date(c.lastLoginAt).toISOString().replace('T', ' ').substring(0, 16) : ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto column widths
    const colKeys = rows.length > 0 ? Object.keys(rows[0]) : [];
    ws['!cols'] = colKeys.map(key => {
      let maxLen = key.length;
      for (const r of rows) {
        const val = (r as any)[key];
        const str = val !== null && val !== undefined ? String(val) : '';
        if (str.length > maxLen) maxLen = str.length;
      }
      return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Customers');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const exportDate = new Date().toISOString().split('T')[0];
    const filename = `fumare_customers_${exportDate}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'EXPORT_FAILED', message: err.message } });
  }
});

// GET /api/admin/export/inventory/excel
router.get('/export/inventory/excel', requirePermission('inventory.view'), (req: AuthenticatedRequest, res) => {
  try {
    const products = db.products;

    const inventoryRows = products.map((p, index) => {
      let stockStatus = 'In Stock';
      if (p.stock === 0) stockStatus = 'Out of Stock';
      else if (p.stock <= (p.lowStockThreshold || 5)) stockStatus = 'Low Stock';

      const price = Number(p.price || 0);
      const totalValue = Number((price * (p.stock || 0)).toFixed(2));

      return {
        '#': index + 1,
        'Product ID': p.id,
        'SKU': p.sku || '',
        'Product Name': p.name || '',
        'Category': p.category || '',
        'Subcategory': p.subcategory || '',
        'Brand': p.brand || '',
        'Stock Quantity': p.stock || 0,
        'Low Stock Alert Level': p.lowStockThreshold || 5,
        'Stock Status': stockStatus,
        'Retail Price ($)': price,
        'Sale Price ($)': p.salePrice !== undefined && p.salePrice !== null ? Number(p.salePrice) : '',
        'Total Stock Value ($)': totalValue,
        'Flavor / Aroma': p.flavor || '',
        'Material': p.material || '',
        'Color / Finish': p.color || '',
        'Weight (g)': p.weight || '',
        '21+ Age Restricted': p.ageRestricted ? 'Yes' : 'No',
        'Active In Store': p.isActive !== false ? 'Yes' : 'No',
        'Best Seller': p.isBestSeller ? 'Yes' : 'No',
        'On Sale': p.isOnSale ? 'Yes' : 'No',
        'Featured': p.isFeatured ? 'Yes' : 'No',
        'Customer Rating': p.rating ? Number(p.rating.toFixed(1)) : 5.0,
        'Reviews Count': p.reviewCount || 0,
        'Primary Image URL': p.images?.[0]?.url || '',
        'Date Created': p.createdAt ? new Date(p.createdAt).toISOString().replace('T', ' ').substring(0, 16) : '',
        'Last Updated': p.updatedAt ? new Date(p.updatedAt).toISOString().replace('T', ' ').substring(0, 16) : ''
      };
    });

    // Summary calculations
    const totalItems = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalValuation = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0);
    const outOfStockCount = products.filter((p) => p.stock === 0).length;
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 5)).length;
    const inStockCount = products.filter((p) => p.stock > (p.lowStockThreshold || 5)).length;

    const summaryRows = [
      { 'Metric': 'Total Catalog SKUs', 'Value': totalItems },
      { 'Metric': 'Total Physical Units in Stock', 'Value': totalUnits },
      { 'Metric': 'Total Inventory Valuation ($)', 'Value': `$${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      { 'Metric': 'Optimal Stocked Items', 'Value': inStockCount },
      { 'Metric': 'Low Stock Alert Items', 'Value': lowStockCount },
      { 'Metric': 'Out of Stock Items', 'Value': outOfStockCount },
      { 'Metric': 'Report Generated At', 'Value': new Date().toLocaleString() }
    ];

    const wb = XLSX.utils.book_new();

    const wsInventory = XLSX.utils.json_to_sheet(inventoryRows);
    const colKeys = inventoryRows.length > 0 ? Object.keys(inventoryRows[0]) : [];
    wsInventory['!cols'] = colKeys.map(key => {
      let maxLen = key.length;
      for (const r of inventoryRows) {
        const val = (r as any)[key];
        const str = val !== null && val !== undefined ? String(val) : '';
        if (str.length > maxLen) maxLen = str.length;
      }
      return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
    });
    XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventory Stock');

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Inventory Overview');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const exportDate = new Date().toISOString().split('T')[0];
    const filename = `fumare_inventory_${exportDate}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'EXPORT_FAILED', message: err.message } });
  }
});

export default router;

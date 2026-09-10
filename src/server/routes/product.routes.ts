import { Router } from 'express';

// [category-filter-fixed]
import { db } from '../db/store.js';

const router = Router();

// The storefront can mount/focus/re-render several sections at once. Keep a
// short per-instance response cache so identical requests arriving in the same
// burst do not repeatedly scan and sort the full 11k-product catalog.
// Mutations become visible shortly after the cache window expires.
const PRODUCT_RESPONSE_CACHE_TTL_MS = 5000;
const productResponseCache = new Map<string, { expiresAt: number; payload: any }>();

const productQueryCacheKey = (query: Record<string, unknown>) =>
  Object.keys(query)
    .sort()
    .map(key => `${key}=${String(query[key] ?? '')}`)
    .join('&');

// GET /api/products (with filtering, sorting, pagination)
router.get('/', (req, res) => {
  try {
    const cacheKey = productQueryCacheKey(req.query as Record<string, unknown>);
    const now = Date.now();
    const cached = productResponseCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return res.json(cached.payload);
    }
    if (cached) productResponseCache.delete(cacheKey);

    const {
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      flavor,
      material,
      color,
      inStock,
      onSale,
      featured,
      newArrival,
      bestSeller,
      stockStatus,
      sort = 'popularity',
      page = '1',
      limit = '16',
      q
    } = req.query as Record<string, string>;

    // Build the deletion set ONCE per request. db.isProductDeleted() builds a
    // new Set for every product, which turns an 11k-product request into a
    // needless nested O(n*m) operation.
    const deletedProductIds = new Set(
      db.persistenceData.deletedProductIds.map(id => id.toLowerCase().trim())
    );
    let result = db.products.filter(p => p.isActive && !deletedProductIds.has(p.id.toLowerCase().trim()));

    // Text search query
    if (q && q.trim()) {
      const term = q.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.flavor && p.flavor.toLowerCase().includes(term)) ||
        p.tags.some(t => t.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (category) {
      const catLower = category.toLowerCase().trim();
      const categoryAliases: Record<string, string[]> = {
        'e-hookah': ['e-hookah', 'e hookah', 'e-hookah & electronic', 'e hookah electronic', 'electronic hookah', 'electronic hookah heads'],
        'vapes': ['vapes', 'vape', 'vapes & pod systems', 'vape & pod systems', 'pod systems', 'disposable vapes']
      };
      const aliases = categoryAliases[catLower] || [catLower];
      result = result.filter(p => {
        const pSlug = (p.categorySlug || '').toLowerCase().trim();
        const pCategory = (p.category || '').toLowerCase().trim();
        const pSlugSpaced = pSlug.replace(/-/g, ' ');
        const pCategorySlug = pCategory.replace(/\s+/g, '-');
        return aliases.some(alias => {
          const a = alias.toLowerCase().trim();
          return pSlug === a || pCategory === a || pSlugSpaced === a.replace(/-/g, ' ') || pCategorySlug === a.replace(/\s+/g, '-');
        });
      });
    }

    // Subcategory filter
    if (subcategory) {
      const subLower = subcategory.toLowerCase().trim();
      const subClean = subLower.replace(/\b(tobacco|hookahs?|bowls?|vases?|bases?|charcoals?|coals?|hmd|supplies|accessories)\b/gi, '').trim();
      result = result.filter(p => {
        const pSub = (p.subcategory || '').toLowerCase();
        const pBrand = (p.brand || '').toLowerCase();
        const pBrandSlug = (p.brandSlug || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const pTags = (p.tags || []).map(t => t.toLowerCase());

        return (
          pSub === subLower ||
          pSub.includes(subLower) ||
          (pSub.length > 3 && subLower.includes(pSub)) ||
          (subClean.length >= 3 && (
            pSub.includes(subClean) ||
            pBrand.includes(subClean) ||
            (pBrand.length >= 3 && subClean.includes(pBrand)) ||
            pBrandSlug.includes(subClean.replace(/\s+/g, '-')) ||
            pName.includes(subClean) ||
            pTags.some(t => t.includes(subClean))
          )) ||
          pTags.some(t => t.includes(subLower)) ||
          pName.includes(subLower)
        );
      });
    }

    // Brand filter
    if (brand) {
      const brandLower = brand.toLowerCase().trim();
      const brandClean = brandLower.replace(/-(tobacco|hookah|bowls|vapes|shisha)$/i, '').replace(/-/g, ' ').trim();
      result = result.filter(p => {
        const pBrand = (p.brand || '').toLowerCase();
        const pBrandSlug = (p.brandSlug || '').toLowerCase();
        return (
          pBrandSlug === brandLower ||
          pBrand === brandLower ||
          pBrand.replace(/\s+/g, '-') === brandLower ||
          (brandClean.length >= 3 && (
            pBrand.includes(brandClean) ||
            (pBrand.length >= 3 && brandClean.includes(pBrand)) ||
            pBrandSlug.includes(brandClean.replace(/\s+/g, '-'))
          ))
        );
      });
    }

    // Price range
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) result = result.filter(p => (p.salePrice || p.price) >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) result = result.filter(p => (p.salePrice || p.price) <= max);
    }

    if (flavor) result = result.filter(p => p.flavor?.toLowerCase().includes(flavor.toLowerCase()));
    if (material) result = result.filter(p => p.material?.toLowerCase().includes(material.toLowerCase()));
    if (color) result = result.filter(p => p.color?.toLowerCase().includes(color.toLowerCase()));

    if (stockStatus === 'low') {
      result = result.filter(p => p.stock <= (p.lowStockThreshold || 5) && p.stock > 0);
    } else if (stockStatus === 'out') {
      result = result.filter(p => p.stock === 0);
    } else if (stockStatus === 'in' || inStock === 'true') {
      result = result.filter(p => p.stock > 0);
    }

    if (onSale === 'true') result = result.filter(p => p.isOnSale || (p.salePrice && p.salePrice < p.price));
    if (featured === 'true') result = result.filter(p => p.isFeatured);
    if (newArrival === 'true') result = result.filter(p => p.isNewArrival);
    if (bestSeller === 'true') result = result.filter(p => p.isBestSeller);

    switch (sort) {
      case 'price-low-high':
      case 'price_asc':
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high-low':
      case 'price_desc':
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'stock-low-high':
        result.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock-high-low':
        result.sort((a, b) => b.stock - a.stock);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'best-selling':
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) || b.reviewCount - a.reviewCount);
        break;
      case 'discount':
        result.sort((a, b) => {
          const discA = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
          const discB = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
          return discB - discA;
        });
        break;
      case 'popularity':
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(10000, Math.max(1, parseInt(limit, 10) || 24));
    const totalCount = result.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const paginatedProducts = result.slice(offset, offset + limitNum);

    const payload = {
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    };

    productResponseCache.set(cacheKey, {
      expiresAt: Date.now() + PRODUCT_RESPONSE_CACHE_TTL_MS,
      payload
    });

    if (productResponseCache.size > 200) {
      const cleanupNow = Date.now();
      for (const [key, entry] of productResponseCache) {
        if (entry.expiresAt <= cleanupNow) productResponseCache.delete(key);
      }
    }

    return res.json(payload);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch products' }
    });
  }
});

// GET /api/products/homepage-sections (Consolidated batch endpoint for high-speed homepage loading)
router.get('/homepage-sections', (req, res) => {
  try {
    const deletedProductIds = new Set(
      db.persistenceData.deletedProductIds.map(id => id.toLowerCase().trim())
    );
    const activeProducts = db.products.filter(p => p.isActive && !deletedProductIds.has(p.id.toLowerCase().trim()));

    const categoryAliases: Record<string, string[]> = {
      'tobacco': ['tobacco', 'shisha-tobacco', 'hookah-tobacco'],
      'hookahs': ['hookahs', 'hookah', 'shisha-pipe', 'shisha-pipes'],
      'bowls': ['bowls', 'bowl', 'hookah-bowls'],
      'bases': ['bases', 'base', 'glass-bases', 'hookah-bases', 'vases'],
      'coal': ['coal', 'coals', 'charcoal', 'coconut-coal', 'hookah-coal'],
      'accessories': ['accessories', 'accessory', 'hookah-accessories', 'supplies'],
      'e-hookah': ['e-hookah', 'e hookah', 'e-hookah & electronic', 'e hookah electronic', 'electronic hookah', 'electronic hookah heads'],
      'vapes': ['vapes', 'vape', 'vapes & pod systems', 'vape & pod systems', 'pod systems', 'disposable vapes']
    };

    const matchesCategory = (p: any, targetCategory: string) => {
      const pSlug = (p.categorySlug || '').toLowerCase().trim();
      const pCategory = (p.category || '').toLowerCase().trim();
      const aliases = categoryAliases[targetCategory] || [targetCategory];
      return aliases.some(alias => {
        const a = alias.toLowerCase().trim();
        return pSlug === a || pCategory === a || pSlug.replace(/-/g, ' ') === a.replace(/-/g, ' ') || pCategory.replace(/\s+/g, '-') === a.replace(/\s+/g, '-');
      });
    };

    const tobacco: any[] = [];
    const hookahs: any[] = [];
    const bowls: any[] = [];
    const bases: any[] = [];
    const coal: any[] = [];
    const accessories: any[] = [];
    const ehookah: any[] = [];
    const vapes: any[] = [];
    const newArrivals: any[] = [];
    const bestSellers: any[] = [];

    for (const p of activeProducts) {
      if (tobacco.length < 12 && matchesCategory(p, 'tobacco')) tobacco.push(p);
      if (hookahs.length < 12 && matchesCategory(p, 'hookahs')) hookahs.push(p);
      if (bowls.length < 12 && matchesCategory(p, 'bowls')) bowls.push(p);
      if (bases.length < 12 && matchesCategory(p, 'bases')) bases.push(p);
      if (coal.length < 12 && matchesCategory(p, 'coal')) coal.push(p);
      if (accessories.length < 12 && matchesCategory(p, 'accessories')) accessories.push(p);
      if (ehookah.length < 12 && matchesCategory(p, 'e-hookah')) ehookah.push(p);
      if (vapes.length < 12 && matchesCategory(p, 'vapes')) vapes.push(p);
      if (newArrivals.length < 8 && (p.isNewArrival || p.tags?.includes('new'))) newArrivals.push(p);
      if (bestSellers.length < 8 && (p.isBestSeller || p.reviewCount > 10 || p.rating >= 4.5)) bestSellers.push(p);
    }

    // Fallbacks if newArrivals or bestSellers didn't hit 8 items
    if (newArrivals.length < 8) {
      for (const p of activeProducts) {
        if (!newArrivals.includes(p)) {
          newArrivals.push(p);
          if (newArrivals.length >= 8) break;
        }
      }
    }
    if (bestSellers.length < 8) {
      for (const p of activeProducts) {
        if (!bestSellers.includes(p)) {
          bestSellers.push(p);
          if (bestSellers.length >= 8) break;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        categories: {
          tobacco,
          hookahs,
          bowls,
          bases,
          coal,
          accessories,
          ehookah,
          vapes
        },
        newArrivals,
        bestSellers
      }
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: err.message || 'Failed to fetch homepage sections' }
    });
  }
});

// GET /api/products/search?q=
router.get('/search', (req, res) => {
  const term = (req.query.q as string || '').toLowerCase().trim();
  if (!term) return res.json({ success: true, data: { results: [], suggestions: [] } });

  const matches = db.products
    .filter(p => p.isActive)
    .filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      (p.flavor && p.flavor.toLowerCase().includes(term))
    )
    .slice(0, 10);

  const matchedCategories = db.categories
    .filter(c => c.name.toLowerCase().includes(term))
    .map(c => ({ name: c.name, slug: c.slug, type: 'category' }));
  const matchedBrands = db.brands
    .filter(b => b.name.toLowerCase().includes(term))
    .map(b => ({ name: b.name, slug: b.slug, type: 'brand' }));

  return res.json({
    success: true,
    data: {
      results: matches,
      suggestions: [...matchedCategories, ...matchedBrands]
    }
  });
});

// GET /api/products/:slug
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const product = db.products.find(p => p.slug === slug || p.id === slug);

  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      error: { code: 'PRODUCT_NOT_FOUND', message: 'The requested product could not be located.' }
    });
  }

  const relatedProducts = db.products
    .filter(p => p.isActive && p.id !== product.id && (p.categorySlug === product.categorySlug || p.brandSlug === product.brandSlug))
    .slice(0, 4);

  const frequentlyBoughtTogether = db.products
    .filter(p => p.isActive && p.id !== product.id && p.categorySlug !== product.categorySlug)
    .slice(0, 2);

  const reviews = db.reviews.filter(r => r.productId === product.id && r.status === 'APPROVED');

  return res.json({
    success: true,
    data: {
      product,
      relatedProducts,
      frequentlyBoughtTogether,
      reviews
    }
  });
});

export default router;

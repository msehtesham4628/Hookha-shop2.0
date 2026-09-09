import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Role,
  Permission,
  Product,
  Category,
  Brand,
  Order,
  Review,
  Coupon,
  WholesaleApplication,
  InventoryTransaction,
  AuditLog,
  StoreSettings,
  AdminNotification,
  Address
} from '../../types/index.js';
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLES,
  DEFAULT_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS
} from './seedData.js';
import { mongoService } from './mongodb.js';
import {
  StorePersistenceData,
  getDefaultPersistenceData,
  loadPersistenceData,
  savePersistenceData
} from './persistence.js';

interface StoredOTP {
  identifier: string;
  codeHash: string;
  type: 'EMAIL' | 'SMS';
  expiresAt: number;
  attempts: number;
}

interface StoredPasswordResetToken {
  token: string;
  email: string;
  expiresAt: number;
}

interface StoredCartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  selectedFlavor?: string;
  selectedColor?: string;
}

interface StoredWishlist {
  userId: string;
  productIds: string[];
}

const catalogSlug = (value: unknown) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'uncategorized';
const catalogText = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();

function resolveDbFilePath(fileName: string): string {
  const cwdPath = path.join(process.cwd(), 'src/server/db', fileName);
  if (fs.existsSync(cwdPath)) return cwdPath;

  const vercelTaskPath = path.join('/var/task', 'src/server/db', fileName);
  if (fs.existsSync(vercelTaskPath)) return vercelTaskPath;

  try {
    const dir = typeof __dirname !== 'undefined' ? __dirname : path.dirname(new URL(import.meta.url).pathname);
    const localPath = path.join(dir, fileName);
    if (fs.existsSync(localPath)) return localPath;
  } catch {}

  return cwdPath;
}

function loadSplitCatalog(): Product[] {
  const products: Product[] = [];
  const knownBrands = ['Al Fakher', 'Alpha Hookah', 'Blackburn', 'Bonche', 'Element', 'Adalya', 'Tangiers', 'MustHave', 'DarkSide', 'Trifecta', 'Fumari', 'Starbuzz', 'Mason', 'Steamulation', 'Vyro', 'Moze', 'Kaloud', 'Werkbund', 'Oblako', 'Maklaud'];

  for (let partNumber = 1; partNumber <= 6; partNumber++) {
    const catalogPath = resolveDbFilePath(`products-${partNumber}.json`);
    if (!fs.existsSync(catalogPath)) continue;

    try {
      const rawProducts = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      if (!Array.isArray(rawProducts)) continue;

      for (const rawProduct of rawProducts) {
        const name = catalogText(rawProduct.product_name || rawProduct.name);
        const sourceUrl = catalogText(rawProduct.product_url || rawProduct.url);
        if (!name && !sourceUrl) continue;

        const categoryText = catalogText(rawProduct.category);
        const productText = `${name} ${catalogText(rawProduct.description)} ${sourceUrl.replace(/^https?:\/\/[^/]+/i, '')}`.toLowerCase();
        const category =
          /e-?hookah|electronic hookah|smart head|hookah pod/.test(productText) ? 'E-Hookah' :
          /vape|puff|nicotine|pod system|disposable/.test(productText) ? 'Vapes' :
          /charcoal|coconut coal|quick light|hookah coal|hookah charcoal/.test(productText) ? 'Coal' :
          /tobacco|shisha tobacco|hookah tobacco|molasses|dark leaf|blonde leaf|cigar leaf/.test(productText) ? 'Tobacco' :
          /\bbowls?\b|phunnel|killer bowl|hookah bowl|clay bowl/.test(productText) ? 'Bowls' :
          /\bbases?\b|glass vase|vase for hookah|crystal base|hookah base/.test(productText) ? 'Bases' :
          /\bhookahs?\b|shisha pipe|nargile|hookah stem|hookah set/.test(productText) ? 'Hookahs' :
          categoryText || 'Accessories';
        const brand = catalogText(rawProduct.brand) || knownBrands.find(knownBrand => name.toLowerCase().startsWith(knownBrand.toLowerCase())) || name.split(/\s+/)[0] || 'Fumare Hookah';
        const slug = catalogSlug(name || sourceUrl);
        const priceMatch = String(rawProduct.price ?? '').replace(/,/g, '').match(/\d+(?:\.\d{1,2})?/);
        const price = priceMatch ? Number(priceMatch[0]) : 0;
        const imageUrls = Array.isArray(rawProduct.image_urls) ? rawProduct.image_urls : Array.isArray(rawProduct.images) ? rawProduct.images : [];
        const images = imageUrls
          .map((image: unknown) => typeof image === 'string' ? image : (image as { url?: string })?.url || '')
          .filter((url: string) => /^https?:\/\//i.test(url) && !/placeholder|spinner|loading|gravatar|avatar/i.test(url))
          .slice(0, 20)
          .map((url: string, imageIndex: number) => ({
            id: `${slug}-image-${imageIndex + 1}`,
            url,
            thumbnailUrl: url,
            alt: `${name} product image ${imageIndex + 1}`,
            isPrimary: imageIndex === 0,
            sortOrder: imageIndex
          }));

        products.push({
          id: `whm-${slug}`,
          name,
          slug,
          sku: catalogText(rawProduct.sku),
          description: catalogText(rawProduct.description),
          shortDescription: catalogText(rawProduct.description).slice(0, 240),
          price,
          currency: 'USD',
          brand,
          brandSlug: catalogSlug(brand),
          category,
          categorySlug: catalogSlug(category),
          images,
          stock: 100,
          lowStockThreshold: 5,
          tags: [category, brand].filter(Boolean),
          specifications: [],
          rating: 0,
          reviewCount: 0,
          isFeatured: false,
          isNewArrival: false,
          isBestSeller: false,
          isOnSale: false,
          isActive: true,
          ageRestricted: true,
          seoTitle: `${name} | Fumare Hookah`,
          seoDescription: catalogText(rawProduct.description).slice(0, 155),
          sourceUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn(`[Store] Could not load products-${partNumber}.json:`, error);
    }
  }

  return products;
}

export class DatabaseStore {
  public permissions: Permission[] = [];
  public roles: Role[] = [];
  public users: (User & { passwordHash?: string })[] = [];
  public products: Product[] = [];
  public categories: Category[] = [];
  public brands: Brand[] = [];
  public orders: Order[] = [];
  public reviews: Review[] = [];
  public coupons: Coupon[] = [];
  public wholesaleApplications: WholesaleApplication[] = [];
  public inventoryTransactions: InventoryTransaction[] = [];
  public auditLogs: AuditLog[] = [];
  public settings: StoreSettings = { ...DEFAULT_SETTINGS };
  public notifications: AdminNotification[] = [];
  public addresses: Address[] = [];

  public cartItems: StoredCartItem[] = [];
  public wishlists: StoredWishlist[] = [];
  public otps: StoredOTP[] = [];
  public passwordResetTokens: StoredPasswordResetToken[] = [];
  public newsletterSubscribers: { email: string; createdAt: string }[] = [];
  public contactMessages: { id: string; name: string; email: string; phone?: string; subject: string; message: string; createdAt: string }[] = [];
  public mediaLibrary: { id: string; url: string; alt: string; category: string; size: string; createdAt: string }[] = [];
  public persistenceData: StorePersistenceData = getDefaultPersistenceData();

  private isInitialized = false;

  public loadPersistence() {
    this.persistenceData = loadPersistenceData();
  }

  public async savePersistence() {
    savePersistenceData(this.persistenceData);
    try {
      if (mongoService.getStatus().isConnected) {
        await mongoService.saveDocument('persistence', { id: 'store_persistence', ...this.persistenceData });
      }
    } catch (err) {
      console.warn('[Store] Cloud persistence sync notice:', err);
    }
  }

  public mergePersistenceData(incoming: Partial<StorePersistenceData>) {
    if (!incoming) return;

    const delProducts = new Set([...this.persistenceData.deletedProductIds, ...(incoming.deletedProductIds || [])]);
    const delCats = new Set([...this.persistenceData.deletedCategoryIds, ...(incoming.deletedCategoryIds || [])]);
    const delBrands = new Set([...this.persistenceData.deletedBrandIds, ...(incoming.deletedBrandIds || [])]);
    const delCoupons = new Set([...this.persistenceData.deletedCouponIds, ...(incoming.deletedCouponIds || [])]);
    const delUsers = new Set([...this.persistenceData.deletedUserIds, ...(incoming.deletedUserIds || [])]);

    this.persistenceData.deletedProductIds = Array.from(delProducts);
    this.persistenceData.deletedCategoryIds = Array.from(delCats);
    this.persistenceData.deletedBrandIds = Array.from(delBrands);
    this.persistenceData.deletedCouponIds = Array.from(delCoupons);
    this.persistenceData.deletedUserIds = Array.from(delUsers);

    this.persistenceData.productOverrides = {
      ...(incoming.productOverrides || {}),
      ...this.persistenceData.productOverrides
    };
    this.persistenceData.categoryOverrides = {
      ...(incoming.categoryOverrides || {}),
      ...this.persistenceData.categoryOverrides
    };
    this.persistenceData.brandOverrides = {
      ...(incoming.brandOverrides || {}),
      ...this.persistenceData.brandOverrides
    };
    this.persistenceData.couponOverrides = {
      ...(incoming.couponOverrides || {}),
      ...this.persistenceData.couponOverrides
    };
    this.persistenceData.orderOverrides = {
      ...(incoming.orderOverrides || {}),
      ...this.persistenceData.orderOverrides
    };
    this.persistenceData.userOverrides = {
      ...(incoming.userOverrides || {}),
      ...this.persistenceData.userOverrides
    };
    if (incoming.settingsOverride) {
      this.persistenceData.settingsOverride = {
        ...(incoming.settingsOverride || {}),
        ...(this.persistenceData.settingsOverride || {})
      };
    }

    for (const id of this.persistenceData.deletedProductIds) {
      delete this.persistenceData.productOverrides[id];
    }
    for (const id of this.persistenceData.deletedCategoryIds) {
      delete this.persistenceData.categoryOverrides[id];
    }
    for (const id of this.persistenceData.deletedBrandIds) {
      delete this.persistenceData.brandOverrides[id];
    }

    this.applyPersistence();
    savePersistenceData(this.persistenceData);
  }

  public isProductDeleted(id: string): boolean {
    if (!id) return false;
    const target = id.toLowerCase().trim();
    const deletedSet = new Set(this.persistenceData.deletedProductIds.map(s => s.toLowerCase().trim()));
    return deletedSet.has(target);
  }

  public isCategoryDeleted(slugOrId: string): boolean {
    if (!slugOrId) return false;
    const target = slugOrId.toLowerCase().trim();
    const slug = target.replace(/[^a-z0-9]+/g, '-');
    const deletedSet = new Set(this.persistenceData.deletedCategoryIds.map(s => s.toLowerCase().trim()));
    if (deletedSet.has(target)) return true;
    if (slug && deletedSet.has(slug)) return true;
    if (deletedSet.has(`cat-${target}`)) return true;
    if (slug && deletedSet.has(`cat-${slug}`)) return true;
    return deletedSet.has(target.replace(/^cat-/, ''));
  }

  public isBrandDeleted(slugOrId: string): boolean {
    if (!slugOrId) return false;
    const target = slugOrId.toLowerCase().trim();
    const slug = target.replace(/[^a-z0-9]+/g, '-');
    const deletedSet = new Set(this.persistenceData.deletedBrandIds.map(s => s.toLowerCase().trim()));
    if (deletedSet.has(target)) return true;
    if (slug && deletedSet.has(slug)) return true;
    if (deletedSet.has(`brand-${target}`)) return true;
    if (slug && deletedSet.has(`brand-${slug}`)) return true;
    return deletedSet.has(target.replace(/^brand-/, ''));
  }

  public applyPersistence() {
    const deletedCouponSet = new Set(this.persistenceData.deletedCouponIds);
    const deletedUserSet = new Set(this.persistenceData.deletedUserIds);

    this.products = this.products.filter(p => !this.isProductDeleted(p.id));
    const prodMap = new Map<string, Product>();
    for (const p of this.products) prodMap.set(p.id, p);
    for (const [id, override] of Object.entries(this.persistenceData.productOverrides)) {
      if (this.isProductDeleted(id)) continue;
      if (prodMap.has(id)) {
        prodMap.set(id, { ...prodMap.get(id)!, ...override });
      } else {
        prodMap.set(id, override);
      }
    }
    this.products = Array.from(prodMap.values());

    this.categories = this.categories.filter(c =>
      !this.isCategoryDeleted(c.id) &&
      !this.isCategoryDeleted(c.slug) &&
      !this.isCategoryDeleted(c.name)
    );
    const catMap = new Map<string, Category>();
    for (const c of this.categories) catMap.set(c.id, c);
    for (const [id, override] of Object.entries(this.persistenceData.categoryOverrides)) {
      if (this.isCategoryDeleted(id) || (override.slug && this.isCategoryDeleted(override.slug))) continue;
      if (catMap.has(id)) {
        catMap.set(id, { ...catMap.get(id)!, ...override });
      } else {
        catMap.set(id, override);
      }
    }
    this.categories = Array.from(catMap.values());

    this.brands = this.brands.filter(b =>
      !this.isBrandDeleted(b.id) &&
      !this.isBrandDeleted(b.slug) &&
      !this.isBrandDeleted(b.name)
    );
    const brandMap = new Map<string, Brand>();
    for (const b of this.brands) brandMap.set(b.id, b);
    for (const [id, override] of Object.entries(this.persistenceData.brandOverrides)) {
      if (this.isBrandDeleted(id) || (override.slug && this.isBrandDeleted(override.slug))) continue;
      if (brandMap.has(id)) {
        brandMap.set(id, { ...brandMap.get(id)!, ...override });
      } else {
        brandMap.set(id, override);
      }
    }
    this.brands = Array.from(brandMap.values());

    this.coupons = this.coupons.filter(c => !deletedCouponSet.has(c.id));
    const couponMap = new Map<string, Coupon>();
    for (const c of this.coupons) couponMap.set(c.id, c);
    for (const [id, override] of Object.entries(this.persistenceData.couponOverrides)) {
      if (deletedCouponSet.has(id)) continue;
      couponMap.set(id, override);
    }
    this.coupons = Array.from(couponMap.values());

    this.users = this.users.filter(u => !deletedUserSet.has(u.id));
    for (const [id, override] of Object.entries(this.persistenceData.userOverrides)) {
      if (deletedUserSet.has(id)) continue;
      const idx = this.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        this.users[idx] = { ...this.users[idx], ...override };
      } else {
        this.users.push(override);
      }
    }

    if (this.persistenceData.settingsOverride) {
      this.settings = { ...this.settings, ...this.persistenceData.settingsOverride };
    }
  }

  constructor() {
    this.seedDefaultUsers();
    this.init();
  }

  public seedDefaultUsers() {
    if (this.users && this.users.length > 0) return;

    const superAdminPasswordHash = bcrypt.hashSync('Admin123!', 10);
    const inzyAdminPasswordHash = bcrypt.hashSync('Umair@4628', 10);
    const sultanAdminHash = bcrypt.hashSync('Sultan@Admin2026!', 10);
    const staffPasswordHash = bcrypt.hashSync('Staff123!', 10);
    const sultanManagerHash = bcrypt.hashSync('Sultan@Manager2026!', 10);
    const customerPasswordHash = bcrypt.hashSync('Customer123!', 10);
    const sultanVipHash = bcrypt.hashSync('Sultan@Vip2026!', 10);

    this.users = [
      {
        id: 'usr-ehtesham-root',
        email: 'ehtesham4628@gmail.com',
        firstName: 'Ehtesham',
        lastName: 'Admin',
        phone: '+1 (800) 785-8260',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        totalSpent: 0,
        orderCount: 0,
        passwordHash: superAdminPasswordHash,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'usr-super-admin-0',
        email: 'admin@fumarehookah.com',
        firstName: 'Fumare Hookah',
        lastName: 'Administrator',
        phone: '+1 (800) 785-8260',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        totalSpent: 0,
        orderCount: 0,
        passwordHash: superAdminPasswordHash,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'usr-inzy-admin',
        email: 'inzy@admin.com',
        firstName: 'Inzy',
        lastName: 'Administrator',
        phone: '+1 (800) 785-8260',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        totalSpent: 0,
        orderCount: 0,
        passwordHash: inzyAdminPasswordHash,
        createdAt: '2026-09-06T00:00:00Z',
        updatedAt: '2026-09-06T00:00:00Z'
      },
      {
        id: 'usr-super-admin-whm',
        email: 'admin@worldhookahmarket.com',
        firstName: 'Market',
        lastName: 'Administrator',
        phone: '+1 (800) 785-8260',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        totalSpent: 0,
        orderCount: 0,
        passwordHash: superAdminPasswordHash,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'usr-super-admin-1',
        email: 'admin@sultan.com',
        firstName: 'Farhan',
        lastName: 'Al-Mansoor',
        phone: '+1 (800) 785-8260',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        totalSpent: 0,
        orderCount: 0,
        passwordHash: superAdminPasswordHash,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'usr-super-admin-2',
        email: 'admin@sultanhookah.com',
        firstName: 'Farhan',
        lastName: 'Al-Mansoor',
        phone: '+1 (800) 785-8260',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        totalSpent: 0,
        orderCount: 0,
        passwordHash: sultanAdminHash,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'usr-product-manager-1',
        email: 'pm@sultan.com',
        firstName: 'Dmitri',
        lastName: 'Volkov',
        phone: '+1 (555) 492-8821',
        role: 'PRODUCT_MANAGER',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: false,
        totalSpent: 0,
        orderCount: 0,
        passwordHash: staffPasswordHash,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z'
      },
      {
        id: 'usr-manager-2',
        email: 'manager@sultanhookah.com',
        firstName: 'Dmitri',
        lastName: 'Volkov',
        phone: '+1 (555) 492-8821',
        role: 'STORE_MANAGER',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: false,
        totalSpent: 0,
        orderCount: 0,
        passwordHash: sultanManagerHash,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z'
      },
      {
        id: 'usr-support-1',
        email: 'support@sultan.com',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        phone: '+1 (555) 381-9922',
        role: 'CUSTOMER_SUPPORT',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: false,
        totalSpent: 0,
        orderCount: 0,
        passwordHash: staffPasswordHash,
        createdAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-01-03T00:00:00Z'
      },
      {
        id: 'usr-customer-1',
        email: 'customer@example.com',
        firstName: 'Julian',
        lastName: 'Vance',
        phone: '+1 (555) 219-4402',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        totalSpent: 733.95,
        orderCount: 2,
        passwordHash: customerPasswordHash,
        createdAt: '2026-01-10T00:00:00Z',
        updatedAt: '2026-01-10T00:00:00Z'
      },
      {
        id: 'usr-vip-2',
        email: 'vip@sultanhookah.com',
        firstName: 'Julian',
        lastName: 'Vance',
        phone: '+1 (555) 219-4402',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        isEmailVerified: true,
        isPhoneVerified: true,
        totalSpent: 1250.00,
        orderCount: 4,
        passwordHash: sultanVipHash,
        createdAt: '2026-01-10T00:00:00Z',
        updatedAt: '2026-01-10T00:00:00Z'
      }
    ];
  }

  public async init() {
    if (this.isInitialized) return;

    this.permissions = [...DEFAULT_PERMISSIONS];
    this.roles = [...DEFAULT_ROLES];
    this.categories = [...INITIAL_CATEGORIES];
    this.brands = [...INITIAL_BRANDS];

    let catalogProducts: Product[] = loadSplitCatalog();
    if (catalogProducts.length > 0) {
      console.log(`[Store] Loaded ${catalogProducts.length} products from split catalogs.`);
    }
    try {
      const catalogPath = resolveDbFilePath('scrapedProducts.json');
      if (fs.existsSync(catalogPath)) {
        const fileData = fs.readFileSync(catalogPath, 'utf8');
        const scrapedProducts: Product[] = JSON.parse(fileData);
        catalogProducts = [...catalogProducts, ...scrapedProducts];
      }
    } catch (e) {
      console.warn('[Store] Could not load scrapedProducts.json:', e);
    }

    this.loadPersistence();

    const productMap = new Map<string, Product>();
    const productsToLoad = catalogProducts.length > 0 ? catalogProducts : INITIAL_PRODUCTS;
    for (const p of productsToLoad) {
      productMap.set(p.id, p);
    }

    const deletedProductSet = new Set(this.persistenceData.deletedProductIds);
    for (const deletedId of deletedProductSet) {
      productMap.delete(deletedId);
    }

    for (const [id, override] of Object.entries(this.persistenceData.productOverrides)) {
      if (deletedProductSet.has(id)) continue;
      if (productMap.has(id)) {
        const existing = productMap.get(id)!;
        productMap.set(id, { ...existing, ...override });
      } else {
        productMap.set(id, override);
      }
    }

    this.products = Array.from(productMap.values());

    this.products.forEach(p => {
      if (p.images && p.images.length > 0) {
        const seen = new Set<string>();
        const cleanImgs = [];
        for (const img of p.images) {
          const cleanUrl = (img.url || '').replace(/-916x916(?=\.(?:jpg|jpeg|png|webp))/i, '');
          if (cleanUrl && !seen.has(cleanUrl)) {
            seen.add(cleanUrl);
            cleanImgs.push({
              ...img,
              url: cleanUrl,
              thumbnailUrl: (img.thumbnailUrl || cleanUrl).replace(/-916x916(?=\.(?:jpg|jpeg|png|webp))/i, '')
            });
          }
        }
        if (cleanImgs.length > 0) {
          cleanImgs[0].isPrimary = true;
          for (let i = 1; i < cleanImgs.length; i++) {
            cleanImgs[i].isPrimary = false;
            cleanImgs[i].sortOrder = i + 1;
          }
          p.images = cleanImgs;
        }
      }
    });

    const deletedCategorySet = new Set(this.persistenceData.deletedCategoryIds.map(s => s.toLowerCase()));
    this.categories = this.categories.filter(c =>
      !deletedCategorySet.has(c.id.toLowerCase()) &&
      !deletedCategorySet.has(c.slug.toLowerCase()) &&
      !deletedCategorySet.has(c.name.toLowerCase())
    );
    const catMap = new Map<string, Category>();
    for (const c of this.categories) {
      catMap.set(c.id, c);
    }
    for (const [id, override] of Object.entries(this.persistenceData.categoryOverrides)) {
      if (deletedCategorySet.has(id.toLowerCase()) || (override.slug && deletedCategorySet.has(override.slug.toLowerCase()))) continue;
      if (catMap.has(id)) {
        catMap.set(id, { ...catMap.get(id)!, ...override });
      } else {
        catMap.set(id, override);
      }
    }
    this.categories = Array.from(catMap.values());

    this.categories.forEach(cat => {
      cat.productCount = this.products.filter(p =>
        p.categorySlug === cat.slug || p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
    });

    const brandsById = new Map<string, Brand>();
    const brandLookup = new Map<string, string>();
    const deletedBrandSet = new Set(this.persistenceData.deletedBrandIds.map(s => s.toLowerCase()));

    const registerLookup = (brand: Brand) => {
      if (deletedBrandSet.has(brand.id.toLowerCase()) || deletedBrandSet.has(brand.slug.toLowerCase()) || deletedBrandSet.has(brand.name.toLowerCase())) {
        return;
      }
      brandsById.set(brand.id, brand);
      brandLookup.set(brand.id.toLowerCase(), brand.id);
      brandLookup.set(brand.name.toLowerCase(), brand.id);
      brandLookup.set(brand.slug.toLowerCase(), brand.id);

      const stripped = brand.name
        .toLowerCase()
        .replace(/\s+(hookah|tobacco|bowls|bowl|vapes|vape|charcoal|crystal|accessories|coals)$/i, '')
        .trim();
      if (stripped) {
        brandLookup.set(stripped, brand.id);
      }

      const idRoot = brand.id.replace(/^brand-/, '').toLowerCase();
      if (idRoot) {
        brandLookup.set(idRoot, brand.id);
      }
    };

    INITIAL_BRANDS.forEach(b => {
      registerLookup({ ...b, productCount: 0 });
    });

    this.products.forEach(p => {
      const bName = (p.brand || 'Fumare Hookah').trim();
      const slug = p.brandSlug || bName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const brandId = `brand-${slug}`;
      const searchKey = bName.toLowerCase();
      const strippedSearchKey = searchKey
        .replace(/\s+(hookah|tobacco|bowls|bowl|vapes|vape|charcoal|crystal|accessories|coals)$/i, '')
        .trim();

      if (deletedBrandSet.has(brandId.toLowerCase()) || deletedBrandSet.has(slug.toLowerCase()) || deletedBrandSet.has(searchKey)) {
        return;
      }

      const matchedId =
        brandLookup.get(searchKey) ||
        brandLookup.get(strippedSearchKey) ||
        brandLookup.get(slug) ||
        brandLookup.get(brandId.toLowerCase());

      if (matchedId && brandsById.has(matchedId)) {
        const brand = brandsById.get(matchedId)!;
        brand.productCount = (brand.productCount || 0) + 1;
      } else if (!brandsById.has(brandId)) {
        const newBrand: Brand = {
          id: brandId,
          name: bName,
          slug,
          origin: 'Global Artisan',
          description: `Certified authentic ${bName} merchandise, flavors, and luxury accessories.`,
          logoUrl: p.images[0]?.url || 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400',
          productCount: 1,
          isActive: true
        };
        registerLookup(newBrand);
      } else {
        const brand = brandsById.get(brandId)!;
        brand.productCount = (brand.productCount || 0) + 1;
      }
    });

    for (const [id, override] of Object.entries(this.persistenceData.brandOverrides)) {
      if (deletedBrandSet.has(id.toLowerCase()) || (override.slug && deletedBrandSet.has(override.slug.toLowerCase()))) continue;
      if (brandsById.has(id)) {
        brandsById.set(id, { ...brandsById.get(id)!, ...override });
      } else {
        registerLookup(override);
      }
    }

    this.brands = Array.from(brandsById.values())
      .filter(b => !deletedBrandSet.has(b.id.toLowerCase()) && !deletedBrandSet.has(b.slug.toLowerCase()))
      .sort((a, b) => b.productCount - a.productCount);

    const deletedCouponSet = new Set(this.persistenceData.deletedCouponIds);
    this.coupons = [...INITIAL_COUPONS].filter(c => !deletedCouponSet.has(c.id));
    const couponMap = new Map<string, Coupon>();
    for (const c of this.coupons) {
      couponMap.set(c.id, c);
    }
    for (const [id, override] of Object.entries(this.persistenceData.couponOverrides)) {
      if (deletedCouponSet.has(id)) continue;
      couponMap.set(id, override);
    }
    this.coupons = Array.from(couponMap.values());

    this.reviews = [...INITIAL_REVIEWS];
    this.settings = { ...DEFAULT_SETTINGS };
    if (this.persistenceData.settingsOverride) {
      this.settings = { ...this.settings, ...this.persistenceData.settingsOverride };
    }

    this.seedDefaultUsers();

    this.addresses = [
      {
        id: 'addr-1',
        userId: 'usr-customer-1',
        fullName: 'Julian Vance',
        addressLine1: '742 Evergreen Terrace',
        addressLine2: 'Apt 4B',
        city: 'Beverly Hills',
        state: 'CA',
        postalCode: '90210',
        country: 'United States',
        phone: '+1 (555) 219-4402',
        isDefault: true
      }
    ];

    this.orders = [
      {
        id: 'ord-1001',
        orderNumber: 'SLT-2026-1001',
        userId: 'usr-customer-1',
        customerName: 'Julian Vance',
        customerEmail: 'customer@example.com',
        customerPhone: '+1 (555) 219-4402',
        items: [
          {
            productId: 'prod-wookah-oak-crystal',
            productName: 'Wookah Masterpiece Oak with Olives Crystal Base',
            productSku: 'WKH-OAK-01',
            productImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400&auto=format&fit=crop',
            price: 449.00,
            quantity: 1,
            subtotal: 449.00
          },
          {
            productId: 'prod-tangiers-cane-mint',
            productName: 'Tangiers Noir Cane Mint (250g)',
            productSku: 'TNG-NOIR-CM250',
            productImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400&auto=format&fit=crop',
            price: 24.99,
            quantity: 2,
            subtotal: 49.98
          }
        ],
        shippingAddress: this.addresses[0],
        billingAddress: this.addresses[0],
        subtotal: 498.98,
        discount: 0,
        shippingFee: 0,
        tax: 42.41,
        total: 541.39,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PAID',
        paymentIntentId: 'pi_test_392817293817',
        orderStatus: 'DELIVERED',
        trackingNumber: '1Z9999999999999999',
        carrier: 'UPS Express 2-Day Air',
        timeline: [
          { status: 'PLACED', timestamp: '2026-02-01T14:30:00Z', note: 'Customer placed order online', actor: 'Julian Vance' },
          { status: 'PAYMENT_CONFIRMED', timestamp: '2026-02-01T14:31:00Z', note: 'Stripe payment intent confirmed', actor: 'System' },
          { status: 'PROCESSING', timestamp: '2026-02-01T15:00:00Z', note: 'Order sent to luxury fulfillment center', actor: 'Dmitri Volkov' },
          { status: 'PACKED', timestamp: '2026-02-01T17:30:00Z', note: 'Custom double-boxed with anti-break foam', actor: 'Warehouse Team' },
          { status: 'SHIPPED', timestamp: '2026-02-02T09:00:00Z', note: 'Dispatched via UPS Express Air', actor: 'UPS Carrier' },
          { status: 'DELIVERED', timestamp: '2026-02-04T13:45:00Z', note: 'Signed for by resident (Age 21+ Verified ID)', actor: 'UPS Driver' }
        ],
        createdAt: '2026-02-01T14:30:00Z',
        updatedAt: '2026-02-04T13:45:00Z'
      }
    ];

    const deletedUserSet = new Set(this.persistenceData.deletedUserIds);
    this.users = this.users.filter(u => !deletedUserSet.has(u.id));

    this.isInitialized = true;

    // Connect to MongoDB and synchronize overrides
    mongoService.connect().then(connected => {
      if (connected) {
        mongoService.syncWithStore(this).catch(err => {
          console.warn('[Store] MongoDB background hydration error:', err);
        });
      }
    }).catch(() => {});
  }

  // Durable Storage Persistence with guaranteed Promise resolution
  public async persist<T extends { id?: string }>(collection: string, doc: T): Promise<void> {
    if (!doc) return;
    const id = (doc as any).id || (doc as any).code || (doc as any).orderNumber;

    if (collection === 'products' && id) {
      const p = doc as any as Product;
      this.persistenceData.deletedProductIds = this.persistenceData.deletedProductIds.filter(pid => pid.toLowerCase() !== id.toLowerCase());
      const existing = this.persistenceData.productOverrides[id] || {};
      this.persistenceData.productOverrides[id] = { ...existing, ...p };
      const idx = this.products.findIndex(item => item.id === id);
      if (idx !== -1) {
        this.products[idx] = { ...this.products[idx], ...p };
      } else {
        this.products.unshift(p);
      }
    } else if (collection === 'categories' && id) {
      const c = doc as any as Category;
      this.persistenceData.deletedCategoryIds = this.persistenceData.deletedCategoryIds.filter(cid => {
        const lower = cid.toLowerCase();
        return lower !== id.toLowerCase() && (!c.slug || lower !== c.slug.toLowerCase()) && (!c.name || lower !== c.name.toLowerCase());
      });
      const existing = this.persistenceData.categoryOverrides[id] || {};
      this.persistenceData.categoryOverrides[id] = { ...existing, ...c };
      const idx = this.categories.findIndex(item => item.id === id || (c.slug && item.slug === c.slug));
      if (idx !== -1) {
        this.categories[idx] = { ...this.categories[idx], ...c };
      } else {
        this.categories.push(c);
      }
    } else if (collection === 'brands' && id) {
      const b = doc as any as Brand;
      this.persistenceData.deletedBrandIds = this.persistenceData.deletedBrandIds.filter(bid => {
        const lower = bid.toLowerCase();
        return lower !== id.toLowerCase() && (!b.slug || lower !== b.slug.toLowerCase()) && (!b.name || lower !== b.name.toLowerCase());
      });
      const existing = this.persistenceData.brandOverrides[id] || {};
      this.persistenceData.brandOverrides[id] = { ...existing, ...b };
      const idx = this.brands.findIndex(item => item.id === id || (b.slug && item.slug === b.slug));
      if (idx !== -1) {
        this.brands[idx] = { ...this.brands[idx], ...b };
      } else {
        this.brands.push(b);
      }
    } else if (collection === 'coupons' && id) {
      const cpn = doc as any as Coupon;
      this.persistenceData.deletedCouponIds = this.persistenceData.deletedCouponIds.filter(cid => cid !== id);
      this.persistenceData.couponOverrides[id] = cpn;
      const idx = this.coupons.findIndex(item => item.id === id);
      if (idx !== -1) {
        this.coupons[idx] = { ...this.coupons[idx], ...cpn };
      } else {
        this.coupons.unshift(cpn);
      }
    } else if (collection === 'orders' && id) {
      const o = doc as any as Order;
      this.persistenceData.orderOverrides[id] = o;
      const idx = this.orders.findIndex(item => item.id === id || (o.orderNumber && item.orderNumber === o.orderNumber));
      if (idx !== -1) {
        this.orders[idx] = { ...this.orders[idx], ...o };
      } else {
        this.orders.unshift(o);
      }
    } else if (collection === 'settings') {
      this.persistenceData.settingsOverride = { ...this.settings, ...(doc as any) };
      this.settings = { ...this.settings, ...(doc as any) };
    } else if (collection === 'users' && id) {
      const u = doc as any as User;
      this.persistenceData.deletedUserIds = this.persistenceData.deletedUserIds.filter(uid => uid !== id);
      this.persistenceData.userOverrides[id] = u;
      const idx = this.users.findIndex(item => item.id === id);
      if (idx !== -1) {
        this.users[idx] = { ...this.users[idx], ...u };
      } else {
        this.users.push(u);
      }
    }

    await this.savePersistence();

    try {
      if (mongoService.getStatus().isConnected) {
        await mongoService.saveDocument(collection, doc);
      }
    } catch (err) {
      console.warn(`[Store] Direct MongoDB write failed for ${collection}:`, err);
    }
  }

  public async deletePersisted(collection: string, filter: Record<string, any>): Promise<void> {
    const id = filter?.id;
    const slug = filter?.slug;
    const name = filter?.name;

    if (collection === 'products' && id) {
      if (!this.persistenceData.deletedProductIds.includes(id)) {
        this.persistenceData.deletedProductIds.push(id);
      }
      delete this.persistenceData.productOverrides[id];
      this.products = this.products.filter(p => p.id !== id);
    } else if (collection === 'categories' && (id || slug || name)) {
      const keysToAdd = [id, slug, name].filter(Boolean) as string[];
      for (const k of keysToAdd) {
        if (!this.persistenceData.deletedCategoryIds.includes(k)) {
          this.persistenceData.deletedCategoryIds.push(k);
        }
        const lower = k.toLowerCase();
        if (!this.persistenceData.deletedCategoryIds.includes(lower)) {
          this.persistenceData.deletedCategoryIds.push(lower);
        }
        const asSlug = lower.replace(/[^a-z0-9]+/g, '-');
        if (asSlug && !this.persistenceData.deletedCategoryIds.includes(asSlug)) {
          this.persistenceData.deletedCategoryIds.push(asSlug);
        }
      }
      if (id) delete this.persistenceData.categoryOverrides[id];
      this.categories = this.categories.filter(c =>
        !this.isCategoryDeleted(c.id) &&
        !this.isCategoryDeleted(c.slug) &&
        !this.isCategoryDeleted(c.name)
      );
    } else if (collection === 'brands' && (id || slug || name)) {
      const keysToAdd = [id, slug, name].filter(Boolean) as string[];
      for (const k of keysToAdd) {
        if (!this.persistenceData.deletedBrandIds.includes(k)) {
          this.persistenceData.deletedBrandIds.push(k);
        }
        const lower = k.toLowerCase();
        if (!this.persistenceData.deletedBrandIds.includes(lower)) {
          this.persistenceData.deletedBrandIds.push(lower);
        }
        const asSlug = lower.replace(/[^a-z0-9]+/g, '-');
        if (asSlug && !this.persistenceData.deletedBrandIds.includes(asSlug)) {
          this.persistenceData.deletedBrandIds.push(asSlug);
        }
      }
      if (id) delete this.persistenceData.brandOverrides[id];
      this.brands = this.brands.filter(b =>
        !this.isBrandDeleted(b.id) &&
        !this.isBrandDeleted(b.slug) &&
        !this.isBrandDeleted(b.name)
      );
    } else if (collection === 'coupons' && id) {
      if (!this.persistenceData.deletedCouponIds.includes(id)) {
        this.persistenceData.deletedCouponIds.push(id);
      }
      delete this.persistenceData.couponOverrides[id];
      this.coupons = this.coupons.filter(c => c.id !== id);
    } else if (collection === 'users' && id) {
      if (!this.persistenceData.deletedUserIds.includes(id)) {
        this.persistenceData.deletedUserIds.push(id);
      }
      delete this.persistenceData.userOverrides[id];
      this.users = this.users.filter(u => u.id !== id);
    }

    await this.savePersistence();

    try {
      if (mongoService.getStatus().isConnected) {
        await mongoService.deleteDocument(collection, filter);
      }
    } catch (err) {
      console.warn(`[Store] Direct MongoDB deletion failed for ${collection}:`, err);
    }
  }

  public logAudit(actor: { id: string; name: string; role: string; ip?: string }, action: string, resource: string, resourceId?: string, details?: Record<string, any>) {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: actor.id,
      userName: actor.name,
      userRole: actor.role,
      action,
      resource,
      resourceId,
      ipAddress: actor.ip || '127.0.0.1',
      details,
      createdAt: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    this.persist('auditLogs', entry).catch(() => {});
    return entry;
  }

  public createNotification(type: AdminNotification['type'], title: string, message: string, link?: string) {
    const notif: AdminNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      link,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.persist('notifications', notif).catch(() => {});
    return notif;
  }
}

export const db = new DatabaseStore();

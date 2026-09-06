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

interface StoredOTP {
  identifier: string; // email or phone
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

function loadSplitCatalog(): Product[] {
  const products: Product[] = [];
  const knownBrands = ['Al Fakher', 'Alpha Hookah', 'Blackburn', 'Bonche', 'Element', 'Adalya', 'Tangiers', 'MustHave', 'DarkSide', 'Trifecta', 'Fumari', 'Starbuzz', 'Mason', 'Steamulation', 'Vyro', 'Moze', 'Kaloud', 'Werkbund', 'Oblako', 'Maklaud'];

  for (let partNumber = 1; partNumber <= 6; partNumber++) {
    const catalogPath = path.join(process.cwd(), `src/server/db/products-${partNumber}.json`);
    if (!fs.existsSync(catalogPath)) continue;

    try {
      const rawProducts = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      if (!Array.isArray(rawProducts)) continue;

      for (const rawProduct of rawProducts) {
        const name = catalogText(rawProduct.product_name || rawProduct.name);
        const sourceUrl = catalogText(rawProduct.product_url || rawProduct.url);
        if (!name && !sourceUrl) continue;

        const categoryText = catalogText(rawProduct.category);
        const category = categoryText || (/e-?hookah|electronic hookah|hookah pod/i.test(`${name} ${sourceUrl}`) ? 'E-Hookah' : /vape|puff|nicotine|pod system|disposable/i.test(`${name} ${sourceUrl}`) ? 'Vapes' : /charcoal|coconut coal|quick light/i.test(`${name} ${sourceUrl}`) ? 'Coal' : /tobacco|shisha|molasses/i.test(`${name} ${sourceUrl}`) ? 'Tobacco' : 'Accessories');
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

  private isInitialized = false;

  constructor() {
    this.seedDefaultUsers();
    this.init();
  }

  public seedDefaultUsers() {
    if (this.users && this.users.length > 0) return;

    const superAdminPasswordHash = bcrypt.hashSync('Admin123!', 10);
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

    // Load full authentic product catalog
    let catalogProducts: Product[] = loadSplitCatalog();
    if (catalogProducts.length > 0) {
      console.log(`[Store] Loaded ${catalogProducts.length} products from split catalogs.`);
    }
    try {
      const catalogPath = path.join(process.cwd(), 'src/server/db/scrapedProducts.json');
      if (fs.existsSync(catalogPath)) {
        const fileData = fs.readFileSync(catalogPath, 'utf8');
        const scrapedProducts: Product[] = JSON.parse(fileData);
        catalogProducts = [...catalogProducts, ...scrapedProducts];
        console.log(`[Store] Loaded ${scrapedProducts.length} authentic products from catalog.`);
      }
    } catch (e) {
      console.warn('[Store] Could not load scrapedProducts.json:', e);
    }

    // Merge INITIAL_PRODUCTS and catalogProducts, prioritizing enriched catalog and deduplicating by ID
    const productMap = new Map<string, Product>();
    for (const p of INITIAL_PRODUCTS) {
      productMap.set(p.id, p);
    }
    for (const p of catalogProducts) {
      productMap.set(p.id, p);
    }
    this.products = Array.from(productMap.values());
    console.log(`[Store] Master catalog initialized with ${this.products.length} products.`);

    // Sanitize image URLs (strip broken -916x916 WordPress thumbnails and deduplicate)
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

    // Compute dynamic product counts for categories
    this.categories.forEach(cat => {
      cat.productCount = this.products.filter(p =>
        p.categorySlug === cat.slug || p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
    });

    // Populate and compute brand catalog with strict deduplication
    const brandsById = new Map<string, Brand>();
    const brandLookup = new Map<string, string>(); // alias / name / slug / root -> brand.id

    const registerLookup = (brand: Brand) => {
      brandsById.set(brand.id, brand);
      brandLookup.set(brand.id.toLowerCase(), brand.id);
      brandLookup.set(brand.name.toLowerCase(), brand.id);
      brandLookup.set(brand.slug.toLowerCase(), brand.id);

      // Normalized base name without common category suffixes
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

      // Find matching brand by name, slug, brandId, or stripped root
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

    this.brands = Array.from(brandsById.values()).sort((a, b) => b.productCount - a.productCount);

    this.coupons = [...INITIAL_COUPONS];
    this.reviews = [...INITIAL_REVIEWS];
    this.settings = { ...DEFAULT_SETTINGS };

    // Initialize media library with high res assets
    this.mediaLibrary = [
      { id: 'med-1', url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop', alt: 'Luxury Shisha Stainless Steel Studio Photo', category: 'Products', size: '1.4 MB', createdAt: new Date().toISOString() },
      { id: 'med-2', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop', alt: 'Bohemian Cut Crystal Shisha Base', category: 'Bases', size: '1.8 MB', createdAt: new Date().toISOString() },
      { id: 'med-3', url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop', alt: 'Artisan Dark Leaf Shisha Tobacco Leaf', category: 'Tobacco', size: '2.1 MB', createdAt: new Date().toISOString() },
      { id: 'med-4', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop', alt: 'Stoneware Handthrown Hookah Bowl Phunnel', category: 'Bowls', size: '1.1 MB', createdAt: new Date().toISOString() },
      { id: 'med-5', url: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1200&auto=format&fit=crop', alt: 'Organic Coconut Charcoal Coals Glowing', category: 'Charcoal', size: '1.6 MB', createdAt: new Date().toISOString() },
      { id: 'med-6', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop', alt: 'Silver Heat Management Device', category: 'Accessories', size: '980 KB', createdAt: new Date().toISOString() }
    ];

    // Seed default administrative users and demo customer if not already seeded
    this.seedDefaultUsers();

    // Seed addresses for demo customer
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

    // Seed initial orders for demonstration
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
      },
      {
        id: 'ord-1002',
        orderNumber: 'SLT-2026-1002',
        userId: 'usr-customer-1',
        customerName: 'Julian Vance',
        customerEmail: 'customer@example.com',
        customerPhone: '+1 (555) 219-4402',
        items: [
          {
            productId: 'prod-kaloud-lotus-plus',
            productName: 'Kaloud Lotus I+ Heat Management Device (Silver Nectar)',
            productSku: 'KLD-LOT-SLV',
            productImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop',
            price: 54.95,
            quantity: 1,
            subtotal: 54.95
          },
          {
            productId: 'prod-alpaca-symphony',
            productName: 'Alpaca Symphony Hand-Thrown Clay Phunnel Bowl',
            productSku: 'ALP-BOWL-SYM',
            productImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400&auto=format&fit=crop',
            price: 29.99,
            quantity: 1,
            subtotal: 29.99
          },
          {
            productId: 'prod-cocourth-cubes-26mm',
            productName: 'CocoUrth 100% Organic Coconut Charcoal (26mm Cubes - 1kg)',
            productSku: 'COCO-26MM-1KG',
            productImage: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=400&auto=format&fit=crop',
            price: 14.50,
            quantity: 2,
            subtotal: 29.00
          }
        ],
        shippingAddress: this.addresses[0],
        billingAddress: this.addresses[0],
        subtotal: 113.94,
        discount: 17.09,
        couponCode: 'WELCOME15',
        shippingFee: 0,
        tax: 8.23,
        total: 105.08,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PAID',
        orderStatus: 'PROCESSING',
        timeline: [
          { status: 'PLACED', timestamp: '2026-02-26T10:15:00Z', note: 'Customer applied coupon WELCOME15' },
          { status: 'PAYMENT_CONFIRMED', timestamp: '2026-02-26T10:16:00Z', note: 'Stripe charge verified' },
          { status: 'PROCESSING', timestamp: '2026-02-26T11:00:00Z', note: 'Fragile packing in progress' }
        ],
        createdAt: '2026-02-26T10:15:00Z',
        updatedAt: '2026-02-26T11:00:00Z'
      },
      {
        id: 'ord-1003',
        orderNumber: 'SLT-2026-1003',
        userId: 'usr-customer-1',
        customerName: 'Julian Vance',
        customerEmail: 'customer@example.com',
        customerPhone: '+1 (555) 219-4402',
        items: [
          {
            productId: 'prod-steamulation-pro-x-iii',
            productName: 'Steamulation Pro X III Platinum Metallic Shisha',
            productSku: 'STM-PRO-X3',
            productImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400&auto=format&fit=crop',
            price: 529.00,
            quantity: 1,
            subtotal: 529.00
          },
          {
            productId: 'prod-darkside-core-cola',
            productName: 'Darkside Core Supernova & Falling Star (200g)',
            productSku: 'DKS-CORE-COLA',
            productImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400&auto=format&fit=crop',
            price: 26.50,
            quantity: 2,
            subtotal: 53.00
          }
        ],
        shippingAddress: this.addresses[0],
        billingAddress: this.addresses[0],
        subtotal: 582.00,
        discount: 0,
        shippingFee: 0,
        tax: 49.47,
        total: 631.47,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PAID',
        paymentIntentId: 'pi_test_983719283719',
        orderStatus: 'SHIPPED',
        trackingNumber: '9400111899223397612345',
        carrier: 'FedEx Priority Overnight',
        timeline: [
          { status: 'PLACED', timestamp: '2026-03-01T09:20:00Z', note: 'Priority expedited order confirmed', actor: 'Julian Vance' },
          { status: 'PAYMENT_CONFIRMED', timestamp: '2026-03-01T09:21:00Z', note: 'Payment verified via Stripe', actor: 'System' },
          { status: 'PROCESSING', timestamp: '2026-03-01T10:30:00Z', note: 'Packed with luxury impact-resistant casing', actor: 'Warehouse Tech' },
          { status: 'SHIPPED', timestamp: '2026-03-02T14:15:00Z', note: 'Picked up by FedEx Express courier. In transit to regional hub.', actor: 'FedEx Memphis Hub' }
        ],
        createdAt: '2026-03-01T09:20:00Z',
        updatedAt: '2026-03-02T14:15:00Z'
      },
      {
        id: 'ord-1004',
        orderNumber: 'SLT-2026-1004',
        userId: 'usr-customer-1',
        customerName: 'Julian Vance',
        customerEmail: 'customer@example.com',
        customerPhone: '+1 (555) 219-4402',
        items: [
          {
            productId: 'prod-wookah-classic-walnut',
            productName: 'Wookah Classic Walnut Hookah Body & Crystal Vase',
            productSku: 'WKH-WLN-02',
            productImage: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=400&auto=format&fit=crop',
            price: 395.00,
            quantity: 1,
            subtotal: 395.00
          }
        ],
        shippingAddress: this.addresses[0],
        billingAddress: this.addresses[0],
        subtotal: 395.00,
        discount: 25.00,
        shippingFee: 0,
        tax: 31.45,
        total: 401.45,
        paymentMethod: 'STRIPE',
        paymentStatus: 'PAID',
        paymentIntentId: 'pi_test_102938475612',
        orderStatus: 'OUT_FOR_DELIVERY',
        trackingNumber: 'DHL9823410948',
        carrier: 'DHL Express Worldwide Air',
        timeline: [
          { status: 'PLACED', timestamp: '2026-03-02T08:00:00Z', note: 'Order placed by client', actor: 'Julian Vance' },
          { status: 'PAYMENT_CONFIRMED', timestamp: '2026-03-02T08:01:00Z', note: 'Payment processed', actor: 'System' },
          { status: 'PROCESSING', timestamp: '2026-03-02T09:30:00Z', note: 'Quality check completed', actor: 'Dmitri Volkov' },
          { status: 'SHIPPED', timestamp: '2026-03-03T11:00:00Z', note: 'Departed sorting facility in Cincinnati', actor: 'DHL Air Logistics' },
          { status: 'OUT_FOR_DELIVERY', timestamp: '2026-03-04T07:45:00Z', note: 'With courier for final delivery today before 5:00 PM. Signature required.', actor: 'DHL Courier' }
        ],
        createdAt: '2026-03-02T08:00:00Z',
        updatedAt: '2026-03-04T07:45:00Z'
      }
    ];

    // Seed sample wholesale applications
    this.wholesaleApplications = [
      {
        id: 'whs-1',
        companyName: 'Lounge Mirage Shisha & Cocktails',
        contactName: 'Karim Al-Hassan',
        email: 'karim@loungemirage.com',
        phone: '+1 (310) 882-9900',
        businessType: 'LOUNGE',
        taxId: 'US-94829104',
        website: 'https://loungemirage.com',
        estimatedMonthlyVolume: '$5,000 - $10,000',
        notes: 'Premium hookah lounge in West Hollywood seeking monthly 50kg dark leaf supply and 10x custom stainless hookahs.',
        status: 'PENDING',
        createdAt: '2026-02-20T16:00:00Z',
        updatedAt: '2026-02-20T16:00:00Z'
      }
    ];

    // Seed system audit log entries
    this.auditLogs = [
      {
        id: 'aud-1',
        userId: 'usr-super-admin-1',
        userName: 'Farhan Al-Mansoor',
        userRole: 'SUPER_ADMIN',
        action: 'SYSTEM_BOOTSTRAP',
        resource: 'PLATFORM',
        ipAddress: '127.0.0.1',
        details: { message: 'Initialized Sultan Hookah enterprise catalog, RBAC system, and permission matrices.' },
        createdAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'aud-2',
        userId: 'usr-product-manager-1',
        userName: 'Dmitri Volkov',
        userRole: 'PRODUCT_MANAGER',
        action: 'PRODUCT_PUBLISHED',
        resource: 'PRODUCT',
        resourceId: 'prod-wookah-oak-crystal',
        ipAddress: '192.168.1.45',
        details: { sku: 'WKH-OAK-01', price: 449.00 },
        createdAt: '2026-01-10T12:00:00Z'
      }
    ];

    this.notifications = [
      {
        id: 'notif-1',
        type: 'ORDER',
        title: 'New High-Value Order',
        message: 'Order #SLT-2026-1002 received for $105.08',
        link: '/admin/orders',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif-2',
        type: 'WHOLESALE',
        title: 'New B2B Lounge Application',
        message: 'Lounge Mirage Shisha & Cocktails applied for wholesale tier.',
        link: '/admin/wholesale',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    this.isInitialized = true;

    // Asynchronously connect to MongoDB and sync all collections
    setTimeout(() => {
      mongoService.syncWithStore(this).catch(() => {});
    }, 100);
  }

  // MongoDB Write-Through Persistence
  public persist<T extends { id?: string }>(collection: string, doc: T) {
    if (mongoService.getStatus().isConnected) {
      mongoService.saveDocument(collection, doc).catch(() => {});
    }
  }

  public deletePersisted(collection: string, filter: Record<string, any>) {
    if (mongoService.getStatus().isConnected) {
      mongoService.deleteDocument(collection, filter).catch(() => {});
    }
  }

  // Audit Logging helper
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
    return entry;
  }

  // Notification helper
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
    return notif;
  }
}

export const db = new DatabaseStore();

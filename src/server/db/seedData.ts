import {
  Role,
  Permission,
  Category,
  Brand,
  Product,
  StoreSettings,
  User,
  Coupon,
  Review
} from '../../types/index.js';

export const DEFAULT_PERMISSIONS: Permission[] = [
  // Dashboard
  { id: 'p1', key: 'dashboard.view', name: 'View Dashboard', category: 'Dashboard', description: 'Access admin overview dashboard and widgets' },

  // Products
  { id: 'p2', key: 'products.view', name: 'View Products', category: 'Products', description: 'Browse and view product catalog details' },
  { id: 'p3', key: 'products.create', name: 'Create Products', category: 'Products', description: 'Add new products and variants' },
  { id: 'p4', key: 'products.update', name: 'Edit Products', category: 'Products', description: 'Modify pricing, description, and specs' },
  { id: 'p5', key: 'products.delete', name: 'Delete Products', category: 'Products', description: 'Remove or archive products' },
  { id: 'p6', key: 'products.publish', name: 'Publish Products', category: 'Products', description: 'Toggle live storefront visibility' },
  { id: 'p7', key: 'products.import', name: 'Import Products', category: 'Products', description: 'Bulk CSV catalog import' },
  { id: 'p8', key: 'products.export', name: 'Export Products', category: 'Products', description: 'Export catalog to CSV' },

  // Categories & Brands
  { id: 'p9', key: 'categories.view', name: 'View Categories', category: 'Categories', description: 'View product categories' },
  { id: 'p10', key: 'categories.create', name: 'Create Categories', category: 'Categories', description: 'Add new categories' },
  { id: 'p11', key: 'categories.update', name: 'Edit Categories', category: 'Categories', description: 'Update category details' },
  { id: 'p12', key: 'categories.delete', name: 'Delete Categories', category: 'Categories', description: 'Delete categories' },

  { id: 'p13', key: 'brands.view', name: 'View Brands', category: 'Brands', description: 'View brand directory' },
  { id: 'p14', key: 'brands.create', name: 'Create Brands', category: 'Brands', description: 'Add new brands' },
  { id: 'p15', key: 'brands.update', name: 'Edit Brands', category: 'Brands', description: 'Update brand details' },
  { id: 'p16', key: 'brands.delete', name: 'Delete Brands', category: 'Brands', description: 'Delete brands' },

  // Orders
  { id: 'p17', key: 'orders.view', name: 'View Orders', category: 'Orders', description: 'View customer orders and history' },
  { id: 'p18', key: 'orders.update', name: 'Update Orders', category: 'Orders', description: 'Change status, update tracking numbers' },
  { id: 'p19', key: 'orders.cancel', name: 'Cancel Orders', category: 'Orders', description: 'Cancel open orders' },
  { id: 'p20', key: 'orders.refund', name: 'Process Refunds', category: 'Orders', description: 'Issue refunds through payment processor' },
  { id: 'p21', key: 'orders.export', name: 'Export Orders', category: 'Orders', description: 'Export orders to CSV' },

  // Customers
  { id: 'p22', key: 'customers.view', name: 'View Customers', category: 'Customers', description: 'View customer accounts and spending' },
  { id: 'p23', key: 'customers.create', name: 'Create Customers', category: 'Customers', description: 'Manually register customer accounts' },
  { id: 'p24', key: 'customers.update', name: 'Edit Customers', category: 'Customers', description: 'Update customer profiles' },
  { id: 'p25', key: 'customers.delete', name: 'Delete Customers', category: 'Customers', description: 'Remove customer accounts' },
  { id: 'p26', key: 'customers.suspend', name: 'Suspend Customers', category: 'Customers', description: 'Ban or suspend customer access' },

  // Inventory
  { id: 'p27', key: 'inventory.view', name: 'View Inventory', category: 'Inventory', description: 'View stock levels & low stock alerts' },
  { id: 'p28', key: 'inventory.update', name: 'Update Inventory', category: 'Inventory', description: 'Edit stock quantities' },
  { id: 'p29', key: 'inventory.adjust', name: 'Adjust Stock with Audit', category: 'Inventory', description: 'Perform manual stock adjustments' },

  // Coupons
  { id: 'p30', key: 'coupons.view', name: 'View Coupons', category: 'Coupons', description: 'View discount codes' },
  { id: 'p31', key: 'coupons.create', name: 'Create Coupons', category: 'Coupons', description: 'Create discount codes' },
  { id: 'p32', key: 'coupons.update', name: 'Edit Coupons', category: 'Coupons', description: 'Update coupon properties' },
  { id: 'p33', key: 'coupons.delete', name: 'Delete Coupons', category: 'Coupons', description: 'Remove coupons' },

  // Reviews
  { id: 'p34', key: 'reviews.view', name: 'View Reviews', category: 'Reviews', description: 'Read customer reviews' },
  { id: 'p35', key: 'reviews.moderate', name: 'Moderate Reviews', category: 'Reviews', description: 'Approve, reject, or hide reviews' },
  { id: 'p36', key: 'reviews.delete', name: 'Delete Reviews', category: 'Reviews', description: 'Permanently remove reviews' },

  // Media
  { id: 'p37', key: 'media.view', name: 'View Media', category: 'Media', description: 'Browse uploaded image library' },
  { id: 'p38', key: 'media.upload', name: 'Upload Media', category: 'Media', description: 'Upload product & category photography' },
  { id: 'p39', key: 'media.update', name: 'Edit Media', category: 'Media', description: 'Update media alt text and properties' },
  { id: 'p40', key: 'media.delete', name: 'Delete Media', category: 'Media', description: 'Delete images from storage' },

  // Wholesale
  { id: 'p41', key: 'wholesale.view', name: 'View Wholesale', category: 'Wholesale', description: 'View B2B partner applications' },
  { id: 'p42', key: 'wholesale.update', name: 'Edit Wholesale', category: 'Wholesale', description: 'Update application details and notes' },
  { id: 'p43', key: 'wholesale.approve', name: 'Approve Wholesale', category: 'Wholesale', description: 'Approve or reject wholesale accounts' },

  // Staff & Roles
  { id: 'p44', key: 'staff.view', name: 'View Staff', category: 'Staff', description: 'View admin users and staff roster' },
  { id: 'p45', key: 'staff.create', name: 'Create Staff', category: 'Staff', description: 'Invite new staff members' },
  { id: 'p46', key: 'staff.update', name: 'Edit Staff', category: 'Staff', description: 'Change roles and permissions' },
  { id: 'p47', key: 'staff.suspend', name: 'Suspend Staff', category: 'Staff', description: 'Suspend staff members' },
  { id: 'p48', key: 'staff.delete', name: 'Delete Staff', category: 'Staff', description: 'Remove staff members' },

  { id: 'p49', key: 'roles.view', name: 'View Roles', category: 'Roles', description: 'View system and custom roles' },
  { id: 'p50', key: 'roles.create', name: 'Create Roles', category: 'Roles', description: 'Create custom roles' },
  { id: 'p51', key: 'roles.update', name: 'Edit Roles', category: 'Roles', description: 'Update role permissions' },
  { id: 'p52', key: 'roles.delete', name: 'Delete Roles', category: 'Roles', description: 'Delete custom roles' },

  // Settings, Analytics & Audit
  { id: 'p53', key: 'settings.view', name: 'View Settings', category: 'Settings', description: 'View store configurations' },
  { id: 'p54', key: 'settings.update', name: 'Update Settings', category: 'Settings', description: 'Modify global store settings' },
  { id: 'p55', key: 'analytics.view', name: 'View Analytics', category: 'Analytics', description: 'Access revenue and customer analytics' },
  { id: 'p56', key: 'audit_logs.view', name: 'View Audit Logs', category: 'Audit Logs', description: 'Inspect immutable system audit logs' }
];

const allPermissionKeys = DEFAULT_PERMISSIONS.map(p => p.key);

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    code: 'SUPER_ADMIN',
    description: 'Full unrestricted access to all platform systems, permissions, finances, and staff management.',
    isSystem: true,
    permissions: allPermissionKeys,
    userCount: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'role-admin',
    name: 'Administrator',
    code: 'ADMIN',
    description: 'Executive management across store operations, inventory, customers, and analytics.',
    isSystem: true,
    permissions: allPermissionKeys.filter(k => !k.startsWith('roles.') && k !== 'staff.delete'),
    userCount: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'role-manager',
    name: 'Store Manager',
    code: 'MANAGER',
    description: 'Oversees day-to-day operations, inventory, order processing, and promotions.',
    isSystem: true,
    permissions: [
      'dashboard.view', 'products.view', 'products.create', 'products.update', 'products.publish',
      'categories.view', 'categories.create', 'categories.update',
      'brands.view', 'brands.create', 'brands.update',
      'orders.view', 'orders.update', 'orders.export',
      'customers.view', 'customers.update',
      'inventory.view', 'inventory.update', 'inventory.adjust',
      'coupons.view', 'coupons.create', 'coupons.update',
      'reviews.view', 'reviews.moderate',
      'media.view', 'media.upload',
      'wholesale.view', 'wholesale.update',
      'analytics.view'
    ],
    userCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'role-product-manager',
    name: 'Product Manager',
    code: 'PRODUCT_MANAGER',
    description: 'Specialist for catalog curation, SKU specifications, photography, brands, and categories.',
    isSystem: true,
    permissions: [
      'dashboard.view', 'products.view', 'products.create', 'products.update', 'products.delete', 'products.publish', 'products.import', 'products.export',
      'categories.view', 'categories.create', 'categories.update', 'categories.delete',
      'brands.view', 'brands.create', 'brands.update', 'brands.delete',
      'media.view', 'media.upload', 'media.update', 'media.delete',
      'inventory.view', 'reviews.view', 'reviews.moderate'
    ],
    userCount: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'role-order-manager',
    name: 'Fulfillment & Order Manager',
    code: 'ORDER_MANAGER',
    description: 'Fulfills incoming orders, updates courier tracking codes, and handles returns.',
    isSystem: true,
    permissions: [
      'dashboard.view', 'orders.view', 'orders.update', 'orders.cancel', 'orders.refund', 'orders.export',
      'inventory.view', 'inventory.update', 'customers.view'
    ],
    userCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'role-customer-support',
    name: 'Customer Support',
    code: 'CUSTOMER_SUPPORT',
    description: 'Handles customer inquiries, reviews orders, manages contact messages and product reviews.',
    isSystem: true,
    permissions: [
      'dashboard.view', 'customers.view', 'orders.view', 'reviews.view', 'reviews.moderate',
      'products.view', 'coupons.view'
    ],
    userCount: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'role-marketing',
    name: 'Marketing Specialist',
    code: 'MARKETING',
    description: 'Designs coupons, manages campaign banners, tracks sales analytics and newsletters.',
    isSystem: true,
    permissions: [
      'dashboard.view', 'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete',
      'products.view', 'media.view', 'media.upload', 'analytics.view'
    ],
    userCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'role-inventory-manager',
    name: 'Inventory Controller',
    code: 'INVENTORY_MANAGER',
    description: 'Tracks warehouse stocks, handles write-offs, receiving, and stock reconciliations.',
    isSystem: true,
    permissions: [
      'dashboard.view', 'inventory.view', 'inventory.update', 'inventory.adjust',
      'products.view', 'orders.view'
    ],
    userCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'role-content-manager',
    name: 'Content Manager',
    code: 'CONTENT_MANAGER',
    description: 'Manages media assets, product descriptions, blogs, and marketing copy.',
    isSystem: true,
    permissions: [
      'dashboard.view', 'products.view', 'products.update',
      'categories.view', 'categories.update',
      'brands.view', 'brands.update',
      'media.view', 'media.upload', 'media.update'
    ],
    userCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'role-staff',
    name: 'General Staff',
    code: 'STAFF',
    description: 'Base read-only and basic operational permissions.',
    isSystem: true,
    permissions: ['dashboard.view', 'products.view', 'orders.view', 'inventory.view'],
    userCount: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Sultan Hookah Co.',
  supportEmail: 'concierge@sultanhookah.com',
  supportPhone: '+1 (800) 785-8260',
  currency: 'USD',
  currencySymbol: '$',
  freeShippingThreshold: 99,
  standardShippingFee: 9.99,
  taxRatePercent: 8.5,
  ageVerificationRequired: true,
  minimumPurchaseAge: 21,
  stripeEnabled: true,
  resendEnabled: true,
  smsProvider: 'twilio',
  bannerAnnouncement: 'Complimentary Express Shipping on all orders over $99 · Premium Age 21+ Verified Selection',
  maintenanceMode: false
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-hookahs',
    name: 'Hookahs',
    slug: 'hookahs',
    description: 'Precision engineered luxury hookahs crafted from aerospace-grade V2A stainless steel, precious hardwood, and artisanal crystal.',
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1600&auto=format&fit=crop',
    subcategories: ['Modern Hookahs', 'Traditional Hookahs', 'Compact & Travel', 'Luxury Wooden Hookahs', 'Custom Stainless Sets'],
    productCount: 8,
    isActive: true,
    sortOrder: 1,
    seoTitle: 'Luxury Hookahs & Modern Shisha Pipes | Sultan Hookah',
    seoDescription: 'Discover our handpicked collection of the finest European and Russian premium stainless steel hookahs.'
  },
  {
    id: 'cat-tobacco',
    name: 'Tobacco & Shisha',
    slug: 'tobacco',
    description: 'Dark leaf, blonde leaf, and premium artisanal tobacco blends cured with honey, natural molasses, and authentic flavor extracts.',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1600&auto=format&fit=crop',
    subcategories: ['Dark Leaf Tobacco', 'Blonde Leaf Tobacco', 'Fruity & Sweet', 'Mint & Cooling', 'Dessert & Spices', 'Herbal & Non-Tobacco'],
    productCount: 12,
    isActive: true,
    sortOrder: 2,
    seoTitle: 'Premium Shisha Tobacco Flavors | Darkside, Tangiers, MustHave',
    seoDescription: 'Shop premier shisha tobacco flavors with international shipping and guaranteed freshness.'
  },
  {
    id: 'cat-bowls',
    name: 'Bowls',
    slug: 'bowls',
    description: 'Hand-thrown clay, semi-porcelain, and glaze-resistant phunnel bowls engineered for even heat conduction and rich sessions.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop',
    subcategories: ['Phunnel Bowls', 'Turkish / Traditional Clay', 'Killer Bowls', 'Glazed Art Bowls'],
    productCount: 6,
    isActive: true,
    sortOrder: 3,
    seoTitle: 'Handcrafted Shisha Bowls & Phunnels | Alpaca & Werkbund',
    seoDescription: 'High thermal retention clay bowls ensuring pure flavor and dense smoke output.'
  },
  {
    id: 'cat-bases',
    name: 'Bases & Vases',
    slug: 'bases',
    description: 'Hand-blown crystal glass and heavy drop vases created by Master Glassmakers with flawless optical clarity.',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    subcategories: ['Russian Drop Bases', 'Bohemian Crystal', 'Modern Craft Glass', 'Mini Bases'],
    productCount: 4,
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'cat-coal',
    name: 'Charcoal & Heat',
    slug: 'coal',
    description: '100% organic coconut shell charcoal cubes, odorless, low-ash, and ultra-long burn duration.',
    imageUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=800&auto=format&fit=crop',
    subcategories: ['26mm Coconut Cubes', '28mm Jumbo Cubes', 'Quarter Circles for HMD', 'Charcoal Burners'],
    productCount: 4,
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Heat Management Devices (HMD), medical silicone hoses, precision tongs, mouthpieces, and molasses catchers.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
    subcategories: ['Heat Management Devices', 'Silicone Hoses & Handles', 'Precision Tongs', 'Molasses Catchers', 'Cleaning Supplies'],
    productCount: 6,
    isActive: true,
    sortOrder: 6
  },
  {
    id: 'cat-ehookah',
    name: 'E-Hookah & Electronic',
    slug: 'e-hookah',
    description: 'Electronic hookah heads and portable shisha vapor systems for seamless modern sessions.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop',
    subcategories: ['E-Heads', 'Pod Systems', 'Cartridges'],
    productCount: 3,
    isActive: true,
    sortOrder: 7
  },
  {
    id: 'cat-vapes',
    name: 'Vapes & Vaporizers',
    slug: 'vapes',
    description: 'Premium curated electronic vapor devices and salt nicotine systems.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    subcategories: ['Disposables', 'Pod Kits', 'E-Liquids'],
    productCount: 3,
    isActive: true,
    sortOrder: 8
  }
];

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-alpha',
    name: 'Alpha Hookah',
    slug: 'alpha-hookah',
    origin: 'Saint Petersburg, Russia',
    description: 'Award-winning manufacturer of the legendary Model X with iconic vertical blow-off purge technology and magnetic hose connectors.',
    logoUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-wookah',
    name: 'Wookah',
    slug: 'wookah',
    origin: 'Poland',
    description: 'Master craftsmen uniting rare exotic European woods, V2A stainless steel, and hand-cut lead-free Bohemian crystal glass.',
    logoUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop',
    productCount: 3,
    isActive: true
  },
  {
    id: 'brand-darkside',
    name: 'Darkside Tobacco',
    slug: 'darkside-tobacco',
    origin: 'Russia',
    description: 'Pioneers of unwashed boiled Burley tobacco leaf shisha offering potent strength, rich aroma retention, and heat resilience.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 6,
    isActive: true
  },
  {
    id: 'brand-tangiers',
    name: 'Tangiers',
    slug: 'tangiers',
    origin: 'San Diego, USA',
    description: 'The golden standard of dark leaf American shisha tobacco, famous for Cane Mint and distinctive Noir blends.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-musthave',
    name: 'MustHave Tobacco',
    slug: 'musthave-tobacco',
    origin: 'Russia',
    description: 'Finely cut toasted Burley blend featuring hyper-realistic fruit, berry, and dessert flavor formulations.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 5,
    isActive: true
  },
  {
    id: 'brand-kaloud',
    name: 'Kaloud',
    slug: 'kaloud',
    origin: 'Los Angeles, USA',
    description: 'Inventors of the revolutionary Lotus Heat Management Device and world-renowned Samsaris silicone-ceramic bowls.',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
    productCount: 3,
    isActive: true
  },
  {
    id: 'brand-alpaca',
    name: 'Alpaca Bowls',
    slug: 'alpaca-bowls',
    origin: 'California, USA',
    description: 'Handcrafted premium clay and semi-porcelain phunnel bowls praised worldwide by shisha connoisseurs.',
    logoUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-wookah-oak-crystal',
    name: 'Wookah Masterpiece Oak with Olives Crystal Base',
    slug: 'wookah-masterpiece-oak-crystal',
    sku: 'WKH-OAK-01',
    description: 'The epitome of European luxury shisha design. The Wookah Oak Olives features natural European oak wood reinforced with V2A surgical stainless steel tubing and a quick-lock system. Each heavy crystal base is individually hand-cut in Polish glassworks.',
    shortDescription: 'Solid natural European Oak wood, surgical stainless steel core, and hand-cut lead-free Bohemian crystal vase.',
    price: 489.00,
    salePrice: 449.00,
    currency: 'USD',
    brand: 'Wookah',
    brandSlug: 'wookah',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Luxury Wooden Hookahs',
    images: [
      {
        id: 'img-wkh-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'Wookah Masterpiece Oak Shisha in Studio Lighting',
        isPrimary: true,
        sortOrder: 1
      },
      {
        id: 'img-wkh-2',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop',
        alt: 'Hand-Cut Bohemian Crystal Base Detail',
        isPrimary: false,
        sortOrder: 2
      },
      {
        id: 'img-wkh-3',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop',
        alt: 'Wookah Quick Lock Stainless Steel Stem Connection',
        isPrimary: false,
        sortOrder: 3
      }
    ],
    stock: 14,
    lowStockThreshold: 3,
    weight: 3800,
    material: 'European Oak & V2A Stainless Steel',
    color: 'Natural Light Oak / Silver',
    tags: ['luxury', 'wooden', 'crystal', 'german-engineering', 'bestseller'],
    specifications: [
      { label: 'Height', value: '64 cm (25.2 in)' },
      { label: 'Vase Material', value: 'Hand-cut Heavy Crystal Glass' },
      { label: 'Stem Material', value: 'Solid Oak Wood + V2A Surgical Inox' },
      { label: 'Connection', value: 'Quick-Lock Click System' },
      { label: 'Origin', value: 'Manufactured in Poland' }
    ],
    rating: 4.95,
    reviewCount: 42,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    seoTitle: 'Buy Wookah Oak Olives Crystal Hookah | Sultan Hookah',
    seoDescription: 'Authentic Wookah European Oak with hand-cut crystal vase. Full warranty with free worldwide insured delivery.',
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'prod-alpha-model-x-cyber',
    name: 'Alpha Hookah Model X Cyber Gold Edition',
    slug: 'alpha-hookah-model-x-cyber-gold',
    sku: 'ALP-MODX-GLD',
    description: 'Winner of Hookah Club Show Hookah of the Year. The Alpha Model X features the iconic upward purge valve blowing smoke under the charcoal tray, anodized aerospace aluminum exterior, and magnetic hose ports.',
    shortDescription: 'Iconic vertical purge system, gold titanium PVD finish, magnetic hose connector and adjustable diffuser.',
    price: 269.00,
    salePrice: 245.00,
    currency: 'USD',
    brand: 'Alpha Hookah',
    brandSlug: 'alpha-hookah',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Modern Hookahs',
    images: [
      {
        id: 'img-alp-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'Alpha Hookah Model X Cyber Gold Edition',
        isPrimary: true,
        sortOrder: 1
      },
      {
        id: 'img-alp-2',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
        alt: 'Alpha Hookah Upward Vertical Purge System',
        isPrimary: false,
        sortOrder: 2
      }
    ],
    stock: 28,
    lowStockThreshold: 5,
    weight: 2200,
    material: 'Anodized Aluminum & AISI 304 Steel',
    color: 'Cyber Gold / Obsidian Black',
    tags: ['vertical-purge', 'modern', 'magnetic-port', 'top-rated'],
    specifications: [
      { label: 'Height', value: '42 cm (16.5 in)' },
      { label: 'Purge Style', value: 'Multi-jet Upward Tray Purge' },
      { label: 'Hose Connector', value: 'Neodymium Magnetic Lock' },
      { label: 'Diffuser', value: 'Removable 2-stage Silencer' }
    ],
    rating: 4.88,
    reviewCount: 67,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'prod-tangiers-cane-mint',
    name: 'Tangiers Noir Cane Mint (250g)',
    slug: 'tangiers-noir-cane-mint-250g',
    sku: 'TNG-NOIR-CM250',
    description: 'The undisputed king of peppermint shisha. Tangiers Cane Mint delivers an unmatched frosty sweet peppermint blast built on unwashed robust dark leaf tobacco.',
    shortDescription: 'Legendary intense peppermint dark leaf tobacco. The gold benchmark of cooling shisha blends.',
    price: 24.99,
    currency: 'USD',
    brand: 'Tangiers',
    brandSlug: 'tangiers',
    category: 'Tobacco & Shisha',
    categorySlug: 'tobacco',
    subcategory: 'Dark Leaf Tobacco',
    images: [
      {
        id: 'img-tng-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'Tangiers Noir Cane Mint 250g Pack',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 120,
    lowStockThreshold: 15,
    weight: 250,
    flavor: 'Intense Pure Cane Peppermint',
    tags: ['dark-leaf', 'cane-mint', 'high-nicotine', 'legendary'],
    specifications: [
      { label: 'Weight', value: '250 grams' },
      { label: 'Leaf Type', value: 'Unwashed Dark Leaf Burley' },
      { label: 'Strength', value: 'High / Connoisseur' },
      { label: 'Recommended Bowl', value: 'Alpaca Shallow Phunnel' }
    ],
    rating: 4.98,
    reviewCount: 142,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z'
  },
  {
    id: 'prod-darkside-supernova',
    name: 'Darkside Core Supernova (200g)',
    slug: 'darkside-core-supernova-200g',
    sku: 'DKS-SUP-200',
    description: 'The coldest cooling booster in the shisha industry. Pure zero-flavor polar frost crafted to elevate any fruit or dessert shisha mix.',
    shortDescription: 'Zero-flavor intense arctic coolant booster for elite shisha mixology.',
    price: 28.50,
    salePrice: 25.00,
    currency: 'USD',
    brand: 'Darkside Tobacco',
    brandSlug: 'darkside-tobacco',
    category: 'Tobacco & Shisha',
    categorySlug: 'tobacco',
    subcategory: 'Mint & Cooling',
    images: [
      {
        id: 'img-dks-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        alt: 'Darkside Core Supernova 200g Sealed Tub',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 85,
    lowStockThreshold: 10,
    weight: 200,
    flavor: 'Pure Sub-Zero Polar Ice',
    tags: ['booster', 'darkside', 'supernova', 'cooling'],
    specifications: [
      { label: 'Weight', value: '200 grams' },
      { label: 'Cut', value: 'Fine Boiled Dark Leaf' },
      { label: 'Heat Resistance', value: 'Extremely High (3-4 Coals)' }
    ],
    rating: 4.91,
    reviewCount: 53,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z'
  },
  {
    id: 'prod-musthave-pinkman',
    name: 'MustHave Pinkman (Grapefruit, Raspberry & Strawberry) 125g',
    slug: 'musthave-pinkman-125g',
    sku: 'MST-PNK-125',
    description: 'A global shisha sensation: bursting pink grapefruit juice blended with wild forest raspberries and ripe garden strawberries with a refreshing citrus finish.',
    shortDescription: 'Mouthwatering pink grapefruit, wild raspberries and sweet strawberry jam.',
    price: 21.00,
    currency: 'USD',
    brand: 'MustHave Tobacco',
    brandSlug: 'musthave-tobacco',
    category: 'Tobacco & Shisha',
    categorySlug: 'tobacco',
    subcategory: 'Fruity & Sweet',
    images: [
      {
        id: 'img-mst-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        alt: 'MustHave Pinkman 125g Jar',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 96,
    lowStockThreshold: 12,
    weight: 125,
    flavor: 'Grapefruit, Raspberry & Strawberry Syrup',
    tags: ['musthave', 'fruity', 'pinkman', 'all-day-smoke'],
    specifications: [
      { label: 'Weight', value: '125 grams' },
      { label: 'Leaf Grade', value: 'Toasted Burley Medium Cut' },
      { label: 'Strength', value: 'Medium-Strong' }
    ],
    rating: 4.96,
    reviewCount: 98,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z'
  },
  {
    id: 'prod-alpaca-symphony',
    name: 'Alpaca Symphony Hand-Thrown Clay Phunnel Bowl',
    slug: 'alpaca-symphony-phunnel-bowl',
    sku: 'ALP-BOWL-SYM',
    description: 'Handmade in California from proprietary American stoneware clay. The Alpaca Symphony features a central spire bridge that prevents foil drag and secures HMD devices with supreme heat management.',
    shortDescription: 'Hand-thrown stoneware clay with bridged spire for optimal airflow and rich molasses retention.',
    price: 34.00,
    salePrice: 29.99,
    currency: 'USD',
    brand: 'Alpaca Bowls',
    brandSlug: 'alpaca-bowls',
    category: 'Bowls',
    categorySlug: 'bowls',
    subcategory: 'Phunnel Bowls',
    images: [
      {
        id: 'img-bwl-1',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
        alt: 'Alpaca Symphony Clay Phunnel Bowl',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 45,
    lowStockThreshold: 8,
    weight: 280,
    material: 'American White Stoneware Clay',
    color: 'Ivory Marble Glaze',
    tags: ['handmade', 'stoneware', 'phunnel', 'hmd-compatible'],
    specifications: [
      { label: 'Capacity', value: '18 - 22 grams' },
      { label: 'Spire Type', value: 'Cross-Bridge Spire' },
      { label: 'Crafting', value: 'Hand-Thrown & Glazed in USA' }
    ],
    rating: 4.92,
    reviewCount: 38,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: true,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z'
  },
  {
    id: 'prod-kaloud-lotus-plus',
    name: 'Kaloud Lotus I+ Heat Management Device (Silver Nectar)',
    slug: 'kaloud-lotus-i-plus-silver',
    sku: 'KLD-LOT-SLV',
    description: 'The worldwide benchmark in charcoal heat regulation. Eliminates ash transfer, reduces harmful carbon monoxide by up to 80%, and provides uninterrupted 90-minute flavorful sessions.',
    shortDescription: 'Regulates charcoal thermal transfer, prevents ash drop, and extends session flavor longevity.',
    price: 54.95,
    currency: 'USD',
    brand: 'Kaloud',
    brandSlug: 'kaloud',
    category: 'Accessories',
    categorySlug: 'accessories',
    subcategory: 'Heat Management Devices',
    images: [
      {
        id: 'img-kld-1',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
        alt: 'Kaloud Lotus I+ HMD in Metallic Silver Finish',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 62,
    lowStockThreshold: 10,
    weight: 350,
    material: 'Aerospace-Grade Cast Aluminum Alloy',
    color: 'Brushed Silver Metallic',
    tags: ['hmd', 'kaloud', 'clean-smoke', 'must-have'],
    specifications: [
      { label: 'Charcoal Capacity', value: 'Up to 3x 26mm Cubes' },
      { label: 'Airflow Control', value: 'Rotating Vented Dome Lid' },
      { label: 'Coating', value: 'Food-Grade Thermal Anodization' }
    ],
    rating: 4.97,
    reviewCount: 114,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z'
  },
  {
    id: 'prod-cocourth-cubes-26mm',
    name: 'CocoUrth 100% Organic Coconut Charcoal (26mm Cubes - 1kg)',
    slug: 'cocourth-coconut-charcoal-26mm-1kg',
    sku: 'COCO-26MM-1KG',
    description: 'Manufactured from 100% pure organic coconut husk with zero tree timber, zero sulfur chemicals, and under 2.5% ash residue. Burns odorless and clean for up to 90 minutes.',
    shortDescription: 'Odorless, zero chemical sulfur, ultra-dense 26mm organic coconut coals (72 pieces/box).',
    price: 16.99,
    salePrice: 14.50,
    currency: 'USD',
    brand: 'CocoUrth',
    brandSlug: 'cocourth',
    category: 'Charcoal & Heat',
    categorySlug: 'coal',
    subcategory: '26mm Coconut Cubes',
    images: [
      {
        id: 'img-coal-1',
        url: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1200&auto=format&fit=crop',
        alt: 'CocoUrth 26mm Coconut Shell Charcoal Box',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 240,
    lowStockThreshold: 30,
    weight: 1000,
    material: '100% Compressed Organic Coconut Shell',
    tags: ['organic', 'low-ash', 'odorless', 'long-burn'],
    specifications: [
      { label: 'Piece Count', value: '72 Cubes per 1 kg Box' },
      { label: 'Burn Duration', value: '80 - 100 Minutes' },
      { label: 'Ash Content', value: '< 2.2%' },
      { label: 'Moisture', value: '< 5%' }
    ],
    rating: 4.89,
    reviewCount: 76,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'prod-craft-crystal-drop-base',
    name: 'Russian Craft Cut Crystal Drop Shisha Base',
    slug: 'russian-craft-cut-crystal-drop-base',
    sku: 'BASE-CRF-DRP',
    description: 'Heavy solid hand-cut crystal glass vase with a low center of gravity. Compatible with all Russian and European plug-in grommet stems including Alpha, Hoob, and MattPear.',
    shortDescription: 'Ultra-heavy lead-free cut crystal vase with universal 45mm neck opening.',
    price: 89.00,
    currency: 'USD',
    brand: 'Craft Glassworks',
    brandSlug: 'craft-glass',
    category: 'Bases & Vases',
    categorySlug: 'bases',
    subcategory: 'Russian Drop Bases',
    images: [
      {
        id: 'img-bas-1',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
        alt: 'Russian Craft Cut Crystal Base',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 22,
    lowStockThreshold: 4,
    weight: 2600,
    material: 'Thick Bohemian Crystal Glass',
    color: 'Clear Diamond Cut',
    tags: ['crystal', 'drop-base', 'heavy', 'stable'],
    specifications: [
      { label: 'Height', value: '26 cm' },
      { label: 'Inner Neck Diameter', value: '45 mm (Standard Universal)' },
      { label: 'Weight', value: '2.6 kg (Ultra Stable)' }
    ],
    rating: 4.94,
    reviewCount: 29,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-welcome15',
    code: 'WELCOME15',
    description: '15% discount for your inaugural luxury order',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderAmount: 50,
    usageLimit: 1000,
    usageCount: 142,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cpn-viphookah',
    code: 'VIPHOOKAH',
    description: '$30 off luxury hookah pipes over $200',
    discountType: 'FIXED',
    discountValue: 30,
    minOrderAmount: 200,
    usageLimit: 500,
    usageCount: 88,
    isActive: true,
    applicableCategories: ['Hookahs'],
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-wookah-oak-crystal',
    productName: 'Wookah Masterpiece Oak with Olives Crystal Base',
    userId: 'usr-customer-1',
    userName: 'Alexander M.',
    rating: 5,
    title: 'The pinnacle of hookah craftsmanship',
    comment: 'The grain of the European oak is flawless, and the crystal vase is so heavy it feels virtually immovable. Purges effortlessly and tastes exceptionally clean.',
    isVerifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-02-10T15:20:00Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-tangiers-cane-mint',
    productName: 'Tangiers Noir Cane Mint (250g)',
    userId: 'usr-customer-2',
    userName: 'Elena Rostova',
    rating: 5,
    title: 'Strongest and most natural peppermint on earth',
    comment: 'A staple in my shisha lounge. Dense packed in an Alpaca bowl with foil and Provost, this lasts 2+ hours with pure mint flavor throughout.',
    isVerifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-02-14T11:45:00Z'
  },
  {
    id: 'rev-3',
    productId: 'prod-kaloud-lotus-plus',
    productName: 'Kaloud Lotus I+ Heat Management Device (Silver Nectar)',
    userId: 'usr-customer-3',
    userName: 'Tariq Al-Mansoor',
    rating: 5,
    title: 'No more burnt tobacco!',
    comment: 'Completely transformed how my shisha sessions run. No ash in the tobacco, zero harsh burnt flavor spikes. Worth every penny.',
    isVerifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-02-18T09:12:00Z'
  }
];

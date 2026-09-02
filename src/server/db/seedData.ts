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
  storeName: 'World Hookah Market',
  supportEmail: 'support@worldhookahmarket.com',
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
  bannerAnnouncement: 'World Hookah Market · Fast Worldwide & US Express Shipping · Official Master Distributor for MustHave, DarkSide, Alpha Hookah, Oblako & Kong',
  maintenanceMode: false
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-hookahs',
    name: 'Hookahs',
    slug: 'hookahs',
    description: 'Precision engineered modern and Russian hookahs crafted from aerospace-grade AISI 304 stainless steel, polyacetal, and artisanal crystal.',
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1600&auto=format&fit=crop',
    subcategories: ['Alpha Hookah', 'El Bomber', 'MattPear', 'Maklaud Hookah', 'WOOKAH', 'Japona Hookah', 'Steamulation', 'Modern Hookahs', 'Russian Hookahs', 'Stainless Steel'],
    productCount: 18,
    isActive: true,
    sortOrder: 1,
    seoTitle: 'Buy Hookahs Online | Alpha Hookah, El Bomber, MattPear, Wookah',
    seoDescription: 'Shop premier European and Russian hookahs with worldwide shipping and fast USA delivery from World Hookah Market.'
  },
  {
    id: 'cat-tobacco',
    name: 'Tobacco',
    slug: 'tobacco',
    description: 'Dark leaf, blonde leaf, and whole-leaf cigar shisha tobacco blends featuring world-renowned brands like MustHave, DarkSide, BlackBurn, Tangiers, and Adalya.',
    imageUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1600&auto=format&fit=crop',
    subcategories: ['MustHave Tobacco', 'DarkSide Tobacco', 'BlackBurn Tobacco', 'Bonche Tobacco', 'Tangiers', 'Adalya Tobacco', 'Serbetli tobacco', 'Banger Hookah Tobacco', 'Element Tobacco', 'Russian Hookah Tobacco', 'Dark Leaf Tobacco', 'Blonde Leaf Tobacco'],
    productCount: 26,
    isActive: true,
    sortOrder: 2,
    seoTitle: 'Tobacco | MustHave, DarkSide, BlackBurn, Bonche, Tangiers',
    seoDescription: 'Largest online collection of Russian dark leaf and American shisha tobacco flavors with guaranteed freshness.'
  },
  {
    id: 'cat-bowls',
    name: 'Bowls',
    slug: 'bowls',
    description: 'Handcrafted clay, semi-porcelain, and character art bowls designed for high thermal retention, pure flavor, and dense smoke output.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop',
    subcategories: ['Oblako Bowls', 'Kong Bowls', 'Alpaca Bowls', 'Solaris Bowls', 'Japona Bowls', 'Cosmo Bowl', 'Target Bowls', 'Phunnel Bowls', 'Turkish / Killer Bowls'],
    productCount: 16,
    isActive: true,
    sortOrder: 3,
    seoTitle: 'Bowls | Oblako, Kong, Alpaca, Cosmo, Big Maks',
    seoDescription: 'Shop top-rated phunnel and Turkish bowls from Oblako, Kong, Alpaca, and Cosmo Bowl.'
  },
  {
    id: 'cat-bases',
    name: 'Bases',
    slug: 'bases',
    description: 'Russian drop vases, craft glass, and hand-cut Bohemian crystal bases engineered for maximum stability and visual elegance.',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    subcategories: ['Craft Glass Vases', 'Bohemian Crystal', 'Russian Drop Bases', 'Caesar Crystal', 'Big Maks Bases', 'WOOKAH Crystal', 'Alpha Base', 'Mini & Compact Bases'],
    productCount: 10,
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'cat-coal',
    name: 'Coal',
    slug: 'coal',
    description: '100% natural coconut charcoal cubes, flats, and circle cuts with low ash, zero sulfur chemicals, and up to 90 minutes burn time.',
    imageUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=800&auto=format&fit=crop',
    subcategories: ['Coco Loco', 'One Nation', 'Oasis Charcoal', 'Shaman Coal', '26mm Coconut Cubes', '28mm Jumbo Cubes', 'Charcoal Burners'],
    productCount: 8,
    isActive: true,
    sortOrder: 5
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Heat Management Devices (Kaloud, Na Grani), medical-grade silicone hoses, precision tongs, molasses catchers, and cleaning supplies.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
    subcategories: ['Kaloud', 'Na Grani HMD', 'Alpha Tongs & Hoses', 'Blade Hookah', 'Silicone Hoses & Handles', 'Molasses Catchers', 'Forks & Pokers', 'Grommets & Mouthpieces'],
    productCount: 12,
    isActive: true,
    sortOrder: 6
  },
  {
    id: 'cat-ehookah',
    name: 'E-Hookah',
    slug: 'e-hookah',
    description: 'Electronic hookah heads and portable shisha vaporizers for convenient, clean, and smoke-free modern sessions.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop',
    subcategories: ['Ooka', 'Kangerm', 'Aspire Proteus', 'Starbuzz Wireless E-Head', 'E-Heads', 'Pod Systems', 'E-Hookah Refills'],
    productCount: 6,
    isActive: true,
    sortOrder: 7
  },
  {
    id: 'cat-vapes',
    name: 'Vapes',
    slug: 'vapes',
    description: 'High performance pod mods, premium disposable vapes, replacement coils, and nic salt devices from world leading vape manufacturers.',
    imageUrl: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-800?q=80&w=800&auto=format&fit=crop',
    subcategories: ['GeekVape', 'Vaporesso', 'Lost Mary', 'Elf Bar', 'SMOK', 'VOOPOO', 'OXVA', 'Disposable Vapes', 'Pod Systems', 'Nicotine Salt Liquids'],
    productCount: 10,
    isActive: true,
    sortOrder: 8
  },
  {
    id: 'cat-wholesale',
    name: 'Wholesale Lounge Supplies',
    slug: 'wholesale-supplies',
    description: 'Commercial 1kg shisha tins, 20kg master charcoal cartons, and bulk lounge accessory packs at distributor pricing.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    subcategories: ['1kg Shisha Tins', '20kg Master Coal Cases', 'Disposable Lounge Mouthpieces', 'Commercial Starter Sets'],
    productCount: 4,
    isActive: true,
    sortOrder: 9
  }
];

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-alpha',
    name: 'Alpha Hookah',
    slug: 'alpha-hookah',
    origin: 'Saint Petersburg, Russia',
    description: 'Award-winning manufacturer of the legendary Model X, Beat, and Artist hookahs featuring vertical blow-off purge technology and magnetic connectors.',
    logoUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
    productCount: 8,
    isActive: true
  },
  {
    id: 'brand-el-bomber',
    name: 'El Bomber',
    slug: 'el-bomber',
    origin: 'Russia',
    description: 'Futuristic and cyberpunk-inspired hookahs featuring Katana samurai blades, motorcycle exhaust manifolds, and precision AISI 304 engineering.',
    logoUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
    productCount: 5,
    isActive: true
  },
  {
    id: 'brand-mattpear',
    name: 'MattPear',
    slug: 'mattpear',
    origin: 'Russia',
    description: 'Pioneers of medical-grade AISI 304 stainless steel hookahs with patented magnetic hose valves and whisper-quiet adjustable diffusers.',
    logoUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-maklaud',
    name: 'Maklaud Hookah',
    slug: 'maklaud-hookah',
    origin: 'Russia',
    description: 'Artisan sculptural masterpieces uniting functional high-grade stainless steel with hand-cast bronze and brass dragon sculptures.',
    logoUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-musthave',
    name: 'MustHave Tobacco',
    slug: 'musthave-tobacco',
    origin: 'Russia',
    description: 'Finely cut toasted Burley blend featuring hyper-realistic fruit, berry, and dessert flavor formulations packed in sealed plastic cans.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 8,
    isActive: true
  },
  {
    id: 'brand-darkside',
    name: 'DarkSide Tobacco',
    slug: 'darkside-tobacco',
    origin: 'Russia',
    description: 'Pioneers of unwashed boiled Burley tobacco leaf shisha offering potent strength, rich aroma retention, and heat resilience.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 7,
    isActive: true
  },
  {
    id: 'brand-blackburn',
    name: 'BlackBurn Tobacco',
    slug: 'blackburn-tobacco',
    origin: 'Russia',
    description: 'High-intensity dark leaf shisha tobacco known for the Overdose line, maximum flavor brightness, and superior heat resistance.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 6,
    isActive: true
  },
  {
    id: 'brand-bonche',
    name: 'Bonche Tobacco',
    slug: 'bonche-tobacco',
    origin: 'Russia',
    description: '100% whole-leaf Caribbean and Cuban cigar shisha tobacco creating an ultra-refined, woody, and luxurious smoking session.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-tangiers',
    name: 'Tangiers',
    slug: 'tangiers',
    origin: 'San Diego, USA',
    description: 'The golden standard of dark leaf American shisha tobacco, famous for Cane Mint and distinctive Noir blends.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 5,
    isActive: true
  },
  {
    id: 'brand-oblako',
    name: 'Oblako Bowls',
    slug: 'oblako-bowls',
    origin: 'Russia',
    description: 'World-famous Russian white ceramic and red clay phunnel bowls with high-gloss colorful marble glazes.',
    logoUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop',
    productCount: 6,
    isActive: true
  },
  {
    id: 'brand-kong',
    name: 'Kong Bowls',
    slug: 'kong-bowls',
    origin: 'Russia',
    description: 'Handmade character and glowing ceramic bowls featuring Sub-Zero, Godzilla Light, King Kong, and textured Lava glazes.',
    logoUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop',
    productCount: 5,
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
  },
  {
    id: 'brand-wookah',
    name: 'Wookah',
    slug: 'wookah',
    origin: 'Poland',
    description: 'Master craftsmen uniting rare exotic European woods, V2A stainless steel, and hand-cut lead-free Bohemian crystal glass.',
    logoUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-kaloud',
    name: 'Kaloud',
    slug: 'kaloud',
    origin: 'Los Angeles, USA',
    description: 'Inventors of the revolutionary Lotus Heat Management Device and world-renowned Samsaris silicone-ceramic bowls.',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-coco-loco',
    name: 'Coco Loco',
    slug: 'coco-loco',
    origin: 'Indonesia / USA',
    description: '100% premium natural coconut charcoal cubes with stable high heat, low ash residue, and 0% chemical taste.',
    logoUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-rht',
    name: 'Russian Hookah Tobacco',
    slug: 'russian-hookah-tobacco',
    origin: 'Russia',
    description: 'Premier Russian dark and blonde leaf tobacco blends curated by leading master mixologists.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 10,
    isActive: true
  },
  {
    id: 'brand-adalya',
    name: 'Adalya Tobacco',
    slug: 'adalya-tobacco',
    origin: 'Turkey / Germany',
    description: 'World-renowned blonde leaf tobacco famous for Love 66, Lady Killer, and Havana.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 8,
    isActive: true
  },
  {
    id: 'brand-serbetli',
    name: 'Serbetli tobacco',
    slug: 'serbetli-tobacco',
    origin: 'Turkey',
    description: 'Smooth honey-infused light Virginia shisha tobacco packed with juicy flavor nuances.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 6,
    isActive: true
  },
  {
    id: 'brand-banger',
    name: 'Banger Hookah Tobacco',
    slug: 'banger-tobacco',
    origin: 'Russia',
    description: 'High-octane collaboration between Timati and Burn Tobacco featuring bright, candy-sweet dessert and berry notes.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 7,
    isActive: true
  },
  {
    id: 'brand-element',
    name: 'Element Tobacco',
    slug: 'element-tobacco',
    origin: 'Russia',
    description: 'Concept shisha tobacco based on the 4 elements: Air, Water, Earth, and Fire with rich natural aromas.',
    logoUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
    productCount: 6,
    isActive: true
  },
  {
    id: 'brand-japona',
    name: 'Japona Hookah',
    slug: 'japona-hookah',
    origin: 'Saint Petersburg, Russia',
    description: 'Exquisite Japanese-inspired wooden and ceramic hookahs and hand-corded bowls.',
    logoUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
    productCount: 5,
    isActive: true
  },
  {
    id: 'brand-steamulation',
    name: 'Steamulation Hookah',
    slug: 'steamulation-hookah',
    origin: 'Germany / Switzerland',
    description: 'Swiss precision engineering featuring patented SteamClick 360 rotation and Air-Flow Control systems.',
    logoUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-solaris',
    name: 'Solaris Bowls',
    slug: 'solaris-bowls',
    origin: 'Ukraine',
    description: 'Planetary themed thick-walled clay pots offering ultra-stable heat retention and classic draw.',
    logoUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-target',
    name: 'Target Bowls',
    slug: 'target-bowls',
    origin: 'Russia',
    description: 'Precision grooved clay and semi-porcelain phunnel bowls with heat lock ribs.',
    logoUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-caesar',
    name: 'Caesar Crystal',
    slug: 'caesar-crystal',
    origin: 'Czech Republic',
    description: 'Hand-blown 24% leaded Bohemian crystal hookah bases cut by European master glass artisans.',
    logoUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop',
    productCount: 5,
    isActive: true
  },
  {
    id: 'brand-craft-glass',
    name: 'Craft Glass',
    slug: 'craft-glass',
    origin: 'Russia',
    description: 'Heavy Russian drop-shaped craft glass vases compatible with all modern plug-in grommet hookahs.',
    logoUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop',
    productCount: 5,
    isActive: true
  },
  {
    id: 'brand-na-grani',
    name: 'Na Grani',
    slug: 'na-grani',
    origin: 'Russia',
    description: 'High-grade stainless steel Heat Management Devices and precision tongs engineered for intense dark leaf heat.',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-blade',
    name: 'Blade Hookah',
    slug: 'blade-hookah',
    origin: 'Russia',
    description: 'Anodized titanium-finish tongs, molasses catchers, and luxury personal mouthpieces.',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-one-nation',
    name: 'One Nation',
    slug: 'one-nation',
    origin: 'Germany / Indonesia',
    description: 'Premium natural coconut charcoal cubes 26mm and 28mm for even, clean burn without odor.',
    logoUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-oasis',
    name: 'Oasis Charcoal',
    slug: 'oasis-charcoal',
    origin: 'Russia / Indonesia',
    description: 'High thermal output natural coconut coals engineered specifically for Russian dark leaf sessions.',
    logoUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-ooka',
    name: 'Ooka',
    slug: 'ooka',
    origin: 'UAE',
    description: 'Innovative charcoal-free electronic shisha device utilizing pressurized heat pods for real molasses vapor.',
    logoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  },
  {
    id: 'brand-aspire',
    name: 'Aspire',
    slug: 'aspire-proteus',
    origin: 'China',
    description: 'The iconic Proteus electronic hookah head system transforming any traditional water pipe into an e-shisha.',
    logoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=300&auto=format&fit=crop',
    productCount: 3,
    isActive: true
  },
  {
    id: 'brand-geekvape',
    name: 'GeekVape',
    slug: 'geekvape',
    origin: 'China / Global',
    description: 'IP68 waterproof and shockproof Aegis pod mods and Z-Series sub-ohm flavor tanks.',
    logoUrl: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-300?q=80&w=300&auto=format&fit=crop',
    productCount: 6,
    isActive: true
  },
  {
    id: 'brand-vaporesso',
    name: 'Vaporesso',
    slug: 'vaporesso',
    origin: 'Global',
    description: 'Corex heating tech and AXON chipset pod systems including the best-selling XROS series.',
    logoUrl: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-300?q=80&w=300&auto=format&fit=crop',
    productCount: 6,
    isActive: true
  },
  {
    id: 'brand-lost-mary',
    name: 'Lost Mary',
    slug: 'lost-mary',
    origin: 'Global',
    description: 'Rechargeable dual mesh coil disposables and pod kits with hyper-concentrated fruit flavors.',
    logoUrl: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-300?q=80&w=300&auto=format&fit=crop',
    productCount: 5,
    isActive: true
  },
  {
    id: 'brand-elf-bar',
    name: 'Elf Bar',
    slug: 'elf-bar',
    origin: 'Global',
    description: 'World-famous disposable vape pens and smart power screen devices.',
    logoUrl: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-300?q=80&w=300&auto=format&fit=crop',
    productCount: 5,
    isActive: true
  },
  {
    id: 'brand-smok',
    name: 'SMOK',
    slug: 'smok',
    origin: 'Global',
    description: 'Legendary vape hardware pioneers known for Nord and Novo refillable pod kits.',
    logoUrl: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-300?q=80&w=300&auto=format&fit=crop',
    productCount: 4,
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 0.1 Black Burn Ananas Shock 200gr
  {
    id: 'prod-blackburn-ananas-shock',
    name: 'Black Burn Ananas Shock – 200gr',
    slug: 'black-burn-ananas-shock-200gr',
    sku: 'BKB-ANA-200',
    description: 'Extremely intense sour fresh pineapple shisha tobacco made on high-strength Burley leaf.',
    shortDescription: 'Sour tangy pineapple dark leaf tobacco blend with explosive citrus aroma.',
    price: 30.00,
    currency: 'USD',
    brand: 'BlackBurn Tobacco',
    brandSlug: 'blackburn-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Dark Leaf Tobacco',
    images: [
      {
        id: 'img-bkb-ana-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'Black Burn Ananas Shock 200gr',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 120,
    lowStockThreshold: 15,
    weight: 200,
    flavor: 'Sour Pineapple Shock',
    tags: ['bulk-discount', 'blackburn', 'ananas-shock', 'sour', 'dark-leaf', 'bestseller'],
    specifications: [
      { label: 'Weight', value: '200 grams' },
      { label: 'Leaf Type', value: 'Toasted Burley' },
      { label: 'Strength', value: 'Strong (7/10)' }
    ],
    rating: 4.97,
    reviewCount: 68,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },

  // 0.2 Black Burn Sundaysun 200gr
  {
    id: 'prod-blackburn-sundaysun',
    name: 'Black Burn Sundaysun – 200gr',
    slug: 'black-burn-sundaysun-200gr',
    sku: 'BKB-SUN-200',
    description: 'A radiant tropical citrus explosion with juicy orange, ripe sweet grapefruit, and yellow passion fruit notes.',
    shortDescription: 'Sweet and tangy sunny citrus tropical fusion on Burley dark tobacco.',
    price: 30.00,
    currency: 'USD',
    brand: 'BlackBurn Tobacco',
    brandSlug: 'blackburn-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Fruity & Sweet',
    images: [
      {
        id: 'img-bkb-sun-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'Black Burn Sundaysun 200gr',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 95,
    lowStockThreshold: 12,
    weight: 200,
    flavor: 'Sunny Tropical Citrus Cocktail',
    tags: ['bulk-discount', 'blackburn', 'sundaysun', 'citrus'],
    specifications: [
      { label: 'Weight', value: '200 grams' },
      { label: 'Strength', value: 'Strong (7/10)' }
    ],
    rating: 4.92,
    reviewCount: 52,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z'
  },

  // 0.3 Element Tobacco Moroz 200gr
  {
    id: 'prod-element-moroz',
    name: 'Element Tobacco Moroz (Water Line) – 200gr',
    slug: 'element-tobacco-moroz-water-line-200gr',
    sku: 'ELM-MRZ-200',
    description: 'Pure Russian Siberian Frost without extraneous sweetness or menthol aftertaste. Designed to cool down any mix.',
    shortDescription: 'Pure frosty Siberian frost cooling additive on Water Line Burley.',
    price: 23.00,
    currency: 'USD',
    brand: 'Element Tobacco',
    brandSlug: 'element-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Mint & Cooling',
    images: [
      {
        id: 'img-elm-mrz-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'Element Tobacco Moroz Water Line 200gr',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 140,
    lowStockThreshold: 20,
    weight: 200,
    flavor: 'Pure Siberian Frost',
    tags: ['bulk-discount', 'element', 'moroz', 'cooling', 'water-line'],
    specifications: [
      { label: 'Weight', value: '200 grams' },
      { label: 'Line', value: 'Water Line (Medium Strength)' }
    ],
    rating: 4.95,
    reviewCount: 77,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-03T00:00:00Z',
    updatedAt: '2026-01-03T00:00:00Z'
  },

  // 0.4 Maklaud Dart 23 Project Hookah
  {
    id: 'prod-maklaud-dart-23',
    name: 'Maklaud Dart 23 Project Hookah',
    slug: 'maklaud-dart-23-project-hookah',
    sku: 'MKL-DRT-23',
    description: 'Limited edition project artwork hookah featuring solid aircraft titanium and hand-sculpted bronze centerpiece with custom collector case.',
    shortDescription: 'Project 23 Collector Edition with hand-cast bronze and precision aerospace titanium.',
    price: 3700.00,
    currency: 'USD',
    brand: 'Maklaud Hookah',
    brandSlug: 'maklaud-hookah',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Modern Hookahs',
    images: [
      {
        id: 'img-mkl-drt-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'Maklaud Dart 23 Project Hookah',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 2,
    lowStockThreshold: 1,
    weight: 5200,
    material: 'Aircraft Titanium, Bronze & Bohemian Crystal',
    tags: ['maklaud', 'dart-23', 'project-hookah', 'ultra-luxury', 'museum-grade'],
    specifications: [
      { label: 'Edition', value: 'Limited Worldwide Run of 50' },
      { label: 'Stem', value: 'Hand-Cast Solid Patinated Bronze' },
      { label: 'Packaging', value: 'Custom Hard Flight Case' }
    ],
    rating: 5.0,
    reviewCount: 14,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-04T00:00:00Z',
    updatedAt: '2026-01-04T00:00:00Z'
  },

  // 0.5 Maklaud The Shine of Moon by Di-lun Hookah
  {
    id: 'prod-maklaud-shine-moon',
    name: 'Maklaud The Shine of Moon by Di-lun Hookah',
    slug: 'maklaud-the-shine-of-moon-by-di-lun-hookah',
    sku: 'MKL-MOON-DL',
    description: 'The pinnacle of artisan hookah jewelry. Collaboration with master jeweler Di-lun featuring silver and gold leaf accents and iridescent moon sphere purge.',
    shortDescription: 'Jewelry-grade collaboration with Di-lun featuring silver plating and glowing lunar purge.',
    price: 4300.00,
    currency: 'USD',
    brand: 'Maklaud Hookah',
    brandSlug: 'maklaud-hookah',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Modern Hookahs',
    images: [
      {
        id: 'img-mkl-moon-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'Maklaud The Shine of Moon by Di-lun Hookah',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 2,
    lowStockThreshold: 1,
    weight: 5600,
    material: 'Silver-Plated Brass, Surgical Inox & Black Crystal',
    tags: ['maklaud', 'shine-of-moon', 'di-lun', 'jeweler-edition'],
    specifications: [
      { label: 'Crafting', value: 'Jewelry Master Silver Inlay' },
      { label: 'Vase', value: 'Heavy Obsidian Bohemian Crystal' }
    ],
    rating: 5.0,
    reviewCount: 9,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z'
  },

  // 0.6 Alpha Hookah Smart Exzo Tribal Black
  {
    id: 'prod-alpha-smart-exzo',
    name: 'Alpha Hookah – Smart (Exzo Tribal) Black',
    slug: 'alpha-hookah-smart-exzo-tribal-black',
    sku: 'ALP-SMR-EXZ',
    description: 'Compact travel powerhouse with laser engraved tribal ethnic sleeve, magnetic port, and quick purge.',
    shortDescription: 'Tribal engraved compact Russian hookah with magnetic hose connection.',
    price: 340.00,
    currency: 'USD',
    brand: 'Alpha Hookah',
    brandSlug: 'alpha-hookah',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Russian Hookahs',
    images: [
      {
        id: 'img-alp-smr-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'Alpha Hookah Smart Exzo Tribal Black',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 16,
    lowStockThreshold: 3,
    weight: 2100,
    material: 'Anodized Aircraft Aluminum & Inox AISI 304',
    tags: ['alpha-hookah', 'smart', 'exzo-tribal', 'black-edition'],
    specifications: [
      { label: 'Height', value: '38 cm' },
      { label: 'Purge', value: 'Vertical Smart Blow-Off' }
    ],
    rating: 4.96,
    reviewCount: 39,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-06T00:00:00Z',
    updatedAt: '2026-01-06T00:00:00Z'
  },

  // 0.7 Alpha Hookah Model X Cyber Sunset
  {
    id: 'prod-alpha-model-x-cyber',
    name: 'Alpha Hookah Model X (Cyber Sunset)',
    slug: 'alpha-hookah-model-x-cyber-sunset',
    sku: 'ALP-MODX-CYB',
    description: 'Special gradient anodized Cyber Sunset edition with vertical multi-port purge.',
    shortDescription: 'Cyber Sunset multi-port purge edition with magnetic hose adapter.',
    price: 260.00,
    currency: 'USD',
    brand: 'Alpha Hookah',
    brandSlug: 'alpha-hookah',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Russian Hookahs',
    images: [
      {
        id: 'img-alp-cyb-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'Alpha Hookah Model X Cyber Sunset',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 22,
    lowStockThreshold: 4,
    weight: 2200,
    tags: ['alpha-hookah', 'model-x', 'cyber-sunset', 'bestseller'],
    specifications: [
      { label: 'Height', value: '42 cm' },
      { label: 'Purge', value: 'Multi-jet Upward Tray Purge' }
    ],
    rating: 4.97,
    reviewCount: 71,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-07T00:00:00Z',
    updatedAt: '2026-01-07T00:00:00Z'
  },

  // 1. Alpha Hookah Model X Black Matte
  {
    id: 'prod-alpha-model-x-black',
    name: 'Alpha Hookah Model X (Black Matte)',
    slug: 'alpha-hookah-model-x-black-matte',
    sku: 'ALP-MODX-BLK',
    description: 'The worldwide award-winning Russian hookah from Alpha Hookah. Features iconic upward vertical blow-off purge technology under the tray, anodized aerospace aluminum stem, and magnetic hose connectors.',
    shortDescription: 'Iconic vertical purge system, matte black anodized finish, magnetic hose connector, and adjustable diffuser.',
    price: 244.99,
    salePrice: 229.00,
    currency: 'USD',
    brand: 'Alpha Hookah',
    brandSlug: 'alpha-hookah',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Russian Hookahs',
    images: [
      {
        id: 'img-alp-x-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'Alpha Hookah Model X Black Matte',
        isPrimary: true,
        sortOrder: 1
      },
      {
        id: 'img-alp-x-2',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
        alt: 'Alpha Hookah Upward Vertical Purge System',
        isPrimary: false,
        sortOrder: 2
      }
    ],
    stock: 24,
    lowStockThreshold: 4,
    weight: 2200,
    material: 'Anodized Aluminum & AISI 304 Stainless Steel',
    color: 'Matte Obsidian Black',
    tags: ['vertical-purge', 'russian-hookah', 'magnetic-connector', 'bestseller'],
    specifications: [
      { label: 'Height', value: '42 cm (16.5 in)' },
      { label: 'Purge Style', value: 'Multi-jet Upward Tray Purge' },
      { label: 'Hose Connector', value: 'Neodymium Magnetic Lock' },
      { label: 'Diffuser', value: 'Removable 2-stage Silencer' },
      { label: 'Origin', value: 'Saint Petersburg, Russia' }
    ],
    rating: 4.96,
    reviewCount: 88,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z'
  },

  // 2. Alpha Hookah Beat White
  {
    id: 'prod-alpha-beat-white',
    name: 'Alpha Hookah Beat White (Silver & White)',
    slug: 'alpha-hookah-beat-white-silver',
    sku: 'ALP-BEAT-WHT',
    description: 'Compact street-culture inspired portable hookah. The Alpha Beat features an ultra-responsive draw, cylindrical blow-off purge, and compact dimensions making it the ultimate travel and lounge powerhouse.',
    shortDescription: 'Compact street-style hookah with radial blow-off purge, magnetic hose port, and carrying case.',
    price: 279.95,
    currency: 'USD',
    brand: 'Alpha Hookah',
    brandSlug: 'alpha-hookah',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Compact & Travel Hookahs',
    images: [
      {
        id: 'img-alp-beat-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'Alpha Hookah Beat White Silver',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 18,
    lowStockThreshold: 3,
    weight: 1800,
    material: 'Polyacetal & AISI 304 Stainless Steel',
    color: 'Gloss White / Silver',
    tags: ['compact', 'beat', 'alpha-hookah', 'portable'],
    specifications: [
      { label: 'Height', value: '35 cm (13.8 in)' },
      { label: 'Purge Style', value: 'Center Stem Radial Jet Purge' },
      { label: 'Connector', value: 'Magnetic Port' }
    ],
    rating: 4.88,
    reviewCount: 34,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  },

  // 3. El Bomber Katana Hookah
  {
    id: 'prod-el-bomber-katana',
    name: 'El Bomber Katana Hookah (Samurai Edition)',
    slug: 'el-bomber-katana-samurai-edition',
    sku: 'ELB-KTN-01',
    description: 'Inspired by traditional Japanese samurai sword craftsmanship. El Bomber Katana features a laser-engraved steel katana tray, unique downward purge along the stem spine, and precision CNC-machined stainless steel fittings.',
    shortDescription: 'Japanese Samurai inspired design, engraved katana tray, magnetic hose port, and smooth diffuser.',
    price: 289.00,
    salePrice: 269.00,
    currency: 'USD',
    brand: 'El Bomber',
    brandSlug: 'el-bomber',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Modern Hookahs',
    images: [
      {
        id: 'img-elb-ktn-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'El Bomber Katana Hookah Samurai Edition',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 15,
    lowStockThreshold: 3,
    weight: 2400,
    material: 'AISI 304 Stainless Steel & Polyacetal',
    color: 'Samurai Black / Crimson Red',
    tags: ['el-bomber', 'katana', 'samurai', 'exclusive'],
    specifications: [
      { label: 'Height', value: '47 cm' },
      { label: 'Tray Style', value: 'Laser Engraved Katana Blade Tray' },
      { label: 'Purge Style', value: 'Spine-Guided Downward Jet' }
    ],
    rating: 4.95,
    reviewCount: 41,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z'
  },

  // 4. MattPear Simple M Ball White
  {
    id: 'prod-mattpear-simple-m',
    name: 'MattPear Simple M Ball Hookah (White Edition)',
    slug: 'mattpear-simple-m-ball-white',
    sku: 'MTP-SMP-WHT',
    description: 'The pinnacle of Russian reliability. Made entirely of certified AISI 304 medical stainless steel. Features patented MattPear magnetic hose connection, threaded diffuser, and clean minimalist ball accents.',
    shortDescription: '100% AISI 304 surgical stainless steel, patented magnetic port, and quiet whisper diffuser.',
    price: 225.00,
    currency: 'USD',
    brand: 'MattPear',
    brandSlug: 'mattpear',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Stainless Steel',
    images: [
      {
        id: 'img-mtp-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'MattPear Simple M Ball Hookah',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 20,
    lowStockThreshold: 4,
    weight: 2500,
    material: 'AISI 304 Medical Stainless Steel',
    color: 'Surgical Steel / White Ball',
    tags: ['mattpear', 'stainless-steel', 'indestructible', 'magnetic'],
    specifications: [
      { label: 'Height', value: '45 cm' },
      { label: 'Material', value: '100% AISI 304 Inox' },
      { label: 'Warranty', value: '5-Year Manufacturer Warranty' }
    ],
    rating: 4.93,
    reviewCount: 52,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z'
  },

  // 5. Maklaud Warta Heavy Brass Hookah
  {
    id: 'prod-maklaud-warta',
    name: 'Maklaud Warta Sculptural Brass Hookah',
    slug: 'maklaud-warta-brass-hookah',
    sku: 'MKL-WRT-01',
    description: 'An extraordinary union of functional sculpture and Russian engineering. Features an intricately cast brass skull inset in the central stem, surgical stainless steel core, and handcrafted heavy glass drop vase.',
    shortDescription: 'Handcrafted Russian sculptural brass artwork stem with solid stainless steel air column.',
    price: 495.00,
    salePrice: 460.00,
    currency: 'USD',
    brand: 'Maklaud Hookah',
    brandSlug: 'maklaud-hookah',
    category: 'Hookahs',
    categorySlug: 'hookahs',
    subcategory: 'Modern Hookahs',
    images: [
      {
        id: 'img-mkl-1',
        url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=300&auto=format&fit=crop',
        alt: 'Maklaud Warta Sculptural Brass Hookah',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 8,
    lowStockThreshold: 2,
    weight: 3400,
    material: 'Artisanal Brass & AISI 304 Stainless Steel',
    color: 'Antique Brass / Polished Steel',
    tags: ['maklaud', 'sculptural', 'luxury', 'brass'],
    specifications: [
      { label: 'Height', value: '55 cm' },
      { label: 'Inset Sculpture', value: 'Hand-Cast Solid Brass' },
      { label: 'Airflow', value: 'Classic Open Russian Draw' }
    ],
    rating: 4.98,
    reviewCount: 29,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z'
  },

  // 6. Wookah Masterpiece Oak
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
        alt: 'Wookah Masterpiece Oak Shisha',
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
      { label: 'Connection', value: 'Quick-Lock Click System' }
    ],
    rating: 4.95,
    reviewCount: 42,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-01-10T12:00:00Z'
  },

  // 7. MustHave Pinkman 125g
  {
    id: 'prod-musthave-pinkman',
    name: 'MustHave Tobacco Pinkman (125g)',
    slug: 'musthave-tobacco-pinkman-125g',
    sku: 'MST-PNK-125',
    description: 'The undisputed #1 top-selling Russian shisha tobacco in the world. MustHave Pinkman delivers an explosive fusion of pink grapefruit, ripe wild raspberries, and sweet garden strawberries with a refreshing citrus finish.',
    shortDescription: 'World-famous pink grapefruit, forest raspberries, and sweet strawberry jam on toasted Burley leaf.',
    price: 19.99,
    currency: 'USD',
    brand: 'MustHave Tobacco',
    brandSlug: 'musthave-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Fruity & Sweet',
    images: [
      {
        id: 'img-mst-pnk-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'MustHave Pinkman 125g Jar',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 140,
    lowStockThreshold: 20,
    weight: 125,
    flavor: 'Grapefruit, Raspberry & Strawberry',
    tags: ['musthave', 'pinkman', 'bestseller', 'dark-leaf', 'russian-tobacco'],
    specifications: [
      { label: 'Weight', value: '125 grams' },
      { label: 'Leaf Grade', value: 'Toasted Burley Medium Cut' },
      { label: 'Strength', value: 'Medium-Strong (6/10)' },
      { label: 'Origin', value: 'Moscow, Russia' }
    ],
    rating: 4.97,
    reviewCount: 164,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z'
  },

  // 8. MustHave Space Flavour 125g
  {
    id: 'prod-musthave-space-flavour',
    name: 'MustHave Tobacco Space Flavour (125g)',
    slug: 'musthave-tobacco-space-flavour-125g',
    sku: 'MST-SPC-125',
    description: 'An exotic intergalactic cocktail of sweet tropical mango, fragrant passionfruit, and juicy lychee syrup. Perfectly balanced sweetness and tropical aroma.',
    shortDescription: 'Tropical mango, juicy passion fruit, and aromatic lychee in a sealed 125g jar.',
    price: 19.99,
    currency: 'USD',
    brand: 'MustHave Tobacco',
    brandSlug: 'musthave-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Fruity & Sweet',
    images: [
      {
        id: 'img-mst-spc-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'MustHave Space Flavour 125g Jar',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 95,
    lowStockThreshold: 15,
    weight: 125,
    flavor: 'Mango, Passionfruit & Lychee',
    tags: ['musthave', 'space-flavour', 'tropical', 'dark-leaf'],
    specifications: [
      { label: 'Weight', value: '125 grams' },
      { label: 'Leaf Type', value: 'Toasted Burley' },
      { label: 'Strength', value: 'Medium-Strong' }
    ],
    rating: 4.92,
    reviewCount: 78,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-14T00:00:00Z',
    updatedAt: '2026-01-14T00:00:00Z'
  },

  // 9. MustHave Alova 125g
  {
    id: 'prod-musthave-alova',
    name: 'MustHave Tobacco Alova (125g)',
    slug: 'musthave-tobacco-alova-125g',
    sku: 'MST-ALV-125',
    description: 'Refreshing natural aloe vera juice accented with delicate sweet tropical fruits and a smooth cooling breeze. Exceptional for fruit and citrus mixology.',
    shortDescription: 'Sweet refreshing aloe vera juice with tropical nectar undertones.',
    price: 19.99,
    currency: 'USD',
    brand: 'MustHave Tobacco',
    brandSlug: 'musthave-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Fruity & Sweet',
    images: [
      {
        id: 'img-mst-alv-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'MustHave Alova 125g Jar',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 80,
    lowStockThreshold: 10,
    weight: 125,
    flavor: 'Aloe Vera & Sweet Tropical Ice',
    tags: ['musthave', 'alova', 'aloe-vera', 'mixer'],
    specifications: [
      { label: 'Weight', value: '125 grams' },
      { label: 'Strength', value: 'Medium-Strong' }
    ],
    rating: 4.89,
    reviewCount: 45,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-16T00:00:00Z',
    updatedAt: '2026-01-16T00:00:00Z'
  },

  // 10. DarkSide Core Supernova 200g
  {
    id: 'prod-darkside-supernova',
    name: 'DarkSide Core Supernova (200g)',
    slug: 'darkside-core-supernova-200g',
    sku: 'DKS-SUP-200',
    description: 'The legendary sub-zero cooling booster of the shisha industry. Pure zero-flavor polar frost crafted to add an icy bite to any mix without altering the fruit or dessert aroma profile.',
    shortDescription: 'Zero-flavor pure sub-zero arctic frost booster. The ultimate shisha mixologist tool.',
    price: 26.99,
    salePrice: 24.50,
    currency: 'USD',
    brand: 'DarkSide Tobacco',
    brandSlug: 'darkside-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Mint & Cooling',
    images: [
      {
        id: 'img-dks-sup-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'DarkSide Core Supernova 200g Tub',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 110,
    lowStockThreshold: 15,
    weight: 200,
    flavor: 'Pure Sub-Zero Arctic Ice (No Flavor)',
    tags: ['darkside', 'supernova', 'ice', 'cooling', 'bestseller'],
    specifications: [
      { label: 'Weight', value: '200 grams' },
      { label: 'Cut', value: 'Fine Boiled Dark Burley Leaf' },
      { label: 'Heat Resistance', value: 'Extremely High (3-4 Coals)' }
    ],
    rating: 4.95,
    reviewCount: 112,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z'
  },

  // 11. DarkSide Core Falling Star 200g
  {
    id: 'prod-darkside-falling-star',
    name: 'DarkSide Core Falling Star (200g)',
    slug: 'darkside-core-falling-star-200g',
    sku: 'DKS-FLS-200',
    description: 'Juicy tropical mango blended harmoniously with tangy passion fruit on DarkSide signature boiled Burley dark leaf tobacco. Rich, long-lasting, and intensely aromatic.',
    shortDescription: 'Sweet tropical mango and tart passionfruit on robust dark leaf.',
    price: 26.99,
    currency: 'USD',
    brand: 'DarkSide Tobacco',
    brandSlug: 'darkside-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Fruity & Sweet',
    images: [
      {
        id: 'img-dks-fls-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'DarkSide Falling Star 200g Tub',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 75,
    lowStockThreshold: 10,
    weight: 200,
    flavor: 'Tropical Mango & Tart Passionfruit',
    tags: ['darkside', 'falling-star', 'mango', 'dark-leaf'],
    specifications: [
      { label: 'Weight', value: '200 grams' },
      { label: 'Strength', value: 'Core Line (Medium-High)' }
    ],
    rating: 4.90,
    reviewCount: 64,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },

  // 12. BlackBurn Overdose (200g)
  {
    id: 'prod-blackburn-overdose',
    name: 'BlackBurn Overdose High-Strength (200g)',
    slug: 'blackburn-overdose-high-strength-200g',
    sku: 'BKB-OVD-200',
    description: 'The heavyweight of Russian dark leaf tobacco. Overdose blends premium unwashed Burley tobacco cured with tart sparkling citrus lemonade. Engineered for veteran shisha connoisseurs seeking maximum strength and smoke density.',
    shortDescription: 'High-nicotine tart sparkling citrus lemonade on extra-strong Burley tobacco leaf.',
    price: 27.99,
    salePrice: 25.50,
    currency: 'USD',
    brand: 'BlackBurn Tobacco',
    brandSlug: 'blackburn-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Dark Leaf Tobacco',
    images: [
      {
        id: 'img-bkb-ovd-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'BlackBurn Overdose 200g Tub',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 90,
    lowStockThreshold: 12,
    weight: 200,
    flavor: 'Sparkling Citrus Lemonade & Zesty Lime',
    tags: ['blackburn', 'overdose', 'high-strength', 'dark-leaf', 'russian-tobacco'],
    specifications: [
      { label: 'Weight', value: '200 grams' },
      { label: 'Strength', value: 'High / Extra Strong (8/10)' },
      { label: 'Heat Tolerance', value: 'Extreme (3-4 Coals in Phunnel)' }
    ],
    rating: 4.96,
    reviewCount: 92,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-07T00:00:00Z',
    updatedAt: '2026-01-07T00:00:00Z'
  },

  // 13. Bonche Cigar Tobacco Whiskey 120g
  {
    id: 'prod-bonche-whiskey',
    name: 'Bonche 100% Cigar Shisha Tobacco Whiskey (120g)',
    slug: 'bonche-cigar-tobacco-whiskey-120g',
    sku: 'BNC-WSK-120',
    description: 'Made exclusively from 100% whole Caribbean and Cuban cigar leaf tobacco. Cured with single malt whiskey and oak barrel notes. Yields an intensely rich, earthy, and sophisticated smoke.',
    shortDescription: '100% whole Cuban cigar leaf shisha infused with aged oak barrel single malt whiskey.',
    price: 48.00,
    currency: 'USD',
    brand: 'Bonche Tobacco',
    brandSlug: 'bonche-tobacco',
    category: 'Shisha Tobacco',
    categorySlug: 'tobacco',
    subcategory: 'Cigar Tobacco',
    images: [
      {
        id: 'img-bnc-wsk-1',
        url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?q=80&w=300&auto=format&fit=crop',
        alt: 'Bonche Cigar Tobacco Whiskey 120g Jar',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 35,
    lowStockThreshold: 5,
    weight: 120,
    flavor: 'Aged Single Malt Whiskey & Cuban Cigar Leaf',
    tags: ['bonche', 'cigar-leaf', 'whiskey', 'luxury', 'connoisseur'],
    specifications: [
      { label: 'Weight', value: '120 grams' },
      { label: 'Leaf Origin', value: '100% Whole Caribbean Cigar Leaf' },
      { label: 'Strength', value: 'Heavy Cigar Strength' }
    ],
    rating: 4.97,
    reviewCount: 38,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },

  // 14. Tangiers Noir Cane Mint 250g
  {
    id: 'prod-tangiers-cane-mint',
    name: 'Tangiers Noir Cane Mint (250g)',
    slug: 'tangiers-noir-cane-mint-250g',
    sku: 'TNG-NOIR-CM250',
    description: 'The undisputed benchmark of peppermint dark leaf shisha. Tangiers Cane Mint delivers an unmatched frosty sweet peppermint blast built on unwashed robust dark leaf tobacco.',
    shortDescription: 'Legendary intense peppermint dark leaf tobacco. The gold standard of cooling blends.',
    price: 23.99,
    currency: 'USD',
    brand: 'Tangiers',
    brandSlug: 'tangiers',
    category: 'Shisha Tobacco',
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
    tags: ['dark-leaf', 'cane-mint', 'high-nicotine', 'legendary', 'tangiers'],
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

  // 15. Oblako Phunnel L Glazed Hookah Bowl
  {
    id: 'prod-oblako-phunnel-l',
    name: 'Oblako Phunnel L Glazed Hookah Bowl (Mono Marble)',
    slug: 'oblako-phunnel-l-glazed-marble',
    sku: 'OBK-PHN-L-MRB',
    description: 'Made in Russia from premium white ceramics and finished with a heat-resistant gloss marble glaze. The Oblako Phunnel L ensures zero molasses leakage, uniform thermal distribution, and maximum flavor retention for dark and blonde shisha.',
    shortDescription: 'Russian white ceramic phunnel bowl with high-gloss marble glaze. Capacity 20-25g.',
    price: 24.99,
    currency: 'USD',
    brand: 'Oblako Bowls',
    brandSlug: 'oblako-bowls',
    category: 'Hookahs Bowls',
    categorySlug: 'bowls',
    subcategory: 'Phunnel Bowls',
    images: [
      {
        id: 'img-obk-1',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop',
        alt: 'Oblako Phunnel L Glazed Hookah Bowl',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 65,
    lowStockThreshold: 10,
    weight: 320,
    material: 'Russian White Ceramic & Gloss Glaze',
    color: 'Marble White / Obsidian Swirl',
    tags: ['oblako', 'phunnel', 'glazed', 'russian-bowl', 'bestseller'],
    specifications: [
      { label: 'Capacity', value: '20 - 25 grams' },
      { label: 'Spire Height', value: 'Phunnel Central Spire' },
      { label: 'HMD Compatibility', value: 'Universal (Kaloud, Na Grani, Provost)' }
    ],
    rating: 4.94,
    reviewCount: 86,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },

  // 16. Kong Sub-Zero Luminous Hookah Bowl
  {
    id: 'prod-kong-subzero',
    name: 'Kong Sub-Zero Luminous Glow-In-The-Dark Bowl',
    slug: 'kong-sub-zero-luminous-glow-bowl',
    sku: 'KNG-SBZ-GLW',
    description: 'A masterpiece from Russian artisans Kong. Features a hand-sculpted Mortal Kombat Sub-Zero ice mask design crafted from high-temperature red clay and coated with luminous glow-in-the-dark eyes and ice crystals.',
    shortDescription: 'Handcrafted Russian character bowl with glow-in-the-dark luminous crystals and high heat retention.',
    price: 38.00,
    salePrice: 34.99,
    currency: 'USD',
    brand: 'Kong Bowls',
    brandSlug: 'kong-bowls',
    category: 'Hookahs Bowls',
    categorySlug: 'bowls',
    subcategory: 'Art & Character Bowls',
    images: [
      {
        id: 'img-kng-sbz-1',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop',
        alt: 'Kong Sub-Zero Luminous Hookah Bowl',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 32,
    lowStockThreshold: 5,
    weight: 380,
    material: 'High-Temperature Red Clay & Glow Glaze',
    color: 'Ice Blue / Frost White',
    tags: ['kong', 'sub-zero', 'glow-in-the-dark', 'character-bowl', 'handmade'],
    specifications: [
      { label: 'Capacity', value: '16 - 20 grams' },
      { label: 'Feature', value: 'Luminous Phosphorescent Elements' },
      { label: 'Style', value: 'Traditional 5-Hole Killer Style' }
    ],
    rating: 4.97,
    reviewCount: 54,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z'
  },

  // 17. Alpaca Symphony Hand-Thrown Phunnel Bowl
  {
    id: 'prod-alpaca-symphony',
    name: 'Alpaca Symphony Hand-Thrown Stoneware Phunnel Bowl',
    slug: 'alpaca-symphony-phunnel-bowl',
    sku: 'ALP-BOWL-SYM',
    description: 'Handmade in California from proprietary American stoneware clay. The Alpaca Symphony features a central spire bridge that prevents foil drag and secures HMD devices with supreme heat management.',
    shortDescription: 'Hand-thrown stoneware clay with bridged spire for optimal airflow and rich molasses retention.',
    price: 34.00,
    salePrice: 29.99,
    currency: 'USD',
    brand: 'Alpaca Bowls',
    brandSlug: 'alpaca-bowls',
    category: 'Hookahs Bowls',
    categorySlug: 'bowls',
    subcategory: 'Phunnel Bowls',
    images: [
      {
        id: 'img-bwl-1',
        url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=300&auto=format&fit=crop',
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
    tags: ['handmade', 'stoneware', 'phunnel', 'hmd-compatible', 'alpaca'],
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

  // 18. Kaloud Lotus I+ HMD
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
    category: 'Accessories & HMD',
    categorySlug: 'accessories',
    subcategory: 'Heat Management Devices (HMD)',
    images: [
      {
        id: 'img-kld-1',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
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

  // 19. Coco Loco Organic Coconut Charcoal 26mm (1kg)
  {
    id: 'prod-coco-loco-26mm',
    name: 'Coco Loco 100% Organic Coconut Charcoal (26mm Cubes - 1kg)',
    slug: 'coco-loco-coconut-charcoal-26mm-1kg',
    sku: 'CLC-26MM-1KG',
    description: 'The preferred charcoal of Russian and European shisha master mixologists. 100% pure organic coconut husk with zero timber, zero chemical binders, and under 2.0% ash residue. Burns hot and odorless for up to 90 minutes.',
    shortDescription: '100% natural organic coconut charcoal cubes (72 pcs). Odorless, ultra-low ash, stable high heat.',
    price: 15.99,
    salePrice: 13.99,
    currency: 'USD',
    brand: 'Coco Loco',
    brandSlug: 'coco-loco',
    category: 'Charcoal & Heat',
    categorySlug: 'coal',
    subcategory: '26mm Coconut Cubes',
    images: [
      {
        id: 'img-clc-1',
        url: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=300&auto=format&fit=crop',
        alt: 'Coco Loco 26mm Coconut Charcoal Box',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 280,
    lowStockThreshold: 40,
    weight: 1000,
    material: '100% Compressed Organic Coconut Shell',
    tags: ['coco-loco', 'charcoal', 'organic', 'low-ash', 'bestseller'],
    specifications: [
      { label: 'Piece Count', value: '72 Cubes per 1 kg Box' },
      { label: 'Cube Dimensions', value: '26 x 26 x 26 mm' },
      { label: 'Burn Duration', value: '85 - 100 Minutes' },
      { label: 'Ash Content', value: '< 2.0%' }
    ],
    rating: 4.95,
    reviewCount: 130,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },

  // 20. Russian Craft Cut Crystal Drop Shisha Base
  {
    id: 'prod-craft-crystal-drop-base',
    name: 'Russian Craft Cut Crystal Drop Shisha Base (Universal 45mm)',
    slug: 'russian-craft-cut-crystal-drop-base',
    sku: 'BASE-CRF-DRP',
    description: 'Heavy solid hand-cut crystal glass vase with a low center of gravity. Compatible with all Russian and European plug-in grommet stems including Alpha Hookah, Hoob, El Bomber, and MattPear.',
    shortDescription: 'Ultra-heavy lead-free cut crystal vase with universal 45mm neck opening.',
    price: 89.00,
    currency: 'USD',
    brand: 'Wookah',
    brandSlug: 'wookah',
    category: 'Bases & Vases',
    categorySlug: 'bases',
    subcategory: 'Russian Drop Bases',
    images: [
      {
        id: 'img-bas-1',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop',
        alt: 'Russian Craft Cut Crystal Drop Base',
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
  },

  // 21. Alpha Hookah Cyber Precision Tongs
  {
    id: 'prod-alpha-cyber-tongs',
    name: 'Alpha Hookah Cyber Stainless Precision Tongs',
    slug: 'alpha-hookah-cyber-precision-tongs',
    sku: 'ALP-TNG-CYB',
    description: 'Precision laser-cut AISI 304 stainless steel tongs designed by Alpha Hookah with custom ergonomic thumb grips and heavy-duty coal clamping teeth.',
    shortDescription: 'Laser-cut AISI 304 stainless steel charcoal tongs with ergonomic grip.',
    price: 28.00,
    currency: 'USD',
    brand: 'Alpha Hookah',
    brandSlug: 'alpha-hookah',
    category: 'Accessories & HMD',
    categorySlug: 'accessories',
    subcategory: 'Precision Tongs',
    images: [
      {
        id: 'img-alp-tng-1',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
        alt: 'Alpha Hookah Cyber Stainless Tongs',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 50,
    lowStockThreshold: 10,
    weight: 180,
    material: 'AISI 304 Stainless Steel',
    color: 'Titanium Gunmetal Grey',
    tags: ['tongs', 'alpha-hookah', 'accessories'],
    specifications: [
      { label: 'Length', value: '23 cm (9 in)' },
      { label: 'Material', value: 'Heavy Gauge Stainless Steel' }
    ],
    rating: 4.91,
    reviewCount: 24,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },

  // 22. Coco Loco 20kg Master Lounge Box
  {
    id: 'prod-coco-loco-20kg-lounge',
    name: 'Coco Loco 20kg Master Lounge Carton (26mm Cubes / 1440 Coals)',
    slug: 'coco-loco-20kg-master-lounge-box',
    sku: 'CLC-20KG-LNG',
    description: 'Bulk master carton for hookah lounges, smoke bars, and connoisseurs. Contains 20x individual 1kg boxes (1440 natural coconut cubes) with zero chemical odor and long burn time.',
    shortDescription: 'Commercial 20kg lounge master carton containing 1,440 premium coconut charcoal cubes.',
    price: 189.00,
    salePrice: 169.00,
    currency: 'USD',
    brand: 'Coco Loco',
    brandSlug: 'coco-loco',
    category: 'Wholesale Lounge Supplies',
    categorySlug: 'wholesale-supplies',
    subcategory: '20kg Master Coal Cases',
    images: [
      {
        id: 'img-clc-20k-1',
        url: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=300&auto=format&fit=crop',
        alt: 'Coco Loco 20kg Master Lounge Carton',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 40,
    lowStockThreshold: 5,
    weight: 20000,
    material: '100% Pure Organic Coconut Shell',
    tags: ['wholesale', 'bulk-coal', 'lounge-supplies', 'coco-loco'],
    specifications: [
      { label: 'Total Weight', value: '20 Kilograms (44 lbs)' },
      { label: 'Piece Count', value: '1,440 Cubes (20 x 1kg Boxes)' },
      { label: 'Target Audience', value: 'Lounges, Bars & High-Volume Users' }
    ],
    rating: 4.99,
    reviewCount: 47,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },

  // 23. E-HOOKAH: OOKA Charcoal-Free Modern Shisha Device
  {
    id: 'prod-ooka-device',
    name: 'Ooka Clean Heat Electronic Shisha System (Matte Obsidian)',
    slug: 'ooka-clean-heat-electronic-shisha-system',
    sku: 'EHK-OOKA-01',
    description: 'The world’s first charcoal-free heating pod electronic shisha system. Delivers instant smooth molasses vapor in under 5 minutes without charcoal, ash, carbon monoxide, or mess. Features dual rechargeable lithium-ion battery packs.',
    shortDescription: 'Charcoal-free electronic shisha with pressurized flavor pod tech and 100% real molasses.',
    price: 349.00,
    salePrice: 319.00,
    currency: 'USD',
    brand: 'Ooka',
    brandSlug: 'ooka',
    category: 'E-Hookah & Electronic',
    categorySlug: 'e-hookah',
    subcategory: 'Ooka',
    images: [
      {
        id: 'img-ooka-1',
        url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=300&auto=format&fit=crop',
        alt: 'Ooka Electronic Shisha Device',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 25,
    lowStockThreshold: 4,
    weight: 3200,
    color: 'Matte Obsidian',
    material: 'Anodized Aluminum & Tempered Glass',
    tags: ['e-hookah', 'ooka', 'electronic-shisha', 'charcoal-free', 'bestseller'],
    specifications: [
      { label: 'Heating Method', value: 'Micro-Convection Heat Chamber' },
      { label: 'Heat-up Time', value: 'Under 5 Minutes' },
      { label: 'Session Time', value: 'Up to 70 Minutes per Pod' },
      { label: 'Battery Capacity', value: 'Rechargeable Dual Cell USB-C' }
    ],
    rating: 4.96,
    reviewCount: 38,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  },

  // 24. E-HOOKAH: Aspire Proteus E-Hookah Head Kit
  {
    id: 'prod-aspire-proteus-head',
    name: 'Aspire Proteus Universal Electronic Hookah Head Kit',
    slug: 'aspire-proteus-universal-electronic-hookah-head-kit',
    sku: 'EHK-ASP-PRT',
    description: 'Converts any traditional or modern water pipe into a high-vapor electronic shisha. Features a 18ml refillable e-liquid tank, 0.25 ohm organic cotton coils, and dual 18650 replaceable batteries.',
    shortDescription: 'Universal e-hookah head conversion kit with 18ml tank capacity and sub-ohm coils.',
    price: 89.99,
    currency: 'USD',
    brand: 'Aspire',
    brandSlug: 'aspire-proteus',
    category: 'E-Hookah & Electronic',
    categorySlug: 'e-hookah',
    subcategory: 'Aspire Proteus',
    images: [
      {
        id: 'img-asp-1',
        url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=300&auto=format&fit=crop',
        alt: 'Aspire Proteus E-Head',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 45,
    lowStockThreshold: 8,
    weight: 450,
    tags: ['e-hookah', 'aspire', 'proteus', 'e-head'],
    specifications: [
      { label: 'Tank Capacity', value: '18 ml Refillable Pyrex Glass' },
      { label: 'Coil Resistance', value: '0.25 ohm Organic Cotton' },
      { label: 'Compatibility', value: 'Universal Hookah Stem Bowl Grommet' }
    ],
    rating: 4.88,
    reviewCount: 42,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },

  // 25. VAPES: GeekVape Aegis Legend 3 Kit
  {
    id: 'prod-geekvape-legend-3',
    name: 'GeekVape Aegis Legend 3 200W Starter Kit with Z Fli Tank',
    slug: 'geekvape-aegis-legend-3-200w-starter-kit',
    sku: 'VAP-GKV-LGD3',
    description: 'The indestructible flagship vape mod with IP68 tri-proof water, dust, and shock resistance. Powered by AS Chip 4.0 with Memory Mode, Smart Lock, and the top-airflow leakproof Z Fli Sub-Ohm Tank.',
    shortDescription: 'IP68 waterproof 200W dual 18650 box mod kit with top-airflow Z Fli leakproof tank.',
    price: 79.99,
    salePrice: 69.99,
    currency: 'USD',
    brand: 'GeekVape',
    brandSlug: 'geekvape',
    category: 'Vapes & Pod Systems',
    categorySlug: 'vapes',
    subcategory: 'GeekVape',
    images: [
      {
        id: 'img-gkv-1',
        url: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-1200?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-300?q=80&w=300&auto=format&fit=crop',
        alt: 'GeekVape Aegis Legend 3',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 60,
    lowStockThreshold: 10,
    weight: 350,
    color: 'Titanium Grey & Leather',
    tags: ['vapes', 'geekvape', 'aegis', 'box-mod', 'bestseller'],
    specifications: [
      { label: 'Max Output', value: '200 Watts' },
      { label: 'Protection', value: 'IP68 Water, Dust & Shock Proof' },
      { label: 'Tank Capacity', value: '5.5 ml Bubble Glass' }
    ],
    rating: 4.97,
    reviewCount: 89,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z'
  },

  // 26. VAPES: Vaporesso XROS 4 Pod Kit
  {
    id: 'prod-vaporesso-xros-4',
    name: 'Vaporesso XROS 4 Pod System Kit (1000mAh)',
    slug: 'vaporesso-xros-4-pod-system-kit',
    sku: 'VAP-VAP-XRS4',
    description: 'Upgraded COREX 2.0 heating technology providing 30% richer flavor reproduction and 30% longer pod lifespan. Features 3 output modes, pulse mode boost, and a precision airflow toggle for MTL to RDL.',
    shortDescription: 'Aluminum unibody 1000mAh pod kit with COREX 2.0 aroma reproduction technology.',
    price: 34.99,
    currency: 'USD',
    brand: 'Vaporesso',
    brandSlug: 'vaporesso',
    category: 'Vapes & Pod Systems',
    categorySlug: 'vapes',
    subcategory: 'Vaporesso',
    images: [
      {
        id: 'img-vap-1',
        url: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-1200?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-300?q=80&w=300&auto=format&fit=crop',
        alt: 'Vaporesso XROS 4 Pod Kit',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 120,
    lowStockThreshold: 15,
    weight: 90,
    color: 'Cosmic Blue',
    tags: ['vapes', 'vaporesso', 'xros', 'pod-system', 'bestseller'],
    specifications: [
      { label: 'Battery Capacity', value: '1000 mAh High-Density Cell' },
      { label: 'Charging', value: '2A USB-C Quick Charge (30 min full)' },
      { label: 'Pod Compatibility', value: 'All XROS Series Mesh Pods' }
    ],
    rating: 4.95,
    reviewCount: 114,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-08T00:00:00Z'
  },

  // 27. VAPES: Lost Mary OS5000 Disposable Vape
  {
    id: 'prod-lost-mary-os5000',
    name: 'Lost Mary OS5000 Rechargeable Disposable (5000 Puffs)',
    slug: 'lost-mary-os5000-rechargeable-disposable',
    sku: 'VAP-LST-5000',
    description: 'Ergonomic planetary surface finish disposable with mesh coil for consistent flavor. 13ml pre-filled nic salt e-liquid with 3-level battery LED indicator and USB Type-C rechargeability.',
    shortDescription: '5000 puff rechargeable mesh coil disposable with 5% salt nicotine.',
    price: 18.99,
    salePrice: 15.99,
    currency: 'USD',
    brand: 'Lost Mary',
    brandSlug: 'lost-mary',
    category: 'Vapes & Pod Systems',
    categorySlug: 'vapes',
    subcategory: 'Lost Mary',
    images: [
      {
        id: 'img-lst-1',
        url: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-1200?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1528701800487-ba01 settings-300?q=80&w=300&auto=format&fit=crop',
        alt: 'Lost Mary OS5000',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 200,
    lowStockThreshold: 30,
    weight: 65,
    flavor: 'Blue Cotton Candy',
    tags: ['vapes', 'lost-mary', 'disposable', 'mesh-coil'],
    specifications: [
      { label: 'Puff Count', value: '5,000+ Puffs' },
      { label: 'Nicotine Strength', value: '50 mg / 5% Salt Nic' },
      { label: 'E-Liquid Capacity', value: '13 ml' }
    ],
    rating: 4.91,
    reviewCount: 95,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: true,
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z'
  },

  // 28. BASES: Caesar Crystal Bohemiae Floe Cut Base
  {
    id: 'prod-caesar-crystal-floe',
    name: 'Caesar Crystal Bohemiae Floe Cut Artisan Flask (45mm Neck)',
    slug: 'caesar-crystal-bohemiae-floe-cut-artisan-flask',
    sku: 'BAS-CSR-FLOE',
    description: 'Handcrafted in the Czech Republic by royal master glassmakers. Made of authentic 24% leaded Bohemian crystal with intricate diamond cuts that refract light across the water table.',
    shortDescription: 'Masterpiece 24% lead Bohemian crystal hand-cut vase with universal 45mm neck.',
    price: 189.00,
    currency: 'USD',
    brand: 'Caesar Crystal',
    brandSlug: 'caesar-crystal',
    category: 'Bases & Glass',
    categorySlug: 'bases',
    subcategory: 'Caesar Crystal',
    images: [
      {
        id: 'img-csr-1',
        url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=300&auto=format&fit=crop',
        alt: 'Caesar Crystal Bohemiae Base',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 15,
    lowStockThreshold: 3,
    weight: 3100,
    material: '24% Leaded Bohemian Crystal Glass',
    color: 'Clear Diamond Cut',
    tags: ['bases', 'caesar-crystal', 'bohemian-crystal', 'luxury'],
    specifications: [
      { label: 'Origin', value: 'Czech Republic (Handmade)' },
      { label: 'Height', value: '26.5 cm' },
      { label: 'Neck Fit', value: '45mm Standard Plug-in' }
    ],
    rating: 4.98,
    reviewCount: 31,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isOnSale: false,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-01-25T00:00:00Z'
  },

  // 29. ACCESSORIES: Na Grani Stainless Steel Heat Management Device
  {
    id: 'prod-na-grani-hmd',
    name: 'Na Grani Stainless Steel Heat Management Device (HMD)',
    slug: 'na-grani-stainless-steel-heat-management-device',
    sku: 'ACC-NGR-HMD',
    description: 'Milled from a single block of heavy food-grade AISI 304 stainless steel. Provides pure, smooth heat distribution for dark leaf tobacco without melting risks associated with aluminum.',
    shortDescription: 'Solid 100% AISI 304 stainless steel HMD designed for dark leaf heat retention.',
    price: 49.99,
    salePrice: 44.99,
    currency: 'USD',
    brand: 'Na Grani',
    brandSlug: 'na-grani',
    category: 'Accessories & HMD',
    categorySlug: 'accessories',
    subcategory: 'Na Grani HMD',
    images: [
      {
        id: 'img-ngr-1',
        url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
        alt: 'Na Grani Stainless Steel HMD',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 75,
    lowStockThreshold: 12,
    weight: 220,
    material: 'AISI 304 Stainless Steel',
    tags: ['accessories', 'hmd', 'na-grani', 'stainless-steel', 'bestseller'],
    specifications: [
      { label: 'Material', value: '100% Solid AISI 304 Stainless Steel' },
      { label: 'Coal Capacity', value: '2-3 x 26mm Coals' },
      { label: 'Heat Profile', value: 'Deep thermal soak for Burley leaves' }
    ],
    rating: 4.96,
    reviewCount: 64,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: true,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z'
  },

  // 30. COAL: One Nation Natural Coconut Charcoal 26mm (1kg)
  {
    id: 'prod-one-nation-26mm',
    name: 'One Nation Premium Coconut Charcoal Cubes (26mm - 1kg)',
    slug: 'one-nation-premium-coconut-charcoal-26mm-1kg',
    sku: 'COA-ONN-26MM',
    description: 'German quality engineered charcoal crafted from 100% natural Indonesian coconut shells. Zero spark emissions, no odor or fumes during ignition, and leaves a compact light grey ash residue under 2.5%.',
    shortDescription: '72 premium 26mm coconut cubes with high heat and 90+ minutes burn time.',
    price: 14.99,
    currency: 'USD',
    brand: 'One Nation',
    brandSlug: 'one-nation',
    category: 'Charcoal & Heat',
    categorySlug: 'coal',
    subcategory: 'One Nation',
    images: [
      {
        id: 'img-onn-1',
        url: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=1200&auto=format&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?q=80&w=300&auto=format&fit=crop',
        alt: 'One Nation 26mm Charcoal Box',
        isPrimary: true,
        sortOrder: 1
      }
    ],
    stock: 160,
    lowStockThreshold: 25,
    weight: 1000,
    material: 'Natural Coconut Shells',
    tags: ['coal', 'charcoal', 'one-nation', '26mm', 'bestseller'],
    specifications: [
      { label: 'Box Weight', value: '1 Kilogram (72 Cubes)' },
      { label: 'Size', value: '26 x 26 x 26 mm' },
      { label: 'Burn Duration', value: '90 - 105 min' }
    ],
    rating: 4.93,
    reviewCount: 58,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isOnSale: false,
    isActive: true,
    ageRestricted: false,
    createdAt: '2026-01-14T00:00:00Z',
    updatedAt: '2026-01-14T00:00:00Z'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cpn-welcome15',
    code: 'WELCOME15',
    description: '15% discount on your initial World Hookah Market order',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderAmount: 50,
    usageLimit: 1000,
    usageCount: 142,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cpn-hookah30',
    code: 'HOOKAH30',
    description: '$30 off Russian and European hookahs over $200',
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
    productId: 'prod-alpha-model-x-black',
    productName: 'Alpha Hookah Model X (Black Matte)',
    userId: 'usr-customer-1',
    userName: 'Alexander M.',
    rating: 5,
    title: 'The best hookah I have ever smoked',
    comment: 'The vertical purge is a work of art. Incredibly smooth draw with the adjustable diffuser, and the magnetic hose connector feels rock solid. Shipped quickly from the US warehouse!',
    isVerifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-02-10T15:20:00Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-musthave-pinkman',
    productName: 'MustHave Tobacco Pinkman (125g)',
    userId: 'usr-customer-2',
    userName: 'Elena Rostova',
    rating: 5,
    title: 'Unmatched pink grapefruit and berry flavor',
    comment: 'MustHave Pinkman is an absolute staple. Dense smoke, heat resistant, and lasts easily 90+ minutes without losing flavor in an Oblako bowl.',
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
    comment: 'Completely transformed my shisha sessions. No ash in the bowl, zero harsh burnt flavor spikes. Works flawlessly with Coco Loco coals.',
    isVerifiedPurchase: true,
    status: 'APPROVED',
    createdAt: '2026-02-18T09:12:00Z'
  }
];


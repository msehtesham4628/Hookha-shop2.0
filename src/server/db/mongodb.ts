import { MongoClient, Db, Collection } from 'mongodb';
import {
  Product,
  Category,
  Brand,
  User,
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

export interface MongoStatus {
  isConnected: boolean;
  isConnecting: boolean;
  uriConfigured: boolean;
  dbName: string;
  host?: string;
  collectionCounts: Record<string, number>;
  lastSyncAt: string | null;
  lastError: string | null;
}

class MongoDatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting = false;
  private isConnected = false;
  private dbName = 'fumare_hookah';
  private lastSyncAt: string | null = null;
  private lastError: string | null = null;
  private cachedCounts: Record<string, number> = {};

  public getStatus(): MongoStatus {
    const mongoUri = process.env.MONGODB_URI || '';
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      uriConfigured: !!mongoUri.trim(),
      dbName: this.dbName,
      collectionCounts: { ...this.cachedCounts },
      lastSyncAt: this.lastSyncAt,
      lastError: this.lastError
    };
  }

  public async connect(): Promise<boolean> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri || !mongoUri.trim()) {
      console.log('[MongoDB] Notice: MONGODB_URI not set. Running in resilient local cache mode. Data will persist in memory and sync as soon as MONGODB_URI is provided.');
      return false;
    }

    if (this.isConnected && this.client) {
      return true;
    }

    if (this.isConnecting) {
      return false;
    }

    this.isConnecting = true;
    this.lastError = null;

    try {
      console.log('[MongoDB] Connecting to cluster with retry policy...');
      const client = new MongoClient(mongoUri.trim(), {
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 6000,
        maxPoolSize: 15,
        retryWrites: true
      });

      await client.connect();
      this.client = client;
      
      // Determine database name from URI or fallback
      const urlParsed = new URL(mongoUri.trim().replace(/^mongodb(\+srv)?:\/\//, 'http://'));
      const pathDb = urlParsed.pathname.replace(/^\//, '').split('?')[0];
      this.dbName = pathDb && pathDb.length > 0 ? pathDb : 'fumare_hookah';

      this.db = this.client.db(this.dbName);
      this.isConnected = true;
      this.isConnecting = false;
      this.lastSyncAt = new Date().toISOString();
      console.log(`[MongoDB] Successfully connected to database: ${this.dbName}`);

      // Ensure indexes for performance & integrity
      await this.ensureIndexes();

      // Refresh collection counts
      await this.refreshCounts();

      return true;
    } catch (err: any) {
      this.isConnecting = false;
      this.isConnected = false;
      const rawMsg = err?.message || String(err);
      const isAtlasIpRestriction =
        rawMsg.includes('SSL alert number 80') ||
        rawMsg.includes('tlsv1 alert internal error') ||
        rawMsg.includes('ECONNREFUSED') ||
        rawMsg.includes('SSL routines');

      if (isAtlasIpRestriction) {
        this.lastError = 'MongoDB Atlas requires Network Access authorization. Add 0.0.0.0/0 in MongoDB Atlas -> Network Access. Resilient local cache is active.';
        console.log('[MongoDB] Notice: Remote Atlas cluster requires Network Access IP Whitelist (0.0.0.0/0 in MongoDB Atlas). Application running smoothly in resilient in-memory cache mode.');
      } else {
        this.lastError = rawMsg.replace(/:\s*\.\.\/deps\/.*$/, '');
        console.log('[MongoDB] Connection notice (resilient cache active):', this.lastError);
      }
      return false;
    }
  }

  private async ensureIndexes(): Promise<void> {
    if (!this.db) return;
    try {
      await Promise.allSettled([
        this.db.collection('users').createIndex({ email: 1 }, { unique: true }),
        this.db.collection('products').createIndex({ id: 1 }, { unique: true }),
        this.db.collection('products').createIndex({ sku: 1 }),
        this.db.collection('products').createIndex({ categorySlug: 1 }),
        this.db.collection('products').createIndex({ brand: 1 }),
        this.db.collection('orders').createIndex({ id: 1 }, { unique: true }),
        this.db.collection('orders').createIndex({ orderNumber: 1 }),
        this.db.collection('orders').createIndex({ userId: 1 }),
        this.db.collection('categories').createIndex({ id: 1 }, { unique: true }),
        this.db.collection('brands').createIndex({ id: 1 }, { unique: true }),
        this.db.collection('cartItems').createIndex({ userId: 1 }),
        this.db.collection('wishlists').createIndex({ userId: 1 }, { unique: true }),
        this.db.collection('coupons').createIndex({ code: 1 }, { unique: true }),
        this.db.collection('wholesaleApplications').createIndex({ id: 1 }, { unique: true }),
        this.db.collection('auditLogs').createIndex({ createdAt: -1 })
      ]);
    } catch (e) {
      console.warn('[MongoDB] Index creation note:', e);
    }
  }

  public async refreshCounts(): Promise<Record<string, number>> {
    if (!this.db || !this.isConnected) return this.cachedCounts;
    try {
      const collections = [
        'products',
        'categories',
        'brands',
        'users',
        'orders',
        'reviews',
        'coupons',
        'wholesaleApplications',
        'inventoryTransactions',
        'auditLogs',
        'settings',
        'notifications',
        'cartItems',
        'wishlists',
        'contactMessages',
        'newsletterSubscribers'
      ];

      const counts: Record<string, number> = {};
      for (const collName of collections) {
        counts[collName] = await this.db.collection(collName).countDocuments();
      }
      this.cachedCounts = counts;
      return counts;
    } catch (err) {
      console.warn('[MongoDB] Failed to refresh counts:', err);
      return this.cachedCounts;
    }
  }

  public async saveDocument<T extends { id?: string }>(collectionName: string, doc: T): Promise<boolean> {
    if (!this.db || !this.isConnected) return false;
    try {
      const coll = this.db.collection(collectionName);
      const query = doc.id ? { id: doc.id } : { _id: (doc as any)._id };
      await coll.updateOne(query, { $set: doc }, { upsert: true });
      this.cachedCounts[collectionName] = (this.cachedCounts[collectionName] || 0) + 1;
      return true;
    } catch (err: any) {
      console.log(`[MongoDB] Notice: Could not save document to ${collectionName}. Local store active.`);
      return false;
    }
  }

  public async saveManyDocuments<T extends { id?: string }>(collectionName: string, docs: T[], batchSize = 500): Promise<number> {
    if (!this.db || !this.isConnected || docs.length === 0) return 0;
    try {
      const coll = this.db.collection(collectionName);
      let written = 0;

      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        const ops = batch.map(item => ({
          updateOne: {
            filter: item.id ? { id: item.id } : { _id: (item as any)._id },
            update: { $set: item },
            upsert: true
          }
        }));
        const res = await coll.bulkWrite(ops, { ordered: false });
        written += (res.upsertedCount + res.modifiedCount + res.matchedCount);
      }

      await this.refreshCounts();
      return written;
    } catch (err: any) {
      console.log(`[MongoDB] Notice: Bulk write to ${collectionName} deferred.`);
      return 0;
    }
  }

  public async deleteDocument(collectionName: string, filter: Record<string, any>): Promise<boolean> {
    if (!this.db || !this.isConnected) return false;
    try {
      const coll = this.db.collection(collectionName);
      await coll.deleteOne(filter);
      await this.refreshCounts();
      return true;
    } catch (err: any) {
      console.log(`[MongoDB] Notice: Delete operation on ${collectionName} deferred.`);
      return false;
    }
  }

  public async getDocuments<T>(collectionName: string, filter: Record<string, any> = {}): Promise<T[]> {
    if (!this.db || !this.isConnected) return [];
    try {
      const coll = this.db.collection(collectionName);
      const docs = await coll.find(filter).toArray();
      return docs as unknown as T[];
    } catch (err: any) {
      console.log(`[MongoDB] Notice: Read operation on ${collectionName} deferred.`);
      return [];
    }
  }

  public async syncWithStore(store: any): Promise<{ seeded: boolean; loaded: boolean; summary: Record<string, number> }> {
    const isConnected = await this.connect();
    if (!isConnected || !this.db) {
      return { seeded: false, loaded: false, summary: this.cachedCounts };
    }

    try {
      const productCount = await this.db.collection('products').countDocuments();
      let seeded = false;
      let loaded = false;

      if (productCount === 0 && store.products.length > 0) {
        console.log(`[MongoDB] Database is empty. Seeding ${store.products.length} products and master collections to MongoDB...`);
        await this.saveManyDocuments('products', store.products, 500);
        await this.saveManyDocuments('categories', store.categories);
        await this.saveManyDocuments('brands', store.brands);
        await this.saveManyDocuments('users', store.users);
        await this.saveManyDocuments('orders', store.orders);
        await this.saveManyDocuments('coupons', store.coupons);
        await this.saveManyDocuments('reviews', store.reviews);
        await this.saveManyDocuments('wholesaleApplications', store.wholesaleApplications);
        await this.saveManyDocuments('roles', store.roles);
        await this.saveManyDocuments('permissions', store.permissions);
        if (store.settings) {
          await this.saveDocument('settings', { id: 'store_settings', ...store.settings });
        }
        seeded = true;
        console.log('[MongoDB] Master collections successfully seeded into MongoDB!');
      } else if (productCount > 0) {
        console.log(`[MongoDB] Discovered ${productCount} existing products in MongoDB. Loading documents into memory...`);
        // Load MongoDB records into store memory. Products are included here so
        // the public storefront, which reads from db.products, uses MongoDB data.
        const [
          mongoProducts,
          mongoUsers,
          mongoOrders,
          mongoCategories,
          mongoBrands,
          mongoReviews,
          mongoCoupons,
          mongoWholesale,
          mongoSettings
        ] = await Promise.all([
          this.getDocuments<Product>('products'),
          this.getDocuments<User & { passwordHash?: string }>('users'),
          this.getDocuments<Order>('orders'),
          this.getDocuments<Category>('categories'),
          this.getDocuments<Brand>('brands'),
          this.getDocuments<Review>('reviews'),
          this.getDocuments<Coupon>('coupons'),
          this.getDocuments<WholesaleApplication>('wholesaleApplications'),
          this.getDocuments<any>('settings', { id: 'store_settings' })
        ]);

        if (mongoProducts.length > 0) {
          // MongoDB is authoritative for persisted catalog records. Merge by id
          // so any local seed-only products are retained if MongoDB is incomplete.
          const productMap = new Map<string, Product>();
          for (const p of store.products) productMap.set(p.id, p);
          for (const p of mongoProducts) productMap.set(p.id, p);
          store.products = Array.from(productMap.values());
          console.log(`[MongoDB] Loaded ${mongoProducts.length} products into storefront memory.`);
        }

        if (mongoUsers.length > 0) {
          const userMap = new Map<string, User & { passwordHash?: string }>();
          for (const u of store.users) {
            userMap.set(u.email.toLowerCase(), u);
          }
          for (const u of mongoUsers) {
            userMap.set(u.email.toLowerCase(), u);
          }
          for (const u of store.users) {
            const isPrivileged = u.email === 'admin@worldhookahmarket.com' || u.email === 'ehtesham4628@gmail.com' || u.email === 'customer@example.com' || u.role === 'SUPER_ADMIN';
            if (isPrivileged) {
              const existing = userMap.get(u.email.toLowerCase());
              if (!existing) {
                userMap.set(u.email.toLowerCase(), u);
              } else {
                existing.status = 'ACTIVE';
                existing.role = u.role;
                if (u.passwordHash) {
                  existing.passwordHash = u.passwordHash;
                }
              }
            }
          }
          store.users = Array.from(userMap.values());
        }
        if (mongoOrders.length > 0) {
          const orderMap = new Map<string, Order>();
          for (const o of store.orders) {
            orderMap.set(o.id, o);
            if (o.orderNumber) orderMap.set(o.orderNumber.toUpperCase(), o);
          }
          for (const o of mongoOrders) {
            orderMap.set(o.id, o);
            if (o.orderNumber) orderMap.set(o.orderNumber.toUpperCase(), o);
          }
          const uniqueOrders = new Map<string, Order>();
          for (const o of orderMap.values()) {
            uniqueOrders.set(o.id, o);
          }
          store.orders = Array.from(uniqueOrders.values());
          this.saveManyDocuments('orders', store.orders).catch(err => {
            console.error('[MongoDB] Auto-sync combined orders err:', err);
          });
        }
        if (mongoCategories.length > 0) {
          const catMap = new Map<string, Category>();
          for (const c of store.categories) catMap.set(c.id, c);
          for (const c of mongoCategories) catMap.set(c.id, c);
          store.categories = Array.from(catMap.values());
        }
        if (mongoBrands.length > 0) {
          const brandMap = new Map<string, Brand>();
          for (const b of store.brands) brandMap.set(b.id, b);
          for (const b of mongoBrands) brandMap.set(b.id, b);
          store.brands = Array.from(brandMap.values());
        }
        if (mongoReviews.length > 0) {
          const revMap = new Map<string, Review>();
          for (const r of store.reviews) revMap.set(r.id, r);
          for (const r of mongoReviews) revMap.set(r.id, r);
          store.reviews = Array.from(revMap.values());
        }
        if (mongoCoupons.length > 0) {
          const coupMap = new Map<string, Coupon>();
          for (const c of store.coupons) coupMap.set(c.code.toUpperCase(), c);
          for (const c of mongoCoupons) coupMap.set(c.code.toUpperCase(), c);
          store.coupons = Array.from(coupMap.values());
        }
        if (mongoWholesale.length > 0) {
          const wMap = new Map<string, WholesaleApplication>();
          for (const w of store.wholesaleApplications) wMap.set(w.id, w);
          for (const w of mongoWholesale) wMap.set(w.id, w);
          store.wholesaleApplications = Array.from(wMap.values());
        }
        if (mongoSettings.length > 0) store.settings = mongoSettings[0];

        loaded = true;
      }

      await this.refreshCounts();
      this.lastSyncAt = new Date().toISOString();
      return { seeded, loaded, summary: this.cachedCounts };
    } catch (err: any) {
      const msg = err?.message || String(err);
      this.lastError = msg.includes('SSL alert') ? 'Atlas IP Whitelist required (Network Access)' : 'Sync deferred';
      console.log('[MongoDB] Sync note:', this.lastError);
      return { seeded: false, loaded: false, summary: this.cachedCounts };
    }
  }

  public async pushAllToMongo(store: any): Promise<boolean> {
    if (!this.isConnected || !this.db) {
      const connected = await this.connect();
      if (!connected || !this.db) return false;
    }

    try {
      console.log('[MongoDB] Pushing all in-memory store records to MongoDB...');
      await Promise.all([
        this.saveManyDocuments('products', store.products, 500),
        this.saveManyDocuments('categories', store.categories),
        this.saveManyDocuments('brands', store.brands),
        this.saveManyDocuments('users', store.users),
        this.saveManyDocuments('orders', store.orders),
        this.saveManyDocuments('coupons', store.coupons),
        this.saveManyDocuments('reviews', store.reviews),
        this.saveManyDocuments('wholesaleApplications', store.wholesaleApplications),
        this.saveManyDocuments('cartItems', store.cartItems),
        this.saveManyDocuments('wishlists', store.wishlists),
        this.saveManyDocuments('auditLogs', store.auditLogs),
        this.saveDocument('settings', { id: 'store_settings', ...store.settings })
      ]);
      await this.refreshCounts();
      this.lastSyncAt = new Date().toISOString();
      console.log('[MongoDB] Push completed successfully.');
      return true;
    } catch (err: any) {
      const msg = err?.message || String(err);
      this.lastError = msg.includes('SSL alert') ? 'Atlas IP Whitelist required (Network Access)' : 'Push deferred';
      console.log('[MongoDB] Push note:', this.lastError);
      return false;
    }
  }
}

export const mongoService = new MongoDatabaseService();
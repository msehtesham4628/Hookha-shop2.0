import { MongoClient, Db } from 'mongodb';
import {
  Product,
  Category,
  Brand,
  User,
  Order,
  Review,
  Coupon,
  WholesaleApplication
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
  private connectPromise: Promise<boolean> | null = null;
  private isConnected = false;
  private dbName = 'fumare_hookah';
  private lastSyncAt: string | null = null;
  private lastError: string | null = null;
  private cachedCounts: Record<string, number> = {};

  public getStatus(): MongoStatus {
    const mongoUri = process.env.MONGODB_URI || '';
    return {
      isConnected: this.isConnected,
      isConnecting: this.connectPromise !== null,
      uriConfigured: !!mongoUri.trim(),
      dbName: this.dbName,
      collectionCounts: { ...this.cachedCounts },
      lastSyncAt: this.lastSyncAt,
      lastError: this.lastError
    };
  }

  public async connect(): Promise<boolean> {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri?.trim()) {
      return false;
    }

    if (this.isConnected && this.client) {
      return true;
    }

    // Coalesce concurrent connection attempts into the same promise
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = (async () => {
      this.lastError = null;
      try {
        const client = new MongoClient(mongoUri.trim(), {
          serverSelectionTimeoutMS: 6000,
          connectTimeoutMS: 6000,
          maxPoolSize: 15,
          retryWrites: true
        });

        await client.connect();
        this.client = client;

        // Native driver database resolution
        const defaultDb = client.options.dbName;
        this.dbName = defaultDb && defaultDb !== 'test' ? defaultDb : 'fumare_hookah';
        this.db = this.client.db(this.dbName);

        this.isConnected = true;
        this.lastSyncAt = new Date().toISOString();

        await this.ensureIndexes();
        await this.refreshCounts();

        return true;
      } catch (err: any) {
        this.isConnected = false;
        const rawMsg = err?.message || String(err);
        this.lastError = rawMsg.replace(/:\s*\.\.\/deps\/.*$/, '');
        return false;
      } finally {
        this.connectPromise = null;
      }
    })();

    return this.connectPromise;
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
        this.db.collection('cartItems').createIndex({ sessionId: 1 }),
        this.db.collection('wishlists').createIndex({ userId: 1 }, { unique: true }),
        this.db.collection('coupons').createIndex({ code: 1 }, { unique: true }),
        this.db.collection('wholesaleApplications').createIndex({ id: 1 }, { unique: true }),
        this.db.collection('auditLogs').createIndex({ createdAt: -1 })
      ]);
    } catch (e) {
      console.warn('[MongoDB] Index creation error:', e);
    }
  }

  public async refreshCounts(): Promise<Record<string, number>> {
    if (!this.db || !this.isConnected) return this.cachedCounts;
    try {
      const collections = [
        'products', 'categories', 'brands', 'users', 'orders',
        'reviews', 'coupons', 'wholesaleApplications', 'inventoryTransactions',
        'auditLogs', 'settings', 'notifications', 'cartItems', 'wishlists'
      ];

      const entries = await Promise.all(
        collections.map(async (coll) => {
          const count = await this.db!.collection(coll).estimatedDocumentCount();
          return [coll, count] as const;
        })
      );

      this.cachedCounts = Object.fromEntries(entries);
      return this.cachedCounts;
    } catch (err) {
      return this.cachedCounts;
    }
  }

  public async deleteDocument(collectionName: string, filter: Record<string, any>): Promise<boolean> {
    if (!this.db || !this.isConnected) return false;
    
    // Prevent accidental full collection wipes on empty objects
    if (!filter || Object.keys(filter).length === 0) {
      console.error(`[MongoDB] Rejected empty filter query on ${collectionName}`);
      return false;
    }

    try {
      const coll = this.db.collection(collectionName);
      const queryParts: any[] = [];
      
      if (filter.id) {
        queryParts.push({ id: filter.id });
        queryParts.push({ _id: filter.id });
      }
      if (filter.slug) queryParts.push({ slug: filter.slug });
      if (filter.name) queryParts.push({ name: filter.name });
      if (filter.sku) queryParts.push({ sku: filter.sku });

      const finalQuery = queryParts.length > 0 ? { $or: queryParts } : filter;
      await coll.deleteMany(finalQuery);
      await this.refreshCounts();
      return true;
    } catch (err: any) {
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
        const ops = batch.map((item) => {
          const itemCopy = { ...(item as any) };
          delete itemCopy._id;
          return {
            updateOne: {
              filter: item.id ? { id: item.id } : { _id: (item as any)._id },
              update: { $set: itemCopy },
              upsert: true
            }
          };
        });
        const res = await coll.bulkWrite(ops, { ordered: false });
        written += (res.upsertedCount + res.modifiedCount + res.matchedCount);
      }

      await this.refreshCounts();
      return written;
    } catch (err: any) {
      return 0;
    }
  }

  public async getDocuments<T>(collectionName: string, filter: Record<string, any> = {}): Promise<T[]> {
    if (!this.db || !this.isConnected) return [];
    try {
      return (await this.db.collection(collectionName).find(filter).toArray()) as unknown as T[];
    } catch {
      return [];
    }
  }

  public async saveDocument<T extends { id?: string }>(collectionName: string, doc: T): Promise<boolean> {
    if (!this.db || !this.isConnected) return false;
    try {
      const coll = this.db.collection(collectionName);
      const query = doc.id ? { id: doc.id } : { _id: (doc as any)._id };
      const docCopy = { ...(doc as any) };
      delete docCopy._id;
      await coll.updateOne(query, { $set: docCopy }, { upsert: true });
      await this.refreshCounts();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Atomically append deletion tombstones to the shared persistence document.
   * This prevents concurrent Vercel Lambdas from overwriting each other's
   * deletions when they save the whole persistence document at the same time.
   */
  public async persistDeletion(collectionName: string, ids: string[]): Promise<boolean> {
    if (!this.db || !this.isConnected || !ids.length) return false;
    try {
      const fieldByCollection: Record<string, string> = {
        products: 'deletedProductIds',
        categories: 'deletedCategoryIds',
        brands: 'deletedBrandIds',
        coupons: 'deletedCouponIds',
        users: 'deletedUserIds'
      };
      const field = fieldByCollection[collectionName];
      if (!field) return false;

      const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
      await this.db.collection('persistence').updateOne(
        { id: 'store_persistence' },
        { $addToSet: { [field]: { $each: uniqueIds } } },
        { upsert: true }
      );
      await this.refreshCounts();
      console.log(`[MongoDB] Atomically persisted ${uniqueIds.length} ${field} tombstone(s).`);
      return true;
    } catch (err: any) {
      console.warn(`[MongoDB] Atomic persistence tombstone failed for ${collectionName}:`, err?.message);
      return false;
    }
  }

  public async syncWithStore(store: any): Promise<{ seeded: boolean; loaded: boolean; summary: Record<string, number> }> {
    if (!this.isConnected && !(await this.connect())) {
      return { seeded: false, loaded: false, summary: this.cachedCounts };
    }

    try {
      // 1. Sync persistence document
      const persistenceDoc = await this.db!.collection('persistence').findOne({ id: 'store_persistence' });
      if (persistenceDoc) {
        store.mergePersistenceData(persistenceDoc);
      }

      // Purge deleted tombstones in MongoDB
      if (store.persistenceData?.deletedProductIds?.length > 0) {
        await this.db!.collection('products').deleteMany({
          id: { $in: store.persistenceData.deletedProductIds }
        });
      }
      if (store.persistenceData?.deletedUserIds?.length > 0) {
        await this.db!.collection('users').deleteMany({
          id: { $in: store.persistenceData.deletedUserIds }
        });
      }

      await this.refreshCounts();

      // 2. If MongoDB collections are already populated, load data into store
      const hasProductsInDb = (this.cachedCounts['products'] || 0) > 0;
      let loaded = false;
      let seeded = false;

      if (hasProductsInDb) {
        // Hydrate products
        const mongoProducts = await this.getDocuments<Product>('products');
        const deletedProdSet = new Set((store.persistenceData?.deletedProductIds || []).map((id: string) => id.toLowerCase().trim()));
        const activeMongoProducts = mongoProducts.filter((p: any) => !deletedProdSet.has(String(p.id || '').toLowerCase().trim()));

        if (activeMongoProducts.length > 0) {
          const prodMap = new Map<string, Product>();
          for (const p of store.products) prodMap.set(p.id, p);
          for (const p of activeMongoProducts) prodMap.set(p.id, p);
          store.products = Array.from(prodMap.values()).filter((p: Product) => !store.isProductDeleted(p.id));
        }

        // Hydrate categories
        const mongoCategories = await this.getDocuments<Category>('categories');
        if (mongoCategories.length > 0) {
          const catMap = new Map<string, Category>();
          for (const c of store.categories) catMap.set(c.id, c);
          for (const c of mongoCategories) catMap.set(c.id, c);
          store.categories = Array.from(catMap.values()).filter((c: Category) => !store.isCategoryDeleted(c.id) && !store.isCategoryDeleted(c.slug));
        }

        // Hydrate brands
        const mongoBrands = await this.getDocuments<Brand>('brands');
        if (mongoBrands.length > 0) {
          const brandMap = new Map<string, Brand>();
          for (const b of store.brands) brandMap.set(b.id, b);
          for (const b of mongoBrands) brandMap.set(b.id, b);
          store.brands = Array.from(brandMap.values()).filter((b: Brand) => !store.isBrandDeleted(b.id) && !store.isBrandDeleted(b.slug));
        }

        // Hydrate users
        const mongoUsers = await this.getDocuments<User & { passwordHash?: string }>('users');
        if (mongoUsers.length > 0) {
          const activeMongoUsers = mongoUsers.filter((u: any) => !store.isUserDeleted(u.id) && !store.isUserDeleted(u.email));
          const userMap = new Map<string, User & { passwordHash?: string }>();
          for (const u of store.users) {
            if (!store.isUserDeleted(u.id) && !store.isUserDeleted(u.email)) {
              userMap.set(u.email.toLowerCase(), u);
            }
          }
          for (const u of activeMongoUsers) {
            userMap.set(u.email.toLowerCase(), u);
          }
          store.users = Array.from(userMap.values()).filter((u: any) => !store.isUserDeleted(u.id) && !store.isUserDeleted(u.email));
        }

        // Hydrate orders
        const mongoOrders = await this.getDocuments<Order>('orders');
        if (mongoOrders.length > 0) {
          const orderMap = new Map<string, Order>();
          for (const o of store.orders) orderMap.set(o.id, o);
          for (const o of mongoOrders) orderMap.set(o.id, o);
          store.orders = Array.from(orderMap.values());
        }

        // Hydrate coupons
        const mongoCoupons = await this.getDocuments<Coupon>('coupons');
        if (mongoCoupons.length > 0) {
          const couponMap = new Map<string, Coupon>();
          for (const c of store.coupons) couponMap.set(c.id, c);
          for (const c of mongoCoupons) couponMap.set(c.id, c);
          const delCouponSet = new Set(store.persistenceData?.deletedCouponIds || []);
          store.coupons = Array.from(couponMap.values()).filter((c: Coupon) => !delCouponSet.has(c.id));
        }

        // Hydrate settings
        const mongoSettings = await this.getDocuments<any>('settings', { id: 'store_settings' });
        if (mongoSettings.length > 0) {
          const s = { ...mongoSettings[0] };
          delete s._id;
          delete s.id;
          store.settings = { ...store.settings, ...s };
        }

        // Hydrate collections that store directly
        const simpleCollections = [
          'reviews', 'wholesaleApplications', 'inventoryTransactions',
          'auditLogs', 'notifications', 'mediaLibrary', 'addresses',
          'cartItems', 'wishlists', 'contactMessages'
        ] as const;

        for (const coll of simpleCollections) {
          const docs = await this.getDocuments<any>(coll);
          if (docs.length > 0 && Array.isArray((store as any)[coll])) {
            (store as any)[coll] = docs;
          }
        }

        store.applyPersistence();
        loaded = true;
      } else {
        // Mongo is connected but empty - seed it from local store
        seeded = await this.pushAllToMongo(store);
      }

      this.lastSyncAt = new Date().toISOString();
      return { seeded, loaded, summary: this.cachedCounts };
    } catch (err: any) {
      console.warn('[MongoDB] syncWithStore error:', err?.message || err);
      this.lastError = err?.message || 'Sync operation failed';
      return { seeded: false, loaded: false, summary: this.cachedCounts };
    }
  }

  // Safe differential push without dropping target collections
  private async safeSyncCollection(collectionName: string, docs: any[]): Promise<void> {
    if (!this.db || !this.isConnected || !docs.length) return;
    const coll = this.db.collection(collectionName);
    
    // Bulk upsert documents to avoid downtime/data drop windows
    const ops = docs.map((doc: any) => {
      const copy = { ...doc };
      delete copy._id;
      const filter = doc.id ? { id: doc.id } : { _id: (doc as any)._id };
      return {
        updateOne: {
          filter,
          update: { $set: copy },
          upsert: true
        }
      };
    });

    await coll.bulkWrite(ops, { ordered: false });
    
    // Clean up orphan entries not in current memory state
    const currentIds = docs.map(d => d.id).filter(Boolean);
    if (currentIds.length > 0) {
      await coll.deleteMany({ id: { $nin: currentIds } });
    }
  }

  public async pushAllToMongo(store: any): Promise<boolean> {
    if (!this.isConnected && !(await this.connect())) return false;

    try {
      await Promise.all([
        this.safeSyncCollection('products', store.products),
        this.safeSyncCollection('categories', store.categories),
        this.safeSyncCollection('brands', store.brands),
        this.safeSyncCollection('users', store.users),
        this.safeSyncCollection('orders', store.orders),
        this.safeSyncCollection('coupons', store.coupons),
        this.safeSyncCollection('reviews', store.reviews),
        this.safeSyncCollection('wholesaleApplications', store.wholesaleApplications),
        this.safeSyncCollection('roles', store.roles),
        this.safeSyncCollection('permissions', store.permissions),
        this.safeSyncCollection('inventoryTransactions', store.inventoryTransactions),
        this.safeSyncCollection('auditLogs', store.auditLogs),
        this.safeSyncCollection('notifications', store.notifications),
        this.safeSyncCollection('mediaLibrary', store.mediaLibrary),
        this.safeSyncCollection('addresses', store.addresses),
        this.safeSyncCollection('cartItems', store.cartItems),
        this.safeSyncCollection('wishlists', store.wishlists),
        this.safeSyncCollection('contactMessages', store.contactMessages),
        this.safeSyncCollection('newsletterSubscribers', store.newsletterSubscribers),
        this.saveDocument('settings', { id: 'store_settings', ...store.settings })
      ]);
      await this.refreshCounts();
      this.lastSyncAt = new Date().toISOString();
      return true;
    } catch (err: any) {
      this.lastError = err?.message || 'Sync operation failed';
      return false;
    }
  }
}

export const mongoService = new MongoDatabaseService();

import fs from 'fs';
import path from 'path';
import {
  Product,
  Category,
  Brand,
  Coupon,
  Order,
  StoreSettings,
  User,
  Role,
  Review,
  WholesaleApplication
} from '../../types/index.js';

export interface StorePersistenceData {
  deletedProductIds: string[];
  productOverrides: Record<string, Product>;
  deletedCategoryIds: string[];
  categoryOverrides: Record<string, Category>;
  deletedBrandIds: string[];
  brandOverrides: Record<string, Brand>;
  deletedCouponIds: string[];
  couponOverrides: Record<string, Coupon>;
  orderOverrides: Record<string, Order>;
  settingsOverride: StoreSettings | null;
  deletedUserIds: string[];
  userOverrides: Record<string, User>;
  roleOverrides: Record<string, Role>;
  reviewOverrides: Record<string, Review>;
  wholesaleOverrides: Record<string, WholesaleApplication>;
}

export function getDefaultPersistenceData(): StorePersistenceData {
  return {
    deletedProductIds: [],
    productOverrides: {},
    deletedCategoryIds: [],
    categoryOverrides: {},
    deletedBrandIds: [],
    brandOverrides: {},
    deletedCouponIds: [],
    couponOverrides: {},
    orderOverrides: {},
    settingsOverride: null,
    deletedUserIds: [],
    userOverrides: {},
    roleOverrides: {},
    reviewOverrides: {},
    wholesaleOverrides: {}
  };
}

export function getPersistenceFilePath(): string {
  return path.join(process.cwd(), 'src/server/db', 'store-persistence.json');
}

export function loadPersistenceData(): StorePersistenceData {
  const filePath = getPersistenceFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        return {
          deletedProductIds: Array.isArray(parsed.deletedProductIds) ? parsed.deletedProductIds : [],
          productOverrides: parsed.productOverrides && typeof parsed.productOverrides === 'object' ? parsed.productOverrides : {},
          deletedCategoryIds: Array.isArray(parsed.deletedCategoryIds) ? parsed.deletedCategoryIds : [],
          categoryOverrides: parsed.categoryOverrides && typeof parsed.categoryOverrides === 'object' ? parsed.categoryOverrides : {},
          deletedBrandIds: Array.isArray(parsed.deletedBrandIds) ? parsed.deletedBrandIds : [],
          brandOverrides: parsed.brandOverrides && typeof parsed.brandOverrides === 'object' ? parsed.brandOverrides : {},
          deletedCouponIds: Array.isArray(parsed.deletedCouponIds) ? parsed.deletedCouponIds : [],
          couponOverrides: parsed.couponOverrides && typeof parsed.couponOverrides === 'object' ? parsed.couponOverrides : {},
          orderOverrides: parsed.orderOverrides && typeof parsed.orderOverrides === 'object' ? parsed.orderOverrides : {},
          settingsOverride: parsed.settingsOverride && typeof parsed.settingsOverride === 'object' ? parsed.settingsOverride : null,
          deletedUserIds: Array.isArray(parsed.deletedUserIds) ? parsed.deletedUserIds : [],
          userOverrides: parsed.userOverrides && typeof parsed.userOverrides === 'object' ? parsed.userOverrides : {},
          roleOverrides: parsed.roleOverrides && typeof parsed.roleOverrides === 'object' ? parsed.roleOverrides : {},
          reviewOverrides: parsed.reviewOverrides && typeof parsed.reviewOverrides === 'object' ? parsed.reviewOverrides : {},
          wholesaleOverrides: parsed.wholesaleOverrides && typeof parsed.wholesaleOverrides === 'object' ? parsed.wholesaleOverrides : {}
        };
      }
    }
  } catch (err) {
    console.warn('[Persistence] Could not load store-persistence.json, using defaults:', err);
  }
  return getDefaultPersistenceData();
}

export function savePersistenceData(data: StorePersistenceData): void {
  // Vercel serverless deployments have a read-only application filesystem.
  // Persistence is stored in MongoDB by DatabaseStore.savePersistence().
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return;
  }

  const filePath = getPersistenceFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const serialized = JSON.stringify(data, null, 2);
    // Write atomically via temporary file to prevent corruption on sudden termination
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, serialized, 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error('[Persistence] Error saving store-persistence.json:', err);
  }
}

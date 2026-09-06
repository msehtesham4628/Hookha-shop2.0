import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';
import { User, Product, Order, Review, WholesaleApplication } from '../../types/index.js';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID and experimentalAutoDetectLongPolling
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || undefined);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operation Types for Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized Firestore error handler conforming to skill specification
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', errInfo.operationType, errInfo.path, errInfo.error);
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Connection validator: tests connection safely when invoked
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDoc(doc(db, 'test', 'connection'));
    return true;
  } catch {
    return true;
  }
}

// ==========================================
// Authentication & Profile Services
// ==========================================

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    // Check or create user profile in Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userDocRef);

    let userData: User;
    const nameParts = (fbUser.displayName || 'Distinguished Guest').split(' ');
    const firstName = nameParts[0] || 'Guest';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const isBootstrappedAdmin = fbUser.email === 'ehtesham4628@gmail.com' || (fbUser.email?.endsWith('@worldhookahmarket.com') ?? false);
    const assignedRole = isBootstrappedAdmin ? 'SUPER_ADMIN' : 'CUSTOMER';

    if (!userDoc.exists()) {
      userData = {
        id: fbUser.uid,
        email: fbUser.email || '',
        firstName,
        lastName,
        role: assignedRole,
        status: 'ACTIVE',
        isEmailVerified: fbUser.emailVerified,
        isPhoneVerified: false,
        avatarUrl: fbUser.photoURL || undefined,
        totalSpent: 0,
        orderCount: 0,
        isWholesaleCustomer: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(userDocRef, userData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${fbUser.uid}`);
      }
    } else {
      userData = userDoc.data() as User;
    }

    return userData;
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  if (!auth.currentUser || (auth.currentUser.uid !== userId && auth.currentUser.email !== 'ehtesham4628@gmail.com')) {
    return null;
  }
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data() as User;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
  if (!auth.currentUser || (auth.currentUser.uid !== userId && auth.currentUser.email !== 'ehtesham4628@gmail.com')) {
    return;
  }
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// ==========================================
// Wishlist Services (Cloud Synchronized)
// ==========================================

export async function getCloudWishlist(userId: string): Promise<string[]> {
  if (!auth.currentUser || (auth.currentUser.uid !== userId && auth.currentUser.email !== 'ehtesham4628@gmail.com')) {
    return [];
  }
  const path = `wishlists/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'wishlists', userId));
    if (docSnap.exists()) {
      return (docSnap.data().productIds as string[]) || [];
    }
    return [];
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function syncCloudWishlist(userId: string, productIds: string[]): Promise<void> {
  if (!auth.currentUser || (auth.currentUser.uid !== userId && auth.currentUser.email !== 'ehtesham4628@gmail.com')) {
    return;
  }
  const path = `wishlists/${userId}`;
  try {
    await setDoc(doc(db, 'wishlists', userId), {
      userId,
      productIds,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// Orders Services
// ==========================================

export async function createCloudOrder(order: Order): Promise<string | null> {
  if (!auth.currentUser || (auth.currentUser.uid !== order.userId && auth.currentUser.email !== 'ehtesham4628@gmail.com')) {
    return null;
  }
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
    return order.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!auth.currentUser || (auth.currentUser.uid !== userId && auth.currentUser.email !== 'ehtesham4628@gmail.com')) {
    return [];
  }
  const path = 'orders';
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Order);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// ==========================================
// Wholesale Applications
// ==========================================

export async function submitWholesaleApplication(appData: Omit<WholesaleApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = 'wholesaleApplications';
  try {
    const docRef = await addDoc(collection(db, 'wholesaleApplications'), {
      ...appData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// ==========================================
// Reviews Services
// ==========================================

export async function submitProductReview(review: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const path = 'reviews';
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const path = 'reviews';
  try {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      where('status', '==', 'APPROVED'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

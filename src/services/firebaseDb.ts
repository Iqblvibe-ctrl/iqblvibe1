import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocFromServer,
  onSnapshot, 
  writeBatch,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { auth } from './googleAuth';
import firebaseConfig from '../../firebase-applet-config.json';
import { DaiUtusan, Korwil } from '../types/dai';
import { INITIAL_DAI_LIST, INITIAL_KORWIL_LIST } from '../data/initialData';

// Initialize singleton Firestore instance with specific databaseId
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Test connection on boot per Firebase guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using offline cache or local storage.');
    }
  }
}
testConnection();

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function sanitizeForFirestore<T>(val: T): T {
  if (val === undefined || val === null) {
    return null as unknown as T;
  }
  if (Array.isArray(val)) {
    return val
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        res[k] = sanitizeForFirestore(v);
      }
    }
    return res as T;
  }
  return val;
}

const DAI_COLLECTION = 'dai_utusan';
const KORWIL_COLLECTION = 'korwil';

/**
 * Real-time listener for Dai list across all devices.
 * Automatically seeds initial database if empty.
 */
export function subscribeToDaiList(
  onData: (items: DaiUtusan[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, DAI_COLLECTION);
  let isInitialCheckDone = false;

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty && !isInitialCheckDone) {
        isInitialCheckDone = true;
        // Seed initial data to cloud so all devices immediately have initial records
        try {
          await bulkSaveDaiToFirestore(INITIAL_DAI_LIST, false);
        } catch (err) {
          console.error('Error seeding initial Dai to Firestore:', err);
        }
        return;
      }
      isInitialCheckDone = true;

      const items: DaiUtusan[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as DaiUtusan;
        // Ensure id is present
        if (!data.id) data.id = d.id;
        items.push(data);
      });

      // Sort by name or creation
      items.sort((a, b) => a.nama.localeCompare(b.nama));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, DAI_COLLECTION);
    }
  );
}

/**
 * Fetch Dai list once directly from Firestore (manual sync / verify).
 */
export async function fetchDaiListFromFirestore(): Promise<DaiUtusan[]> {
  try {
    const snap = await getDocs(collection(db, DAI_COLLECTION));
    const items: DaiUtusan[] = [];
    snap.forEach((d) => {
      const data = d.data() as DaiUtusan;
      if (!data.id) data.id = d.id;
      items.push(data);
    });
    items.sort((a, b) => a.nama.localeCompare(b.nama));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, DAI_COLLECTION);
    return [];
  }
}

/**
 * Real-time listener for Korwil list across all devices.
 */
export function subscribeToKorwilList(
  onData: (items: Korwil[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, KORWIL_COLLECTION);
  let isInitialCheckDone = false;

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty && !isInitialCheckDone) {
        isInitialCheckDone = true;
        try {
          await bulkSaveKorwilToFirestore(INITIAL_KORWIL_LIST);
        } catch (err) {
          console.error('Error seeding initial Korwil to Firestore:', err);
        }
        return;
      }
      isInitialCheckDone = true;

      const items: Korwil[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Korwil;
        if (!data.id) data.id = d.id;
        items.push(data);
      });
      items.sort((a, b) => a.kodeWilayah.localeCompare(b.kodeWilayah));
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, KORWIL_COLLECTION);
    }
  );
}

/**
 * Save single Dai record to Firestore (synced in real-time to all devices).
 */
export async function saveDaiToFirestore(dai: DaiUtusan): Promise<void> {
  const docRef = doc(db, DAI_COLLECTION, dai.id);
  const rawPayload = {
    ...dai,
    updatedAt: new Date().toISOString(),
  };
  const sanitizedPayload = sanitizeForFirestore(rawPayload);

  try {
    await setDoc(docRef, sanitizedPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${DAI_COLLECTION}/${dai.id}`);
  }
}

/**
 * Delete a Dai record from Firestore.
 */
export async function deleteDaiFromFirestore(daiId: string): Promise<void> {
  const docRef = doc(db, DAI_COLLECTION, daiId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${DAI_COLLECTION}/${daiId}`);
  }
}

/**
 * Save single Korwil record to Firestore.
 */
export async function saveKorwilToFirestore(korwil: Korwil): Promise<void> {
  const docRef = doc(db, KORWIL_COLLECTION, korwil.id);
  const rawPayload = {
    ...korwil,
    updatedAt: new Date().toISOString(),
  };
  const sanitizedPayload = sanitizeForFirestore(rawPayload);

  try {
    await setDoc(docRef, sanitizedPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${KORWIL_COLLECTION}/${korwil.id}`);
  }
}

/**
 * Bulk save Da'i records to Firestore using batch chunks (up to 400 per batch).
 */
export async function bulkSaveDaiToFirestore(
  dais: DaiUtusan[],
  replaceAll: boolean = false
): Promise<void> {
  try {
    if (replaceAll) {
      // First fetch existing docs to delete them
      const existing = await getDocs(collection(db, DAI_COLLECTION));
      const deleteBatches: any[] = [];
      let currentBatch = writeBatch(db);
      let count = 0;

      existing.forEach((d) => {
        currentBatch.delete(d.ref);
        count++;
        if (count >= 400) {
          deleteBatches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          count = 0;
        }
      });
      if (count > 0) {
        deleteBatches.push(currentBatch.commit());
      }
      await Promise.all(deleteBatches);
    }

    // Now write the new records in chunks of 400
    const chunkSize = 400;
    for (let i = 0; i < dais.length; i += chunkSize) {
      const chunk = dais.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      const now = new Date().toISOString();

      chunk.forEach((dai) => {
        const docRef = doc(db, DAI_COLLECTION, dai.id);
        const sanitized = sanitizeForFirestore({ ...dai, updatedAt: now });
        batch.set(docRef, sanitized, { merge: true });
      });

      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, DAI_COLLECTION);
  }
}

/**
 * Bulk save Korwil records to Firestore.
 */
export async function bulkSaveKorwilToFirestore(korwils: Korwil[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    korwils.forEach((k) => {
      const docRef = doc(db, KORWIL_COLLECTION, k.id);
      const sanitized = sanitizeForFirestore({ ...k, updatedAt: now });
      batch.set(docRef, sanitized, { merge: true });
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, KORWIL_COLLECTION);
  }
}

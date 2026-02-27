import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  type DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

function userCollection(uid: string, path: string) {
  return collection(db!, 'users', uid, path);
}

function userDoc(uid: string, path: string, docId: string) {
  return doc(db!, 'users', uid, path, docId);
}

function localKey(uid: string, path: string) {
  return `kdh_${uid}_${path}`;
}

function localGet<T>(uid: string, path: string): T[] {
  try {
    const raw = localStorage.getItem(localKey(uid, path));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function localSet<T>(uid: string, path: string, data: T[]) {
  localStorage.setItem(localKey(uid, path), JSON.stringify(data));
}

function sortItems<T>(items: T[], sortBy?: string) {
  if (!sortBy || items.length === 0) return items;
  items.sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortBy];
    const bv = (b as Record<string, unknown>)[sortBy];
    if (typeof av === 'number' && typeof bv === 'number') return av - bv;
    return String(av).localeCompare(String(bv));
  });
  return items;
}

/**
 * Cache-first fetch: returns cached data instantly via onCached,
 * then fetches from Firestore and returns the fresh data.
 */
export async function fetchAll<T extends DocumentData>(
  uid: string,
  path: string,
  sortBy?: string,
  onCached?: (items: T[]) => void
): Promise<T[]> {
  // Always deliver cache instantly
  const cached = sortItems(localGet<T>(uid, path), sortBy);
  if (cached.length > 0 && onCached) {
    onCached(cached);
  }

  if (!isFirebaseConfigured) {
    return cached;
  }

  const ref = userCollection(uid, path);
  const q = sortBy ? query(ref, orderBy(sortBy)) : query(ref);
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as T);

  // Sync cache with Firestore
  if (items.length > 0) {
    localSet(uid, path, items);
  }

  return items;
}

export async function saveDoc(
  uid: string,
  path: string,
  docId: string,
  data: DocumentData
): Promise<void> {
  // Always update local cache
  const items = localGet<DocumentData & { id: string }>(uid, path);
  const idx = items.findIndex((i) => i.id === docId);
  if (idx >= 0) {
    items[idx] = { id: docId, ...data };
  } else {
    items.push({ id: docId, ...data });
  }
  localSet(uid, path, items);

  if (!isFirebaseConfigured) return;
  await setDoc(userDoc(uid, path, docId), data);
}

export async function removeDoc(
  uid: string,
  path: string,
  docId: string
): Promise<void> {
  // Always update local cache
  const items = localGet<{ id: string }>(uid, path);
  localSet(uid, path, items.filter((i) => i.id !== docId));

  if (!isFirebaseConfigured) return;
  await deleteDoc(userDoc(uid, path, docId));
}

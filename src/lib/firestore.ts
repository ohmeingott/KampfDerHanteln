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

export async function fetchAll<T extends DocumentData>(
  uid: string,
  path: string,
  sortBy?: string
): Promise<T[]> {
  if (!isFirebaseConfigured) {
    const items = localGet<T>(uid, path);
    if (sortBy) {
      items.sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortBy];
        const bv = (b as Record<string, unknown>)[sortBy];
        if (typeof av === 'number' && typeof bv === 'number') return av - bv;
        return String(av).localeCompare(String(bv));
      });
    }
    return items;
  }

  const ref = userCollection(uid, path);
  const q = sortBy ? query(ref, orderBy(sortBy)) : query(ref);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as T);
}

export async function saveDoc(
  uid: string,
  path: string,
  docId: string,
  data: DocumentData
): Promise<void> {
  if (!isFirebaseConfigured) {
    const items = localGet<DocumentData & { id: string }>(uid, path);
    const idx = items.findIndex((i) => i.id === docId);
    if (idx >= 0) {
      items[idx] = { id: docId, ...data };
    } else {
      items.push({ id: docId, ...data });
    }
    localSet(uid, path, items);
    return;
  }

  await setDoc(userDoc(uid, path, docId), data);
}

export async function removeDoc(
  uid: string,
  path: string,
  docId: string
): Promise<void> {
  if (!isFirebaseConfigured) {
    const items = localGet<{ id: string }>(uid, path);
    localSet(uid, path, items.filter((i) => i.id !== docId));
    return;
  }

  await deleteDoc(userDoc(uid, path, docId));
}

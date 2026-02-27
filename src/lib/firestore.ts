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
import { db } from './firebase';

export function userCollection(uid: string, path: string) {
  return collection(db, 'users', uid, path);
}

export function userDoc(uid: string, path: string, docId: string) {
  return doc(db, 'users', uid, path, docId);
}

export async function fetchAll<T extends DocumentData>(
  uid: string,
  path: string,
  sortBy?: string
): Promise<T[]> {
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
  await setDoc(userDoc(uid, path, docId), data);
}

export async function removeDoc(
  uid: string,
  path: string,
  docId: string
): Promise<void> {
  await deleteDoc(userDoc(uid, path, docId));
}

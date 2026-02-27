import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Person } from '../types';
import { fetchAll, saveDoc, removeDoc } from '../lib/firestore';

interface ParticipantState {
  people: Person[];
  selectedIds: Set<string>;
  loading: boolean;
  loadPeople: (uid: string) => Promise<void>;
  addPerson: (uid: string, name: string, nickname?: string) => Promise<void>;
  removePerson: (uid: string, personId: string) => Promise<void>;
  toggleSelected: (personId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  setSelected: (ids: Set<string>) => void;
}

export const useParticipantStore = create<ParticipantState>((set, get) => ({
  people: [],
  selectedIds: new Set(),
  loading: false,

  loadPeople: async (uid: string) => {
    set({ loading: true });
    const people = await fetchAll<Person>(uid, 'people', 'createdAt');
    set({ people, loading: false });
  },

  addPerson: async (uid: string, name: string, nickname?: string) => {
    const id = uuid();
    const person: Person = {
      id,
      displayName: name,
      nickname: nickname || undefined,
      createdAt: Date.now(),
    };
    await saveDoc(uid, 'people', id, {
      displayName: person.displayName,
      nickname: person.nickname || null,
      createdAt: person.createdAt,
    });
    set((state) => ({ people: [...state.people, person] }));
  },

  removePerson: async (uid: string, personId: string) => {
    await removeDoc(uid, 'people', personId);
    set((state) => ({
      people: state.people.filter((p) => p.id !== personId),
      selectedIds: new Set([...state.selectedIds].filter((id) => id !== personId)),
    }));
  },

  toggleSelected: (personId: string) => {
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return { selectedIds: next };
    });
  },

  selectAll: () => {
    set((state) => ({
      selectedIds: new Set(state.people.map((p) => p.id)),
    }));
  },

  deselectAll: () => {
    set({ selectedIds: new Set() });
  },

  setSelected: (ids: Set<string>) => {
    set({ selectedIds: ids });
  },
}));

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { Post } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

type SavedInternshipsContextType = {
  savedInternships: Post[];
  toggleSaveInternship: (post: Post) => void;
};

const SavedInternshipsContext = createContext<SavedInternshipsContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = '@InternQuest_savedInternships_v1:';

const normalizeLoadedPost = (value: any): Post | null => {
  if (!value || typeof value !== 'object') return null;
  if (typeof value.id !== 'string' || !value.id.trim()) return null;

  const createdAt = (value as any).createdAt;
  let createdAtDate: Date | undefined = undefined;
  if (createdAt instanceof Date) {
    createdAtDate = createdAt;
  } else if (typeof createdAt === 'string' || typeof createdAt === 'number') {
    const d = new Date(createdAt);
    if (!Number.isNaN(d.getTime())) createdAtDate = d;
  }

  return {
    ...value,
    id: value.id,
    createdAt: createdAtDate,
  } as Post;
};

export const SavedInternshipsProvider = ({ children }: { children: ReactNode }) => {
  const [savedInternships, setSavedInternships] = useState<Post[]>([]);

  const [userKey, setUserKey] = useState<string>(() => {
    const uid = auth.currentUser?.uid;
    return uid ? `${STORAGE_KEY_PREFIX}${uid}` : `${STORAGE_KEY_PREFIX}anonymous`;
  });

  const loadedForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const nextKey = user?.uid ? `${STORAGE_KEY_PREFIX}${user.uid}` : `${STORAGE_KEY_PREFIX}anonymous`;
      setUserKey(nextKey);
    });
    return () => {
      try { unsub(); } catch { }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(userKey);
        if (cancelled) return;
        if (!raw) {
          loadedForKeyRef.current = userKey;
          setSavedInternships([]);
          return;
        }
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : [];
        const normalized = list
          .map(normalizeLoadedPost)
          .filter((p): p is Post => Boolean(p));

        // Dedupe by id
        const seen = new Set<string>();
        const deduped: Post[] = [];
        for (const item of normalized) {
          if (seen.has(item.id)) continue;
          seen.add(item.id);
          deduped.push(item);
        }

        loadedForKeyRef.current = userKey;
        setSavedInternships(deduped);
      } catch (e) {
        loadedForKeyRef.current = userKey;
        setSavedInternships([]);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userKey]);

  const persist = useMemo(() => {
    return async (next: Post[]) => {
      try {
        await AsyncStorage.setItem(userKey, JSON.stringify(next));
      } catch {
        // ignore persistence failures
      }
    };
  }, [userKey]);

  const toggleSaveInternship = (post: Post) => {
    if (!post || typeof post.id !== 'string' || !post.id.trim()) return;
    setSavedInternships((prev) => {
      const exists = prev.some((saved) => saved.id === post.id);
      const next = exists
        ? prev.filter((saved) => saved.id !== post.id)
        : [...prev, post];

      // Only persist after we've loaded the current key once, to avoid overwriting
      // restored data with an empty initial state during app startup.
      if (loadedForKeyRef.current === userKey) {
        void persist(next);
      }

      return next;
    });
  };

  return (
    <SavedInternshipsContext.Provider value={{ savedInternships, toggleSaveInternship }}>
      {children}
    </SavedInternshipsContext.Provider>
  );
};

export const useSavedInternships = () => {
  const context = useContext(SavedInternshipsContext);
  if (!context) {
    throw new Error('useSavedInternships must be used within a SavedInternshipsProvider');
  }
  return context;
};
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry } from '@/types';

const KEY = 'eisaku_history';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const save = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try { localStorage.setItem(KEY, JSON.stringify(entries)); } catch {}
  }, []);

  const add = useCallback((entry: Omit<HistoryEntry, 'id'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    save([newEntry, ...history]);
    return newEntry;
  }, [history, save]);

  const remove = useCallback((id: string) => {
    save(history.filter((e) => e.id !== id));
  }, [history, save]);

  return { history, loaded, add, remove };
}

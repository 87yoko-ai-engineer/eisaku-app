'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProgress } from '@/types';
import { DEFAULT_PROGRESS, applyCorrection } from '@/lib/gamification';

const KEY = 'eisaku_progress';

interface UserProgressContextValue {
  progress: UserProgress;
  loaded: boolean;
  setLevel: (level: number) => void;
  recordCorrection: (opts: {
    score: number;
    wordCount: number;
    tone?: string;
    mode: 'Free' | 'Challenge';
    grammarCheckPassed?: boolean;
  }) => UserProgress;
}

const UserProgressContext = createContext<UserProgressContextValue | null>(null);

export function UserProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setProgress(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const save = useCallback((p: UserProgress) => {
    setProgress(p);
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
  }, []);

  const setLevel = useCallback((level: number) => {
    setProgress((prev) => {
      const updated = { ...prev, level };
      try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const recordCorrection = useCallback((opts: {
    score: number;
    wordCount: number;
    tone?: string;
    mode: 'Free' | 'Challenge';
    grammarCheckPassed?: boolean;
  }) => {
    let result: UserProgress = DEFAULT_PROGRESS;
    setProgress((prev) => {
      result = applyCorrection(prev, opts);
      try { localStorage.setItem(KEY, JSON.stringify(result)); } catch {}
      return result;
    });
    return result;
  }, []);

  return (
    <UserProgressContext.Provider value={{ progress, loaded, setLevel, recordCorrection }}>
      {children}
    </UserProgressContext.Provider>
  );
}

export function useUserProgress() {
  const ctx = useContext(UserProgressContext);
  if (!ctx) throw new Error('useUserProgress must be used within UserProgressProvider');
  return ctx;
}

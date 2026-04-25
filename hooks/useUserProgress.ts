'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProgress } from '@/types';
import { DEFAULT_PROGRESS, applyCorrection } from '@/lib/gamification';

const KEY = 'eisaku_progress';

export function useUserProgress() {
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
    save({ ...progress, level });
  }, [progress, save]);

  const recordCorrection = useCallback((opts: {
    score: number;
    wordCount: number;
    tone?: string;
    mode: 'Free' | 'Challenge';
    grammarCheckPassed?: boolean;
  }) => {
    const updated = applyCorrection(progress, opts);
    save(updated);
    return updated;
  }, [progress, save]);

  return { progress, loaded, setLevel, recordCorrection };
}

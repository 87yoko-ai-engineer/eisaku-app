'use client';

import { useState, useEffect, useCallback } from 'react';

export interface QuestionStat {
  attempts: number;
  lastScore: number;
  grammarPassed: boolean | null;
}

type QuestionStats = Record<string, QuestionStat>;

const KEY = 'eisaku_question_stats';

export function useQuestionStats() {
  const [stats, setStats] = useState<QuestionStats>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch {}
  }, []);

  const recordResult = useCallback((questionId: string, score: number, grammarPassed: boolean | null) => {
    setStats((prev) => {
      const next = {
        ...prev,
        [questionId]: {
          attempts: (prev[questionId]?.attempts ?? 0) + 1,
          lastScore: score,
          grammarPassed,
        },
      };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const getPriority = useCallback((questionId: string): number => {
    const s = stats[questionId];
    if (!s) return 1;                          // 未挑戦
    if (s.grammarPassed === false) return 0;   // 文法NG → 最優先
    if (s.lastScore < 70) return 1;            // 低スコア
    if (s.lastScore < 85) return 2;            // 中スコア
    return 3;                                  // 高スコア
  }, [stats]);

  return { stats, recordResult, getPriority };
}

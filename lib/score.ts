import type { Correction } from '@/types';

const DEDUCTION: Record<string, number> = {
  grammar:   8,
  vocab:     4,
  tone:      5,
  structure: 6,
  spelling:  3,
};

export function calculateScore(corrections: Correction[]): number {
  const total = corrections.reduce((acc, c) => acc + (DEDUCTION[c.type] ?? 4), 0);
  return Math.max(30, 100 - total);
}

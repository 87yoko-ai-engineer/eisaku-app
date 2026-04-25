import type { UserProgress } from '@/types';
import { LEVELS } from './constants';

export const DEFAULT_PROGRESS: UserProgress = {
  level: 3,
  xp: 0,
  streak: 0,
  lastStudyDate: '',
  totalCorrections: 0,
  badges: [],
  averageScore: 0,
  totalScore: 0,
};

export function computeStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().slice(0, 10);
  const last = progress.lastStudyDate;

  if (last === today) return progress;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newStreak = last === yesterday ? progress.streak + 1 : 1;

  return { ...progress, streak: newStreak, lastStudyDate: today };
}

export function addXP(progress: UserProgress, xpGain: number): UserProgress {
  let { xp, level } = progress;
  xp += xpGain;

  const currentLevel = LEVELS.find((l) => l.id === level) ?? LEVELS[LEVELS.length - 1];
  if (level < LEVELS.length && xp >= currentLevel.xpMax) {
    xp = xp - currentLevel.xpMax;
    level = Math.min(level + 1, LEVELS.length);
  }

  return { ...progress, xp, level };
}

export function checkBadges(
  progress: UserProgress,
  opts: { score: number; wordCount: number; tone?: string; mode: 'Free' | 'Challenge'; grammarCheckPassed?: boolean }
): number[] {
  const newBadges: number[] = [];
  const earned = new Set(progress.badges);

  if (!earned.has(1) && progress.streak >= 7) newBadges.push(1);
  if (!earned.has(2) && progress.totalCorrections >= 20) newBadges.push(2);
  if (!earned.has(3) && opts.mode === 'Challenge' && opts.grammarCheckPassed) newBadges.push(3);
  if (!earned.has(4) && opts.tone === 'business') newBadges.push(4);
  if (!earned.has(5) && opts.score >= 100) newBadges.push(5);
  if (!earned.has(6) && progress.streak >= 30) newBadges.push(6);
  if (!earned.has(7) && progress.totalCorrections >= 50) newBadges.push(7);
  if (!earned.has(8) && progress.level >= 5) newBadges.push(8);
  if (!earned.has(9) && opts.wordCount >= 100) newBadges.push(9);

  return newBadges;
}

export function applyCorrection(
  progress: UserProgress,
  opts: {
    score: number;
    wordCount: number;
    tone?: string;
    mode: 'Free' | 'Challenge';
    grammarCheckPassed?: boolean;
  }
): UserProgress {
  let p = computeStreak(progress);

  const xpGain = opts.mode === 'Challenge'
    ? (opts.grammarCheckPassed ? 50 : 30)
    : 20;
  p = addXP(p, xpGain);

  const totalCorrections = p.totalCorrections + 1;
  const totalScore = p.totalScore + opts.score;
  const averageScore = Math.round(totalScore / totalCorrections);

  const newBadges = checkBadges({ ...p, totalCorrections }, opts);
  const badges = [...new Set([...p.badges, ...newBadges])];

  return { ...p, totalCorrections, totalScore, averageScore, badges };
}

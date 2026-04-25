export type CorrectionType = 'grammar' | 'vocab' | 'tone' | 'structure' | 'spelling';

export interface Correction {
  id: number;
  original: string;
  corrected: string;
  type: CorrectionType;
  brief: string;
  explanation: string;
  example: string;
}

export interface CorrectionResult {
  score: number;
  corrections: Correction[];
  summary?: string;
  grammarCheckPassed?: boolean;
  grammarScore?: number;
  modelAnswer?: string;
  modelAnswerJa?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  mode: 'Free' | 'Challenge';
  level: number;
  tone?: string;
  inputText: string;
  result: CorrectionResult;
}

export interface Level {
  id: number;
  label: string;
  name: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  xpMax: number;
}

export interface Badge {
  id: number;
  emoji: string;
  label: string;
  desc: string;
  earned: boolean;
  earnedDate?: string;
  condition?: string;
}

export interface UserProgress {
  level: number;
  xp: number;
  streak: number;
  lastStudyDate: string;
  totalCorrections: number;
  badges: number[];
  averageScore: number;
  totalScore: number;
}

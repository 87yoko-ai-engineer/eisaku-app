'use client';

import type { Correction } from '@/types';
import { TYPE_CONFIG } from '@/lib/constants';

interface Props {
  popup: { x: number; y: number; correction: Correction } | null;
}

export function CorrectionPopup({ popup }: Props) {
  if (!popup) return null;

  const cfg = TYPE_CONFIG[popup.correction.type] ?? { label: popup.correction.type, bg: '#F3F4F6', color: '#6B7280' };
  const left = typeof window !== 'undefined'
    ? Math.min(popup.x - 160, window.innerWidth - 340)
    : popup.x - 160;

  return (
    <div style={{
      position: 'fixed',
      left,
      top: popup.y - 8,
      transform: 'translateY(-100%)',
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: 10,
      padding: '14px 16px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      maxWidth: 320,
      zIndex: 9999,
      pointerEvents: 'none',
      fontSize: 13,
      lineHeight: 1.6,
    }}>
      <div style={{
        display: 'inline-block',
        padding: '2px 8px', borderRadius: 20,
        fontSize: 11, fontWeight: 600,
        marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.04em',
        background: cfg.bg, color: cfg.color,
      }}>
        {cfg.label}
      </div>
      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14, color: '#111827' }}>
        {popup.correction.brief}
      </div>
      <div style={{ color: '#4B5563', lineHeight: 1.6 }}>
        {popup.correction.explanation}
      </div>
    </div>
  );
}

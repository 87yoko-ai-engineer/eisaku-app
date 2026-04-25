import type { Correction } from '@/types';
import { TYPE_CONFIG } from '@/lib/constants';
import { Icon } from './icons';

export function CorrectionList({ corrections }: { corrections: Correction[] }) {
  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        修正箇所の詳細
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {corrections.map((c) => {
          const cfg = TYPE_CONFIG[c.type] ?? { label: c.type, bg: '#F3F4F6', color: '#6B7280' };
          return (
            <div key={c.id} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                <span style={{ padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                  {cfg.label}
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '1px 8px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace', textDecoration: 'line-through', textDecorationColor: '#F87171' }}>
                    {c.original}
                  </span>
                  <Icon name="arrowRight" size={13} color="#9CA3AF" />
                  <span style={{ background: '#D1FAE5', color: '#059669', padding: '1px 8px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
                    {c.corrected}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.7, paddingLeft: 2 }}>
                {c.explanation}
              </p>
              <div style={{ marginTop: 8, padding: '8px 10px', background: '#F9FAFB', borderRadius: 6, fontSize: 13, color: '#6B7280', fontStyle: 'italic', borderLeft: '3px solid #E5E7EB' }}>
                例: {c.example}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

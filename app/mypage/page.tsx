'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons';
import { LEVELS, BADGE_DEFINITIONS } from '@/lib/constants';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useHistory } from '@/hooks/useHistory';
import type { Badge } from '@/types';

const TYPE_MAP: Record<string, string> = {
  grammar: 'Grammar', vocab: 'Vocabulary', tone: 'Tone', structure: 'Structure', spelling: 'Spelling',
};

const TAB_KEYS = ['grammar', 'vocab', 'tone', 'structure'] as const;
const TAB_LABELS: Record<string, string> = { grammar: 'Grammar', vocab: 'Vocabulary', tone: 'Tone', structure: 'Structure' };

export default function MyPage() {
  const router = useRouter();
  const { progress } = useUserProgress();
  const { history } = useHistory();
  const [mistakeTab, setMistakeTab] = useState<'grammar' | 'vocab' | 'tone' | 'structure'>('grammar');
  const [hovBadge, setHovBadge] = useState<number | null>(null);

  const lv = LEVELS.find((l) => l.id === progress.level) ?? LEVELS[2];
  const nextLv = LEVELS.find((l) => l.id === progress.level + 1);
  const xpPct = Math.round((progress.xp / lv.xpMax) * 100);

  // Build badges with earned status
  const badges: Badge[] = BADGE_DEFINITIONS.map((b) => ({
    ...b,
    earned: progress.badges.includes(b.id),
    earnedDate: progress.badges.includes(b.id) ? '獲得済み' : undefined,
  }));

  // Build mistake ranking from history
  const mistakeCounts: Record<string, Record<string, { count: number; example: string }>> = { grammar: {}, vocab: {}, tone: {}, structure: {}, spelling: {} };
  for (const entry of history) {
    for (const c of entry.result.corrections) {
      const key = c.type;
      if (!mistakeCounts[key]) continue;
      const name = c.brief || c.original;
      if (!mistakeCounts[key][name]) mistakeCounts[key][name] = { count: 0, example: `${c.original} → ${c.corrected}` };
      mistakeCounts[key][name].count++;
    }
  }

  const mistakeData = Object.entries(mistakeCounts[mistakeTab] ?? {})
    .map(([name, { count, example }]) => ({ name, count, example }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = mistakeData.length > 0 ? Math.max(...mistakeData.map((m) => m.count)) : 1;

  const barGradients = [
    'linear-gradient(90deg,#F9A8D4,#EC4899)',
    'linear-gradient(90deg,#FCA5A5,#F87171)',
    'linear-gradient(90deg,#FCD34D,#F59E0B)',
    'linear-gradient(90deg,#6EE7B7,#10B981)',
    'linear-gradient(90deg,#93C5FD,#3B82F6)',
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8 md:px-10 md:py-9">
      <h1 style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>マイページ</h1>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Level card */}
          <div style={{ background: 'white', border: `1.5px solid ${lv.border}`, borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at 100% 0%, ${lv.color}15, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: lv.bg, border: `2px solid ${lv.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: lv.color }}>
                {progress.level}
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>現在のレベル</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{lv.label}</div>
                <div style={{ fontSize: 13, color: lv.color, fontWeight: 600 }}>{lv.name}</div>
              </div>
            </div>
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9CA3AF', marginBottom: 5 }}>
                <span>経験値</span><span>{progress.xp} / {lv.xpMax} XP</span>
              </div>
              <div style={{ background: '#F3F4F6', borderRadius: 99, height: 10 }}>
                <div style={{ background: `linear-gradient(90deg, ${lv.border}, ${lv.color})`, width: `${Math.min(xpPct, 100)}%`, height: '100%', borderRadius: 99, transition: 'width 0.6s ease' }} />
              </div>
              {nextLv && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{nextLv.label}「{nextLv.name}」まであと {Math.max(lv.xpMax - progress.xp, 0)} XP</div>}
            </div>
            <button onClick={() => router.push('/challenge')} style={{ width: '100%', marginTop: 12, padding: '8px', borderRadius: 8, border: 'none', background: `linear-gradient(135deg, ${lv.color}cc, ${lv.color})`, color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {lv.label} に挑戦する →
            </button>
          </div>

          {/* Stats */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>学習統計</div>
            {[
              { label: '連続学習日数', value: `${progress.streak}日`, icon: 'flame', color: '#F97316', bg: '#FFF7ED' },
              { label: '総添削回数', value: `${progress.totalCorrections}回`, icon: 'check', color: '#10B981', bg: '#F0FDF4' },
              { label: '平均スコア', value: progress.totalCorrections > 0 ? String(progress.averageScore) : '—', icon: 'star', color: '#F59E0B', bg: '#FFFBEB' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: s.bg, borderRadius: 9 }}>
                <Icon name={s.icon} size={18} color={s.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Badges */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>バッジコレクション</h2>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>獲得済み: {badges.filter((b) => b.earned).length} / {badges.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {badges.map((b) => (
                <div key={b.id}
                  onMouseEnter={() => setHovBadge(b.id)}
                  onMouseLeave={() => setHovBadge(null)}
                  style={{ position: 'relative', padding: '14px 10px', borderRadius: 12, textAlign: 'center', border: '1.5px solid', borderColor: b.earned ? '#FBCFE8' : '#F3F4F6', background: b.earned ? '#FDF2F8' : '#FAFAFA', opacity: b.earned ? 1 : 0.55, cursor: 'default', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 28, marginBottom: 4, filter: b.earned ? 'none' : 'grayscale(1)' }}>{b.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: b.earned ? 600 : 400, color: b.earned ? '#BE185D' : '#9CA3AF' }}>{b.label}</div>
                  {b.earned && <div style={{ fontSize: 10, color: '#F9A8D4', marginTop: 2 }}>獲得済み</div>}
                  {hovBadge === b.id && (
                    <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)', background: '#111827', color: 'white', borderRadius: 8, padding: '8px 10px', fontSize: 11, whiteSpace: 'nowrap', zIndex: 50, lineHeight: 1.5, maxWidth: 160, textAlign: 'center' }}>
                      {b.earned ? b.desc : `🔒 ${b.condition}`}
                      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #111827' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mistake ranking */}
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px 24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14 }}>頻出ミスランキング</h2>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18, borderBottom: '1px solid #F3F4F6', paddingBottom: 12 }}>
              {TAB_KEYS.map((v) => (
                <button key={v} onClick={() => setMistakeTab(v)} style={{ padding: '5px 12px', borderRadius: 20, border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: mistakeTab === v ? 600 : 400, cursor: 'pointer', background: mistakeTab === v ? '#FCE7F3' : 'transparent', color: mistakeTab === v ? '#EC4899' : '#6B7280', transition: 'all 0.15s' }}>
                  {TAB_LABELS[v]}
                </button>
              ))}
            </div>
            {mistakeData.length === 0 ? (
              <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>まだデータがありません。添削を続けると表示されます。</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mistakeData.map((m, i) => (
                  <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: i < 3 ? '#FCE7F3' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: i < 3 ? '#EC4899' : '#9CA3AF', flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#1F2937' }}>{m.name}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>{m.count}回</span>
                      </div>
                      <div style={{ background: '#F3F4F6', borderRadius: 99, height: 6, marginBottom: 3 }}>
                        <div style={{ background: barGradients[i] ?? barGradients[4], width: `${Math.round((m.count / maxCount) * 100)}%`, height: '100%', borderRadius: 99, transition: 'width 0.5s ease' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{m.example}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { Icon } from '@/components/icons';
import { ModeCard } from '@/components/ModeCard';
import { LEVELS } from '@/lib/constants';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useHistory } from '@/hooks/useHistory';

const TYPE_COLORS: Record<string, [string, string]> = {
  Grammar:    ['#FEE2E2', '#DC2626'],
  Vocabulary: ['#DBEAFE', '#2563EB'],
  Tone:       ['#D1FAE5', '#059669'],
  Structure:  ['#FEF3C7', '#D97706'],
  Spelling:   ['#EDE9FE', '#7C3AED'],
};

function getTagsFromResult(corrections: { type: string }[]): string[] {
  const map: Record<string, string> = { grammar: 'Grammar', vocab: 'Vocabulary', tone: 'Tone', structure: 'Structure', spelling: 'Spelling' };
  return [...new Set(corrections.map((c) => map[c.type] ?? c.type))].slice(0, 3);
}

export default function TopPage() {
  const router = useRouter();
  const { progress } = useUserProgress();
  const { history } = useHistory();

  const lv = LEVELS.find((l) => l.id === progress.level) ?? LEVELS[2];
  const recentHistory = history.slice(0, 3);
  const xpPct = Math.round((progress.xp / lv.xpMax) * 100);

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}月${dt.getDate()}日`;
  };

  return (
    <div className="max-w-[1080px] mx-auto px-4 py-10 md:px-8 md:py-12">
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FCE7F3', border: '1px solid #FBCFE8', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#BE185D', marginBottom: 20, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <Icon name="sparkle" size={12} color="#EC4899" />
          AI-Powered English Writing Coach
        </div>
        <h1 className="text-3xl md:text-[44px]" style={{ fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 16, color: '#111827' }}>
          書いて、直して、<br />
          <span style={{ background: 'linear-gradient(135deg, #F472B6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            伸びていく。
          </span>
        </h1>
        <p style={{ color: '#6B7280', fontSize: 15, maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
          あなた専用の英作文コーチ。<br />
          文法・語彙・文体・構成まで、<br />
          多角的にフィードバック。
        </p>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        <ModeCard
          icon="pencil" iconBg="linear-gradient(135deg, #FCE7F3, #FBCFE8)" iconColor="#EC4899"
          badge="いつでも" title="Free Mode" subtitle="自由に書く"
          description="業務メール・日記・レポートなど、自分の目的に合わせて英文を書いて添削してもらえます。"
          cta="今すぐ書く" ctaBg="linear-gradient(135deg, #F472B6, #EC4899)"
          onClick={() => router.push('/free')} accent="#EC4899"
        />
        <ModeCard
          icon="target" iconBg="linear-gradient(135deg, #EDE9FE, #DDD6FE)" iconColor="#7C3AED"
          badge={`${lv.label} 進行中`} title="Challenge Mode" subtitle="レベルに挑む"
          description={`現在のレベル「${lv.name}」に応じたお題が出題されます。${lv.desc}。`}
          cta={`${lv.label} に挑戦`} ctaBg="linear-gradient(135deg, #A78BFA, #7C3AED)"
          onClick={() => router.push('/challenge')} accent="#7C3AED"
        />
      </div>

      {/* Stats + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Stats sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: lv.bg, border: `1px solid ${lv.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="zap" size={22} color={lv.color} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>現在のレベル</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{lv.label}</div>
              <div style={{ fontSize: 12, color: lv.color, fontWeight: 500 }}>{lv.name}</div>
            </div>
          </div>
          <div style={{ background: '#FFF7ED', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="flame" size={22} color="#F97316" />
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>連続学習日数</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{progress.streak}日</div>
            </div>
          </div>
          <div style={{ background: '#F0FDF4', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="check" size={22} color="#10B981" />
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>総添削回数</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{progress.totalCorrections}回</div>
            </div>
          </div>
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>経験値</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{progress.xp} / {lv.xpMax} XP</span>
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: 99, height: 8 }}>
              <div style={{ background: 'linear-gradient(90deg, #F9A8D4, #EC4899)', height: '100%', borderRadius: 99, width: `${Math.min(xpPct, 100)}%`, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>次のレベルまであと {Math.max(lv.xpMax - progress.xp, 0)} XP</div>
          </div>
        </div>

        {/* Recent history */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1F2937' }}>最近の添削</h2>
            <button onClick={() => router.push('/history')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#EC4899', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              すべて見る <Icon name="chevronRight" size={14} color="#EC4899" />
            </button>
          </div>
          {recentHistory.length === 0 ? (
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>
              <Icon name="history" size={32} color="#E5E7EB" />
              <p style={{ marginTop: 12, fontSize: 14 }}>まだ添削履歴がありません</p>
              <p style={{ fontSize: 13, color: '#D1D5DB', marginTop: 4 }}>Free Mode か Challenge Mode で添削を始めましょう</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentHistory.map((item) => {
                const tags = getTagsFromResult(item.result.corrections);
                return (
                  <div key={item.id} onClick={() => router.push('/history')} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 16 }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#F9A8D4'; el.style.boxShadow = '0 2px 12px rgba(236,72,153,0.08)'; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#E5E7EB'; el.style.boxShadow = 'none'; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: item.result.score >= 80 ? '#F0FDF4' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, flexDirection: 'column' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: item.result.score >= 80 ? '#059669' : '#D97706' }}>{item.result.score}</div>
                      <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 500 }}>SCORE</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{formatDate(item.date)}</span>
                        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 4, background: '#F3F4F6', color: '#6B7280', fontWeight: 500 }}>{item.mode}</span>
                      </div>
                      <div style={{ fontSize: 14, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>{item.inputText.slice(0, 80)}...</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {tags.map((t) => (
                          <span key={t} style={{ fontSize: 11, padding: '1px 7px', borderRadius: 4, background: TYPE_COLORS[t]?.[0] ?? '#F3F4F6', color: TYPE_COLORS[t]?.[1] ?? '#6B7280', fontWeight: 500 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <Icon name="chevronRight" size={16} color="#D1D5DB" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

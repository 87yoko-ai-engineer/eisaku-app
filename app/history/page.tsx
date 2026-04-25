'use client';

import { useState } from 'react';
import { Icon } from '@/components/icons';
import { CorrectionList } from '@/components/CorrectionList';
import { useHistory } from '@/hooks/useHistory';
import { LEVELS } from '@/lib/constants';
import type { HistoryEntry } from '@/types';

const TAG_COLORS: Record<string, [string, string]> = {
  Grammar:    ['#FEE2E2', '#DC2626'],
  Vocabulary: ['#DBEAFE', '#2563EB'],
  Tone:       ['#D1FAE5', '#059669'],
  Structure:  ['#FEF3C7', '#D97706'],
  Spelling:   ['#EDE9FE', '#7C3AED'],
};

const TYPE_MAP: Record<string, string> = {
  grammar: 'Grammar', vocab: 'Vocabulary', tone: 'Tone', structure: 'Structure', spelling: 'Spelling',
};

function getTags(entry: HistoryEntry): string[] {
  return [...new Set(entry.result.corrections.map((c) => TYPE_MAP[c.type] ?? c.type))];
}

export default function HistoryPage() {
  const { history, loaded } = useHistory();
  const [filterMode, setFilterMode] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [filterLevel, setFilterLevel] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const TAGS = ['all', 'Grammar', 'Vocabulary', 'Tone', 'Structure', 'Spelling'];

  const filtered = history.filter((item) => {
    if (filterMode !== 'all' && item.mode !== filterMode) return false;
    if (filterTag !== 'all' && !getTags(item).includes(filterTag)) return false;
    if (filterLevel > 0 && item.level !== filterLevel) return false;
    return true;
  });

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getMonth() + 1}月${dt.getDate()}日`;
  };

  if (!loaded) return null;

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh-56px)] md:overflow-hidden">
      {/* Filter sidebar */}
      <div className="w-full md:w-[220px] md:flex-shrink-0 bg-white border-b md:border-b-0 md:border-r border-[#E5E7EB] overflow-y-auto" style={{ padding: '16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>フィルター</div>

        <FilterSection title="モード">
          {[['all', 'すべて'], ['Free', 'Free Mode'], ['Challenge', 'Challenge']].map(([v, l]) => (
            <FilterChip key={v} label={l} active={filterMode === v} onClick={() => setFilterMode(v)} />
          ))}
        </FilterSection>

        <FilterSection title="観点タグ">
          {TAGS.map((t) => (
            <FilterChip key={t} label={t === 'all' ? 'すべて' : t} active={filterTag === t} onClick={() => setFilterTag(t)} dot={t !== 'all' ? TAG_COLORS[t] : undefined} />
          ))}
        </FilterSection>

        <FilterSection title="レベル">
          {[0, ...LEVELS.map((l) => l.id)].map((id) => {
            const lv = LEVELS.find((l) => l.id === id);
            return <FilterChip key={id} label={id === 0 ? 'すべて' : `${lv!.label} ${lv!.name}`} active={filterLevel === id} onClick={() => setFilterLevel(id)} />;
          })}
        </FilterSection>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
          <button onClick={() => { setFilterMode('all'); setFilterTag('all'); setFilterLevel(0); }} style={{ width: '100%', padding: '7px', borderRadius: 7, border: '1px solid #E5E7EB', background: '#FAFAFA', color: '#6B7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            リセット
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto" style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>添削履歴</h1>
            <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{filtered.length}件 / 全{history.length}件</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
            <Icon name="history" size={36} color="#E5E7EB" />
            <p style={{ marginTop: 12 }}>{history.length === 0 ? 'まだ添削履歴がありません' : '条件に一致する履歴がありません'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((item) => {
              const lv = LEVELS.find((l) => l.id === item.level);
              const tags = getTags(item);
              const isSelected = selected === item.id;
              return (
                <div key={item.id} onClick={() => setSelected(isSelected ? null : item.id)}
                  style={{ background: 'white', border: `1px solid ${isSelected ? '#F9A8D4' : '#E5E7EB'}`, borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.15s', boxShadow: isSelected ? '0 2px 12px rgba(236,72,153,0.08)' : 'none' }}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = '#F9A8D4'; }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: item.result.score >= 80 ? '#F0FDF4' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, flexDirection: 'column' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: item.result.score >= 80 ? '#059669' : '#D97706' }}>{item.result.score}</div>
                      <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 500 }}>SCORE</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{formatDate(item.date)}</span>
                        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 4, background: item.mode === 'Free' ? '#FCE7F3' : '#EDE9FE', color: item.mode === 'Free' ? '#EC4899' : '#7C3AED', fontWeight: 600 }}>{item.mode === 'Free' ? 'Free Mode' : 'Challenge'}</span>
                        {lv && <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 4, background: lv.bg, color: lv.color, fontWeight: 500 }}>{lv.label} {lv.name}</span>}
                      </div>
                      <div style={{ fontSize: 14, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 6 }}>{item.inputText}</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {tags.map((t) => <span key={t} style={{ fontSize: 11, padding: '1px 7px', borderRadius: 4, background: TAG_COLORS[t]?.[0] ?? '#F3F4F6', color: TAG_COLORS[t]?.[1] ?? '#6B7280', fontWeight: 500 }}>{t}</span>)}
                        <span style={{ fontSize: 11, color: '#9CA3AF' }}>{item.result.corrections.length}件の修正</span>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: isSelected ? 'rotate(90deg)' : 'none', flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
                  </div>

                  {isSelected && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F3F4F6' }}>
                      <div style={{ marginBottom: 12, fontSize: 13, color: '#6B7280' }}>
                        <strong style={{ color: '#374151' }}>入力文: </strong>{item.inputText}
                      </div>
                      <CorrectionList corrections={item.result.corrections} />
                      {item.result.summary && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: '#FDF2F8', border: '1px solid #FBCFE8', borderRadius: 8, fontSize: 13, color: '#374151' }}>
                          <span style={{ fontWeight: 600, color: '#EC4899' }}>総評: </span>{item.result.summary}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{children}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick, dot }: { label: string; active: boolean; onClick: () => void; dot?: [string, string] }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 7, border: 'none', background: active ? '#FCE7F3' : 'transparent', color: active ? '#EC4899' : '#4B5563', fontWeight: active ? 600 : 400, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.1s' }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot[1], flexShrink: 0 }} />}
      {label}
    </button>
  );
}

'use client';

import { useState, useCallback, useRef } from 'react';
import { Icon } from '@/components/icons';
import { HighlightedText, CorrectedText } from '@/components/HighlightedText';
import { CorrectionPopup } from '@/components/CorrectionPopup';
import { CorrectionList } from '@/components/CorrectionList';
import { SkeletonResult } from '@/components/SkeletonResult';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useHistory } from '@/hooks/useHistory';
import { TYPE_CONFIG } from '@/lib/constants';
import type { Correction, CorrectionResult } from '@/types';

const SAMPLE = `I am very interested about this project and I think we should to consider it more carefully. The meeting was very good and we will discuss about it next week. Please kindly confirm the below information by Friday.`;

export default function FreePage() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState('business');
  const [layout, setLayout] = useState<'side' | 'stack'>('side');
  const [popup, setPopup] = useState<{ x: number; y: number; correction: Correction } | null>(null);
  const [copied, setCopied] = useState(false);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { progress, recordCorrection } = useUserProgress();
  const { add } = useHistory();

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const handleSubmit = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, tone, mode: 'free', level: progress.level }),
      });
      if (!res.ok) throw new Error('API error');
      const data: CorrectionResult = await res.json();
      setResult(data);
      recordCorrection({ score: data.score, wordCount, tone, mode: 'Free' });
      add({ date: new Date().toISOString(), mode: 'Free', level: progress.level, tone, inputText, result: data });
    } catch {
      alert('添削中にエラーが発生しました。APIキーを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleHover = useCallback((e: React.MouseEvent, correction: Correction) => {
    if (popupTimer.current) clearTimeout(popupTimer.current);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopup({ x: rect.left + rect.width / 2, y: rect.top, correction });
  }, []);

  const handleLeave = useCallback(() => {
    popupTimer.current = setTimeout(() => setPopup(null), 200);
  }, []);

  const getCorrectedText = () => {
    if (!result) return '';
    let text = inputText;
    for (const c of result.corrections) text = text.replace(c.original, c.corrected);
    return text;
  };

  const categoryCounts = result
    ? result.corrections.reduce<Record<string, number>>((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {})
    : {};

  return (
    <div className="flex flex-col md:h-[calc(100vh-56px)]">
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }} className="md:px-8">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="pencil" size={16} color="#EC4899" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Free Mode</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>自由に英文を書いて添削を受けましょう</div>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {result && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>表示形式:</span>
            {(['side', 'stack'] as const).map((v) => (
              <button key={v} onClick={() => setLayout(v)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid', borderColor: layout === v ? '#F9A8D4' : '#E5E7EB', background: layout === v ? '#FCE7F3' : 'white', color: layout === v ? '#EC4899' : '#6B7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Icon name={v === 'side' ? 'columns' : 'rows'} size={13} />{v === 'side' ? '左右' : '上下'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">
        {/* Left: Input */}
        <div className="w-full md:w-[420px] md:flex-shrink-0 flex flex-col bg-white border-b md:border-b-0 md:border-r border-[#E5E7EB] overflow-auto">
          <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Tone selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, display: 'block', marginBottom: 6 }}>文体</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['business', 'ビジネス'], ['casual', 'カジュアル'], ['academic', '学術']].map(([v, l]) => (
                  <button key={v} onClick={() => setTone(v)} style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid', borderColor: tone === v ? '#F9A8D4' : '#E5E7EB', background: tone === v ? '#FCE7F3' : '#FAFAFA', color: tone === v ? '#EC4899' : '#6B7280', fontSize: 12, fontWeight: tone === v ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
                ))}
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`ここに英文を入力してください...\n\n例: I am very interested about this project...`}
              style={{ flex: 1, minHeight: 260, border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '14px', fontSize: 15, lineHeight: 1.7, color: '#1F2937', fontFamily: 'inherit', resize: 'vertical', outline: 'none', transition: 'border-color 0.15s' }}
              onFocus={(e) => (e.target.style.borderColor = '#F9A8D4')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{charCount}文字 · {wordCount}語</span>
              {!inputText && (
                <button onClick={() => setInputText(SAMPLE)} style={{ fontSize: 12, color: '#EC4899', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                  サンプルを入力
                </button>
              )}
            </div>

            <button onClick={handleSubmit} disabled={!inputText.trim() || loading} style={{
              width: '100%', padding: '12px',
              background: inputText.trim() && !loading ? 'linear-gradient(135deg, #F472B6, #EC4899)' : '#F3F4F6',
              color: inputText.trim() && !loading ? 'white' : '#9CA3AF',
              border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
              cursor: inputText.trim() && !loading ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s',
              boxShadow: inputText.trim() && !loading ? '0 2px 10px rgba(236,72,153,0.3)' : 'none',
            }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />添削中...</> : <><Icon name="sparkle" size={16} color={inputText.trim() ? 'white' : '#9CA3AF'} />添削する</>}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex-1 overflow-auto bg-[#FAFAFA]">
          {!result && !loading && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="sparkle" size={28} color="#EC4899" />
              </div>
              <p style={{ color: '#9CA3AF', fontSize: 15, fontWeight: 500 }}>添削結果がここに表示されます</p>
              <p style={{ color: '#D1D5DB', fontSize: 13 }}>左のエリアに英文を入力して「添削する」を押してください</p>
            </div>
          )}
          {loading && <SkeletonResult />}
          {result && !loading && (
            <div style={{ padding: '24px 28px' }}>
              {/* Score bar */}
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#EC4899', lineHeight: 1 }}>{result.score}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, marginTop: 2 }}>SCORE</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(categoryCounts).map(([type, count]) => {
                      const cfg = TYPE_CONFIG[type] ?? { label: type, bg: '#F3F4F6', color: '#6B7280' };
                      return (
                        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ padding: '2px 8px', borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 600 }}>{cfg.label}</span>
                          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{count}件</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 8, background: '#F3F4F6', borderRadius: 99, height: 6 }}>
                    <div style={{ background: 'linear-gradient(90deg, #F9A8D4, #EC4899)', width: `${result.score}%`, height: '100%', borderRadius: 99 }} />
                  </div>
                </div>
                <button onClick={() => { navigator.clipboard?.writeText(getCorrectedText()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1px solid #E5E7EB', background: 'white', color: copied ? '#10B981' : '#6B7280', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.15s' }}>
                  {copied ? <><Icon name="check" size={13} color="#10B981" />コピー済み</> : <><Icon name="copy" size={13} />修正文をコピー</>}
                </button>
              </div>

              {/* Comparison */}
              <div style={{ display: layout === 'side' ? 'grid' : 'flex', gridTemplateColumns: '1fr 1fr', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 6, background: '#FAFAFA' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>原文</span>
                  </div>
                  <div style={{ padding: '16px', fontSize: 15, lineHeight: 1.85, color: '#374151' }}>
                    <HighlightedText text={inputText} corrections={result.corrections} onHover={handleHover} onLeave={handleLeave} />
                  </div>
                </div>
                <div style={{ background: 'white', border: '1.5px solid #FBCFE8', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #FCE7F3', display: 'flex', alignItems: 'center', gap: 6, background: '#FDF2F8' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EC4899' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#EC4899', textTransform: 'uppercase', letterSpacing: '0.05em' }}>修正文</span>
                  </div>
                  <div style={{ padding: '16px', fontSize: 15, lineHeight: 1.85, color: '#1F2937' }}>
                    <CorrectedText original={inputText} corrections={result.corrections} />
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, padding: '10px 14px', background: 'white', border: '1px solid #E5E7EB', borderRadius: 8 }}>
                <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>ハイライト凡例:</span>
                {[['Grammar', '#DC2626', '#FEE2E2'], ['Vocabulary', '#2563EB', '#DBEAFE'], ['Tone', '#059669', '#D1FAE5'], ['Structure', '#D97706', '#FEF3C7']].map(([label, color, bg]) => (
                  <span key={label} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: bg, color, fontWeight: 600 }}>{label}</span>
                ))}
                <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>← ホバーで解説を表示</span>
              </div>

              <CorrectionList corrections={result.corrections} />

              {result.summary && (
                <div style={{ marginTop: 16, padding: '14px 16px', background: '#FDF2F8', border: '1px solid #FBCFE8', borderRadius: 10, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                  <span style={{ fontWeight: 600, color: '#EC4899' }}>総評: </span>{result.summary}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CorrectionPopup popup={popup} />
    </div>
  );
}

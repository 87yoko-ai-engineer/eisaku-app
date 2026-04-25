'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Icon } from '@/components/icons';
import { HighlightedText, CorrectedText } from '@/components/HighlightedText';
import { CorrectionPopup } from '@/components/CorrectionPopup';
import { CorrectionList } from '@/components/CorrectionList';
import { SkeletonResult } from '@/components/SkeletonResult';
import { useUserProgress } from '@/contexts/UserProgressContext';
import { useHistory } from '@/hooks/useHistory';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { LEVELS, CHALLENGE_PROMPTS, TYPE_CONFIG } from '@/lib/constants';
import type { Correction, CorrectionResult, ChatMessage } from '@/types';

export default function ChallengePage() {
  const { progress, recordCorrection } = useUserProgress();
  const { add } = useHistory();
  const { stats, recordResult, getPriority } = useQuestionStats();

  const lv = LEVELS.find((l) => l.id === progress.level) ?? LEVELS[2];
  const basePrompts = CHALLENGE_PROMPTS[(progress.level ?? 3) - 1] ?? CHALLENGE_PROMPTS[2];

  const [weakMode, setWeakMode] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  const promptsForLevel = weakMode
    ? [...basePrompts].sort((a, b) => {
        const idA = `${a.lvId}-${basePrompts.indexOf(a)}`;
        const idB = `${b.lvId}-${basePrompts.indexOf(b)}`;
        return getPriority(idA) - getPriority(idB);
      })
    : basePrompts;

  const promptData = promptsForLevel[promptIndex] ?? promptsForLevel[0];
  const questionId = `${promptData.lvId}-${basePrompts.indexOf(promptData)}`;
  const questionStat = stats[questionId];

  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [layout, setLayout] = useState<'side' | 'stack'>('side');
  const [popup, setPopup] = useState<{ x: number; y: number; correction: Correction } | null>(null);
  const popupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const prevLevelRef = useRef(progress.level);
  useEffect(() => {
    if (prevLevelRef.current !== progress.level) {
      prevLevelRef.current = progress.level;
      setPromptIndex(0);
      setWeakMode(false);
      setInputText('');
      setResult(null);
    }
  }, [progress.level]);

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
        body: JSON.stringify({ text: inputText, tone: 'business', mode: 'challenge', level: progress.level, targetGrammar: promptData.grammar, keywords: promptData.keywords }),
      });
      if (!res.ok) throw new Error('API error');
      const data: CorrectionResult = await res.json();
      setResult(data);
      recordResult(questionId, data.score, data.grammarCheckPassed ?? null);
      recordCorrection({ score: data.score, wordCount, mode: 'Challenge', grammarCheckPassed: data.grammarCheckPassed });
      add({ date: new Date().toISOString(), mode: 'Challenge', level: progress.level, inputText, result: data });
    } catch {
      alert('添削中にエラーが発生しました。APIキーを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setChatMessages([]);
    setChatInput('');
  }, [result]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const buildCorrectionContext = (r: CorrectionResult, input: string) => {
    const lines = [`【学習者の入力文】\n${input}\n`];
    if (r.corrections.length) {
      lines.push('【修正箇所】');
      r.corrections.forEach((c) => {
        lines.push(`- [${c.type}] "${c.original}" → "${c.corrected}": ${c.explanation}`);
      });
    }
    if (r.summary) lines.push(`\n【総評】\n${r.summary}`);
    if (r.modelAnswer) lines.push(`\n【模範回答】\n${r.modelAnswer}`);
    return lines.join('\n');
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading || !result) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, correctionContext: buildCorrectionContext(result, inputText) }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'エラーが発生しました。もう一度お試しください。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
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

  const categoryCounts = result
    ? result.corrections.reduce<Record<string, number>>((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {})
    : {};

  return (
    <div className="flex flex-col md:h-[calc(100vh-56px)]">
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }} className="md:px-8">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: lv.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="target" size={16} color={lv.color} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>Challenge Mode <span style={{ color: lv.color }}>{lv.label}</span></div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>レベル別課題に挑戦して実力を伸ばしましょう</div>
        </div>
        <div style={{ flex: 1 }} />
        {result && (
          <div style={{ display: 'flex', gap: 6 }}>
            {(['side', 'stack'] as const).map((v) => (
              <button key={v} onClick={() => setLayout(v)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: '1px solid', borderColor: layout === v ? `${lv.color}88` : '#E5E7EB', background: layout === v ? lv.bg : 'white', color: layout === v ? lv.color : '#6B7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Icon name={v === 'side' ? 'columns' : 'rows'} size={13} />{v === 'side' ? '左右' : '上下'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">
        {/* Left */}
        <div className="w-full md:w-[420px] md:flex-shrink-0 flex flex-col bg-white border-b md:border-b-0 md:border-r border-[#E5E7EB] overflow-auto">
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Prompt card */}
            <div style={{ background: lv.bg, border: `1.5px solid ${lv.border}`, borderRadius: 12, padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: lv.color, color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{lv.label} — {promptData.grammar}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{promptData.wordRange}</span>
                {questionStat && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: questionStat.grammarPassed === false ? '#FEF3C7' : questionStat.lastScore < 70 ? '#FEE2E2' : '#D1FAE5', color: questionStat.grammarPassed === false ? '#D97706' : questionStat.lastScore < 70 ? '#DC2626' : '#059669', fontWeight: 600 }}>
                    前回 {questionStat.lastScore}点{questionStat.grammarPassed === false ? ' · 文法NG' : questionStat.grammarPassed === true ? ' · 文法OK' : ''}
                  </span>
                )}
                <div style={{ flex: 1 }} />
                <button
                  onClick={() => { setWeakMode((v) => !v); setPromptIndex(0); setInputText(''); setResult(null); }}
                  style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: `1px solid ${weakMode ? lv.color : lv.border}`, background: weakMode ? lv.color : 'white', color: weakMode ? 'white' : lv.color, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {weakMode ? '🎯 苦手順' : '苦手順'}
                </button>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', lineHeight: 1.6, marginBottom: 10 }}>{promptData.prompt}</p>
              <div style={{ background: 'white', borderRadius: 8, padding: '10px 12px', border: '1px solid #E5E7EB', marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>使ってほしい表現</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {promptData.keywords.map((k) => (
                    <span key={k} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: lv.bg, border: `1px solid ${lv.border}`, color: lv.color, fontFamily: 'monospace', fontWeight: 600 }}>{k}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <button
                  onClick={() => { setPromptIndex((promptIndex - 1 + promptsForLevel.length) % promptsForLevel.length); setInputText(''); setResult(null); }}
                  style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: `1px solid ${lv.border}`, background: 'white', color: lv.color, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ← 前の問題へ
                </button>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{promptIndex + 1} / {promptsForLevel.length}</span>
                <button
                  onClick={() => { setPromptIndex((promptIndex + 1) % promptsForLevel.length); setInputText(''); setResult(null); }}
                  style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: `1px solid ${lv.border}`, background: 'white', color: lv.color, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  次の問題へ →
                </button>
              </div>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`ここに英文を入力してください...\n\n例: ${promptData.keywords[0]} ...`}
              style={{ minHeight: 200, border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '14px', fontSize: 15, lineHeight: 1.7, color: '#1F2937', fontFamily: 'inherit', resize: 'vertical', outline: 'none', transition: 'border-color 0.15s' }}
              onFocus={(e) => (e.target.style.borderColor = lv.border)}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{charCount}文字 · {wordCount}語</span>
            </div>

            <button onClick={handleSubmit} disabled={!inputText.trim() || loading} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600,
              cursor: inputText.trim() && !loading ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              background: inputText.trim() && !loading ? `linear-gradient(135deg, ${lv.color}cc, ${lv.color})` : '#F3F4F6',
              color: inputText.trim() && !loading ? 'white' : '#9CA3AF',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: inputText.trim() && !loading ? `0 2px 10px ${lv.color}40` : 'none',
            }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />添削中...</> : <><Icon name="sparkle" size={16} color={inputText.trim() ? 'white' : '#9CA3AF'} />添削する</>}
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 overflow-auto bg-[#FAFAFA]">
          {!result && !loading && (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: lv.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="target" size={28} color={lv.color} />
              </div>
              <p style={{ color: '#9CA3AF', fontSize: 15, fontWeight: 500 }}>添削結果がここに表示されます</p>
              <p style={{ color: '#D1D5DB', fontSize: 13 }}>お題に沿って英文を入力してください</p>
            </div>
          )}
          {loading && <SkeletonResult />}
          {result && !loading && (
            <div style={{ padding: '24px 28px' }}>
              {/* Grammar check banner */}
              <div style={{ background: result.grammarCheckPassed ? '#F0FDF4' : '#FFFBEB', border: `1.5px solid ${result.grammarCheckPassed ? '#A7F3D0' : '#FDE68A'}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: result.grammarCheckPassed ? '#D1FAE5' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={result.grammarCheckPassed ? 'check' : 'info'} size={18} color={result.grammarCheckPassed ? '#059669' : '#D97706'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: result.grammarCheckPassed ? '#065F46' : '#92400E', marginBottom: 2 }}>「{promptData.grammar}」の使用チェック</div>
                  <div style={{ fontSize: 12, color: result.grammarCheckPassed ? '#047857' : '#B45309' }}>
                    {result.grammarCheckPassed ? `正しく使用されています！` : `ターゲット文法の使用が確認できませんでした。ヒントを参考に再挑戦してみましょう。`}
                  </div>
                </div>
                {result.grammarScore !== undefined && (
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: result.grammarCheckPassed ? '#059669' : '#D97706' }}>{result.grammarScore}</div>
                    <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 500 }}>/ 100</div>
                  </div>
                )}
              </div>

              {/* Score */}
              <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: lv.color, lineHeight: 1 }}>{result.score}</div>
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
                    <div style={{ background: `linear-gradient(90deg, ${lv.border}, ${lv.color})`, width: `${result.score}%`, height: '100%', borderRadius: 99 }} />
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div style={{ display: layout === 'side' ? 'grid' : 'flex', gridTemplateColumns: '1fr 1fr', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
                <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>原文</span>
                  </div>
                  <div style={{ padding: '16px', fontSize: 15, lineHeight: 1.85, color: '#374151' }}>
                    <HighlightedText text={inputText} corrections={result.corrections} onHover={handleHover} onLeave={handleLeave} />
                  </div>
                </div>
                <div style={{ background: 'white', border: `1.5px solid ${lv.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: `1px solid ${lv.bg}`, background: lv.bg, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: lv.color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: lv.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>修正文</span>
                  </div>
                  <div style={{ padding: '16px', fontSize: 15, lineHeight: 1.85, color: '#1F2937' }}>
                    <CorrectedText original={inputText} corrections={result.corrections} />
                  </div>
                </div>
              </div>

              <CorrectionList corrections={result.corrections} />

              {result.summary && (
                <div style={{ marginTop: 16, padding: '14px 16px', background: lv.bg, border: `1px solid ${lv.border}`, borderRadius: 10, fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                  <span style={{ fontWeight: 600, color: lv.color }}>総評: </span>{result.summary}
                </div>
              )}

              {result.modelAnswer && (
                <div style={{ marginTop: 16, background: 'white', border: `1.5px solid ${lv.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: `1px solid ${lv.bg}`, background: lv.bg, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="sparkle" size={14} color={lv.color} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: lv.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>模範回答</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>「{promptData.grammar}」を使用した例</span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: 15, lineHeight: 1.85, color: '#1F2937' }}>{result.modelAnswer}</div>
                    {result.modelAnswerJa && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6', fontSize: 13, lineHeight: 1.8, color: '#6B7280' }}>
                        {result.modelAnswerJa}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result && (
                <div style={{ marginTop: 16, background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name="info" size={14} color="#6B7280" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>解説について質問する</span>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto', padding: chatMessages.length ? '12px 16px' : '0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {chatMessages.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                          maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                          background: msg.role === 'user' ? lv.color : '#F3F4F6',
                          color: msg.role === 'user' ? 'white' : '#1F2937',
                          fontSize: 13, lineHeight: 1.7,
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 4px', background: '#F3F4F6', display: 'flex', gap: 4, alignItems: 'center' }}>
                          {[0, 1, 2].map((j) => (
                            <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF', animation: `bounce 1s ${j * 0.15}s infinite` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>
                  <div style={{ padding: '10px 12px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleChatKey}
                      placeholder="解説について質問してください... (Enterで送信)"
                      rows={2}
                      style={{ flex: 1, border: '1.5px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', fontSize: 13, lineHeight: 1.6, fontFamily: 'inherit', resize: 'none', outline: 'none', color: '#1F2937' }}
                      onFocus={(e) => (e.target.style.borderColor = lv.border)}
                      onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
                    />
                    <button
                      onClick={handleChatSend}
                      disabled={!chatInput.trim() || chatLoading}
                      style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: chatInput.trim() && !chatLoading ? lv.color : '#F3F4F6', color: chatInput.trim() && !chatLoading ? 'white' : '#9CA3AF', fontSize: 13, fontWeight: 600, cursor: chatInput.trim() && !chatLoading ? 'pointer' : 'not-allowed', fontFamily: 'inherit', flexShrink: 0 }}
                    >
                      送信
                    </button>
                  </div>
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

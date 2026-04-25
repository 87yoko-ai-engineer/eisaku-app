'use client';

import type { Correction } from '@/types';

interface Segment {
  text: string;
  correction: Correction | null;
}

function buildSegments(text: string, corrections: Correction[]): Segment[] {
  let segments: Segment[] = [{ text, correction: null }];

  for (const corr of corrections) {
    const next: Segment[] = [];
    for (const seg of segments) {
      if (seg.correction) { next.push(seg); continue; }
      const idx = seg.text.indexOf(corr.original);
      if (idx === -1) { next.push(seg); continue; }
      if (idx > 0) next.push({ text: seg.text.slice(0, idx), correction: null });
      next.push({ text: corr.original, correction: corr });
      const rest = seg.text.slice(idx + corr.original.length);
      if (rest) next.push({ text: rest, correction: null });
    }
    segments = next;
  }

  return segments;
}

const HL_CLASS: Record<string, string> = {
  grammar:   'hl-grammar',
  vocab:     'hl-vocab',
  tone:      'hl-tone',
  structure: 'hl-structure',
  spelling:  'hl-spelling',
};

interface Props {
  text: string;
  corrections: Correction[];
  onHover: (e: React.MouseEvent, correction: Correction) => void;
  onLeave: () => void;
  interactive?: boolean;
}

export function HighlightedText({ text, corrections, onHover, onLeave, interactive = true }: Props) {
  const segments = buildSegments(text, corrections);

  return (
    <>
      {segments.map((seg, i) => {
        if (!seg.correction) return <span key={i}>{seg.text}</span>;
        const cls = HL_CLASS[seg.correction.type] ?? 'hl-grammar';
        return (
          <span
            key={i}
            className={cls}
            style={interactive ? undefined : { cursor: 'default' }}
            onMouseEnter={interactive ? (e) => onHover(e, seg.correction!) : undefined}
            onMouseLeave={interactive ? onLeave : undefined}
          >
            {seg.text}
          </span>
        );
      })}
    </>
  );
}

export function CorrectedText({ original, corrections }: { original: string; corrections: Correction[] }) {
  let text = original;
  for (const c of corrections) {
    text = text.replace(c.original, c.corrected);
  }

  const correctedSegments = buildSegments(text, corrections.map((c) => ({ ...c, original: c.corrected })));

  return (
    <>
      {correctedSegments.map((seg, i) => {
        if (!seg.correction) return <span key={i}>{seg.text}</span>;
        const cls = HL_CLASS[seg.correction.type] ?? 'hl-grammar';
        return <span key={i} className={cls} style={{ cursor: 'default' }}>{seg.text}</span>;
      })}
    </>
  );
}

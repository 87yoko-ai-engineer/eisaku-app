'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './icons';
import { LEVELS } from '@/lib/constants';
import { useUserProgress } from '@/contexts/UserProgressContext';

const LINKS = [
  { href: '/',          label: 'ホーム',       icon: 'home' },
  { href: '/free',      label: '添削（Free）', icon: 'pencil' },
  { href: '/challenge', label: 'Challenge',    icon: 'target' },
  { href: '/history',   label: '履歴',         icon: 'history' },
  { href: '/mypage',    label: 'マイページ',   icon: 'user' },
];

export function Nav() {
  const pathname = usePathname();
  const { progress, setLevel } = useUserProgress();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const lv = LEVELS.find((l) => l.id === progress.level) ?? LEVELS[2];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav style={{
      background: 'white', borderBottom: '1px solid #E5E7EB',
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center',
      padding: '0 16px', height: 56, gap: 4,
    }}>
      <Link href="/" style={{
        fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em',
        marginRight: 16, textDecoration: 'none', flexShrink: 0,
        background: 'linear-gradient(135deg, #F9A8D4, #EC4899)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        EiSaku
      </Link>

      {/* Icon-only nav links */}
      <div className="flex" style={{ gap: 0, flex: 1 }}>
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link key={l.href} href={l.href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 8,
              background: active ? '#FCE7F3' : 'transparent',
              color: active ? '#EC4899' : '#9CA3AF',
              textDecoration: 'none', transition: 'all 0.15s',
            }}>
              <Icon name={l.icon} size={18} color={active ? '#EC4899' : '#9CA3AF'} />
            </Link>
          );
        })}
      </div>

      <div ref={ref} style={{ position: 'relative' }}>
        {/* Compact badge */}
        <button onClick={() => setOpen((o) => !o)} className="flex" style={{
          alignItems: 'center', gap: 4,
          background: lv.bg, border: `1px solid ${lv.border}`,
          borderRadius: 16, padding: '4px 8px',
          fontSize: 12, color: lv.color, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
        }}>
          <Icon name="zap" size={12} color={lv.color} />
          <span>{lv.label}</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'white', border: '1px solid #E5E7EB',
            borderRadius: 14, padding: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            width: 320, zIndex: 200,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px 10px' }}>
              学習レベルを選択
            </div>
            {LEVELS.map((l) => (
              <button key={l.id} onClick={() => { setLevel(l.id); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: '10px',
                borderRadius: 9, border: 'none',
                background: progress.level === l.id ? l.bg : 'transparent',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.12s', textAlign: 'left',
                outline: progress.level === l.id ? `1.5px solid ${l.border}` : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: l.bg, border: `1.5px solid ${l.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: l.color,
                }}>{l.id}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{l.label}</span>
                    <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 20, background: l.bg, color: l.color, fontWeight: 600 }}>{l.name}</span>
                    {progress.level === l.id && <Icon name="check" size={13} color={l.color} />}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{l.desc}</div>
                </div>
              </button>
            ))}
            <div style={{ marginTop: 8, padding: '8px 10px 2px', borderTop: '1px solid #F3F4F6', fontSize: 11, color: '#9CA3AF' }}>
              レベルはいつでも自由に変更できます
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

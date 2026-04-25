'use client';

import { useState } from 'react';
import { Icon } from './icons';

interface Props {
  icon: string;
  iconBg: string;
  iconColor: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  ctaBg: string;
  onClick: () => void;
  accent: string;
}

export function ModeCard({ icon, iconBg, iconColor, badge, title, subtitle, description, cta, ctaBg, onClick, accent }: Props) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'white',
        border: `1.5px solid ${hov ? accent + '44' : '#E5E7EB'}`,
        borderRadius: 16, padding: '28px 28px 24px',
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: hov ? `0 8px 32px ${accent}18` : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 140, height: 140, background: `radial-gradient(circle at 100% 0%, ${accent}10, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={22} color={iconColor} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', background: accent + '15', color: accent, borderRadius: 20, letterSpacing: '0.03em' }}>
          {badge}
        </span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>{title}</span>
          <span style={{ fontSize: 14, color: '#9CA3AF' }}>— {subtitle}</span>
        </div>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{description}</p>
      </div>
      <button style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: ctaBg, color: 'white',
        border: 'none', borderRadius: 8, padding: '9px 18px',
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'inherit', boxShadow: `0 2px 8px ${accent}40`,
      }}>
        {cta} <Icon name="arrowRight" size={14} color="white" />
      </button>
    </div>
  );
}

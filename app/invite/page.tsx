'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InvitePage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? 'コードが正しくありません');
      }
    } catch {
      setError('エラーが発生しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #FDF2F8 0%, #FCE7F3 50%, #FDF2F8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 8px 48px rgba(236,72,153,0.1)',
        border: '1px solid #FCE7F3',
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: 32,
        }}>
          <div style={{
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #F9A8D4, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            EiSaku
          </div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>
            招待コードを入力してください
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="招待コード"
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              border: error ? '1.5px solid #F87171' : '1.5px solid #E5E7EB',
              borderRadius: 10,
              fontSize: 15,
              fontFamily: 'inherit',
              outline: 'none',
              marginBottom: 8,
              transition: 'border-color 0.15s',
              color: '#1F2937',
              background: '#FAFAFA',
            }}
            onFocus={(e) => {
              if (!error) e.target.style.borderColor = '#F9A8D4';
            }}
            onBlur={(e) => {
              if (!error) e.target.style.borderColor = '#E5E7EB';
            }}
          />

          {error && (
            <div style={{ fontSize: 13, color: '#EF4444', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            style={{
              width: '100%',
              padding: '12px',
              background: loading || !code.trim() ? '#F9A8D4' : '#EC4899',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: loading || !code.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              marginTop: error ? 0 : 4,
            }}
          >
            {loading ? '確認中...' : '入力する'}
          </button>
        </form>

        <div style={{
          marginTop: 24,
          padding: '16px',
          background: '#FAFAFA',
          borderRadius: 10,
          fontSize: 12,
          color: '#9CA3AF',
          lineHeight: 1.6,
          textAlign: 'center',
        }}>
          招待コードをお持ちでない方は<br />
          お問い合わせください
        </div>
      </div>
    </div>
  );
}

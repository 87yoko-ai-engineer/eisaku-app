export function SkeletonResult() {
  return (
    <div style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div className="spinner" style={{ width: 16, height: 16, flexShrink: 0 }} />
        <span style={{ color: '#9CA3AF', fontSize: 14 }}>Claude が添削しています...</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
            <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 12 }} />
            {[100, 85, 95, 70, 90].map((w, j) => (
              <div key={j} className="skeleton" style={{ height: 12, width: `${w}%`, marginBottom: 8 }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
        <div className="skeleton" style={{ height: 14, width: '30%', marginBottom: 12 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div className="skeleton" style={{ height: 12, width: `${60 + i * 10}%`, marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 12, width: `${40 + i * 8}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

import type { AppSettings } from '../types';

interface Props {
  stats: { total: number; visited: number; wishlist: number; lived: number };
  settings: AppSettings;
}

export default function StatsBar({ stats, settings }: Props) {
  const explored = stats.visited + stats.lived;
  const pct = Math.round((explored / stats.total) * 100);

  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>
          Keşfedilen: {explored}/{stats.total} il ({pct}%)
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4, height: 6, borderRadius: 3, overflow: 'hidden', background: '#e2e8f0' }}>
        {stats.lived > 0 && (
          <div style={{ width: `${(stats.lived / stats.total) * 100}%`, background: settings.colors.lived, borderRadius: 3 }} />
        )}
        {stats.visited > 0 && (
          <div style={{ width: `${(stats.visited / stats.total) * 100}%`, background: settings.colors.visited, borderRadius: 3 }} />
        )}
        {stats.wishlist > 0 && (
          <div style={{ width: `${(stats.wishlist / stats.total) * 100}%`, background: settings.colors.wishlist, borderRadius: 3 }} />
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        {[
          { label: settings.statusLabels.lived, count: stats.lived, color: settings.colors.lived },
          { label: settings.statusLabels.visited, count: stats.visited, color: settings.colors.visited },
          { label: settings.statusLabels.wishlist, count: stats.wishlist, color: settings.colors.wishlist },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
            <span style={{ color: '#64748b' }}>{item.label}: <strong>{item.count}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
}

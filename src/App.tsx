import { useState, useCallback } from 'react';
import TurkeyMap from './components/TurkeyMap';
import StatsBar from './components/StatsBar';
import ProvinceDetail from './pages/ProvinceDetail';
import SettingsPage from './pages/SettingsPage';
import { useProvinces } from './hooks/useProvinces';
import type { ProvinceData } from './types';

type Page = { type: 'map' } | { type: 'detail'; id: number; name: string } | { type: 'settings' };

export default function App() {
  const { provinces, updateProvince, settings, updateSettings, stats, loading } = useProvinces();
  const [page, setPage] = useState<Page>({ type: 'map' });

  const handleProvinceClick = useCallback((id: number, name: string) => {
    setPage({ type: 'detail', id, name });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff',
        flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 40 }}>🗺️</div>
        <p style={{ fontSize: 16, opacity: 0.9 }}>Yükleniyor...</p>
      </div>
    );
  }

  if (page.type === 'settings') {
    return (
      <SettingsPage
        settings={settings}
        onSave={updateSettings}
        onBack={() => setPage({ type: 'map' })}
      />
    );
  }

  if (page.type === 'detail') {
    const existing = provinces.get(page.id);
    const data: ProvinceData = existing ?? {
      id: page.id,
      name: page.name,
      status: 'none',
      notes: '',
      photos: [],
      rating: 0,
    };
    return (
      <ProvinceDetail
        provinceId={page.id}
        provinceName={page.name}
        data={data}
        settings={settings}
        onSave={(d) => updateProvince(d)}
        onBack={() => setPage({ type: 'map' })}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, color: '#fff', fontWeight: 700 }}>
            Irmak'ın Türkiye Günlüğü
          </h1>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            Keşfet, hatırla, hayal et
          </p>
        </div>
        <button
          onClick={() => setPage({ type: 'settings' })}
          style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
            borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ⚙
        </button>
      </div>

      {/* Stats */}
      <StatsBar stats={stats} settings={settings} />

      {/* Map */}
      <div style={{ padding: '0 8px 8px' }}>
        <TurkeyMap
          provinces={provinces}
          settings={settings}
          onProvinceClick={handleProvinceClick}
        />
      </div>

      {/* Legend & Quick List */}
      <div style={{ padding: '0 16px 32px' }}>
        {stats.visited + stats.lived + stats.wishlist > 0 && (
          <div style={{ marginTop: 8 }}>
            <h3 style={{ fontSize: 14, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
              SON İŞARETLENENLER
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Array.from(provinces.values())
                .filter(p => p.status !== 'none')
                .slice(0, 8)
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProvinceClick(p.id, p.name)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      background: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer',
                      textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', width: '100%',
                    }}
                  >
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: settings.colors[p.status], flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#334155' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{settings.statusLabels[p.status]}</div>
                    </div>
                    {p.rating > 0 && (
                      <span style={{ fontSize: 12, color: '#fbbf24' }}>
                        {'★'.repeat(p.rating)}
                      </span>
                    )}
                    <span style={{ fontSize: 14, color: '#cbd5e1' }}>→</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Safe area bottom padding */}
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </div>
  );
}

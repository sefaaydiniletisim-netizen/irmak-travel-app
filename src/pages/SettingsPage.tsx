import { useState } from 'react';
import type { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onBack: () => void;
}

export default function SettingsPage({ settings, onSave, onBack }: Props) {
  const [local, setLocal] = useState<AppSettings>(JSON.parse(JSON.stringify(settings)));

  const updateColor = (key: keyof AppSettings['colors'], value: string) => {
    const next = { ...local, colors: { ...local.colors, [key]: value } };
    setLocal(next);
    onSave(next);
  };

  const updateLabel = (key: keyof AppSettings['statusLabels'], value: string) => {
    const next = { ...local, statusLabels: { ...local.statusLabels, [key]: value } };
    setLocal(next);
  };

  const handleLabelBlur = () => {
    onSave(local);
  };

  const colorOptions = [
    { key: 'visited' as const, label: 'Gezdim Rengi' },
    { key: 'wishlist' as const, label: 'Gitmek İstiyorum Rengi' },
    { key: 'lived' as const, label: 'Yaşadım Rengi' },
    { key: 'none' as const, label: 'Boş İl Rengi' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        color: '#fff',
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8,
          padding: '8px 16px', fontSize: 14, cursor: 'pointer', marginBottom: 8,
        }}>
          ← Geri
        </button>
        <h1 style={{ margin: 0, fontSize: 24 }}>Ayarlar</h1>
      </div>

      <div style={{ padding: 16 }}>
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: '#64748b', marginBottom: 12, fontWeight: 600 }}>RENK AYARLARI</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {colorOptions.map(opt => (
              <div key={opt.key} style={{
                background: '#fff', borderRadius: 12, padding: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: local.colors[opt.key], border: '2px solid #e2e8f0',
                  }} />
                  <span style={{ fontSize: 14, color: '#334155' }}>{opt.label}</span>
                </div>
                <input
                  type="color"
                  value={local.colors[opt.key]}
                  onChange={e => updateColor(opt.key, e.target.value)}
                  style={{
                    width: 40, height: 40, border: 'none', borderRadius: 8,
                    cursor: 'pointer', padding: 0, background: 'transparent',
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: '#64748b', marginBottom: 12, fontWeight: 600 }}>ETİKET AYARLARI</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {colorOptions.map(opt => (
              <div key={opt.key} style={{
                background: '#fff', borderRadius: 12, padding: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  {opt.label} Etiketi
                </label>
                <input
                  type="text"
                  value={local.statusLabels[opt.key]}
                  onChange={e => updateLabel(opt.key, e.target.value)}
                  onBlur={handleLabelBlur}
                  style={{
                    width: '100%', border: '2px solid #e2e8f0', borderRadius: 8,
                    padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <div style={{
          background: '#fff', borderRadius: 12, padding: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center',
          color: '#94a3b8', fontSize: 12,
        }}>
          <p style={{ margin: 0 }}>Irmak'ın Türkiye Günlüğü</p>
          <p style={{ margin: '4px 0 0' }}>Tüm veriler cihazında güvenle saklanır</p>
        </div>
      </div>
    </div>
  );
}

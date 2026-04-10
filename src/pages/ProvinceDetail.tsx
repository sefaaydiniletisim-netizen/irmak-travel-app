import { useState, useEffect, useRef } from 'react';
import type { ProvinceData, ProvinceStatus, AppSettings, PhotoEntry } from '../types';
import { getPhotosForProvince, addPhoto, deletePhoto } from '../utils/db';

interface Props {
  provinceId: number;
  provinceName: string;
  data: ProvinceData;
  settings: AppSettings;
  onSave: (data: ProvinceData) => void;
  onBack: () => void;
}

export default function ProvinceDetail({ provinceId, provinceName, data, settings, onSave, onBack }: Props) {
  const [status, setStatus] = useState<ProvinceStatus>(data.status);
  const [notes, setNotes] = useState(data.notes);
  const [rating, setRating] = useState(data.rating);
  const [photos, setPhotos] = useState<(PhotoEntry & { provinceId: number })[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPhotosForProvince(provinceId).then(setPhotos);
  }, [provinceId]);

  const handleStatusChange = (newStatus: ProvinceStatus) => {
    setStatus(newStatus);
    onSave({ ...data, id: provinceId, name: provinceName, status: newStatus, notes, rating, photos: data.photos });
  };

  const handleNoteSave = () => {
    onSave({ ...data, id: provinceId, name: provinceName, status, notes, rating, photos: data.photos });
  };

  const handleRating = (r: number) => {
    setRating(r);
    onSave({ ...data, id: provinceId, name: provinceName, status, notes, rating: r, photos: data.photos });
  };

  const handlePhotoAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const photo: PhotoEntry = {
        id: `${provinceId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        blob: file,
        caption: '',
        date: new Date().toISOString().split('T')[0],
      };
      await addPhoto(provinceId, photo);
    }
    const updated = await getPhotosForProvince(provinceId);
    setPhotos(updated);
    e.target.value = '';
  };

  const handleDeletePhoto = async (photoId: string) => {
    await deletePhoto(photoId, provinceId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    if (selectedPhoto?.id === photoId) setSelectedPhoto(null);
  };

  const statusOptions: { value: ProvinceStatus; label: string; color: string }[] = [
    { value: 'visited', label: settings.statusLabels.visited, color: settings.colors.visited },
    { value: 'wishlist', label: settings.statusLabels.wishlist, color: settings.colors.wishlist },
    { value: 'lived', label: settings.statusLabels.lived, color: settings.colors.lived },
    { value: 'none', label: settings.statusLabels.none, color: settings.colors.none },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
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
        <h1 style={{ margin: 0, fontSize: 24 }}>{provinceName}</h1>
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => handleRating(star === rating ? 0 : star)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 0,
                color: star <= rating ? '#fbbf24' : 'rgba(255,255,255,0.4)',
              }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Status Selection */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>DURUM</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: status === opt.value ? `2px solid ${opt.color}` : '2px solid #e2e8f0',
                  background: status === opt.value ? `${opt.color}20` : '#fff',
                  color: '#334155',
                  fontSize: 13,
                  fontWeight: status === opt.value ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: opt.color, display: 'inline-block', marginRight: 8, verticalAlign: 'middle',
                }} />
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Photos */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ fontSize: 14, color: '#64748b', margin: 0, fontWeight: 600 }}>
              ANLAR ({photos.length})
            </h3>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none',
                color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
              }}
            >
              + Fotoğraf Ekle
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handlePhotoAdd}
          />
          {photos.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {photos.map(photo => (
                <div key={photo.id} style={{ position: 'relative', paddingBottom: '100%', borderRadius: 12, overflow: 'hidden' }}>
                  <img
                    src={URL.createObjectURL(photo.blob)}
                    alt={photo.caption}
                    onClick={() => setSelectedPhoto(photo)}
                    style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'cover', cursor: 'pointer',
                    }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                    style={{
                      position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)',
                      border: 'none', color: '#fff', borderRadius: '50%', width: 24, height: 24,
                      fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              background: '#fff', borderRadius: 12, padding: '32px 16px', textAlign: 'center',
              border: '2px dashed #e2e8f0', color: '#94a3b8',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              <p style={{ margin: 0, fontSize: 14 }}>Henüz fotoğraf eklenmedi</p>
              <p style={{ margin: '4px 0 0', fontSize: 12 }}>Anılarını buraya ekleyebilirsin</p>
            </div>
          )}
        </section>

        {/* Notes */}
        <section style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, color: '#64748b', marginBottom: 8, fontWeight: 600 }}>NOTLAR</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNoteSave}
            placeholder="Bu il hakkında notlarını yaz..."
            style={{
              width: '100%', minHeight: 120, borderRadius: 12, border: '2px solid #e2e8f0',
              padding: 16, fontSize: 14, resize: 'vertical', fontFamily: 'inherit',
              outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#667eea')}
          />
        </section>
      </div>

      {/* Fullscreen Photo Viewer */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            padding: 16,
          }}
        >
          <img
            src={URL.createObjectURL(selectedPhoto.blob)}
            alt={selectedPhoto.caption}
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 8, objectFit: 'contain' }}
          />
          <button
            onClick={() => setSelectedPhoto(null)}
            style={{
              position: 'absolute', top: 'max(16px, env(safe-area-inset-top))', right: 16,
              background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff',
              borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ProvinceData, PhotoEntry, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

interface TravelDB extends DBSchema {
  provinces: {
    key: number;
    value: ProvinceData;
    indexes: { 'by-status': string };
  };
  photos: {
    key: string;
    value: PhotoEntry & { provinceId: number };
    indexes: { 'by-province': number };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<TravelDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TravelDB>('irmak-travel', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('provinces')) {
          const provinceStore = db.createObjectStore('provinces', { keyPath: 'id' });
          provinceStore.createIndex('by-status', 'status');
        }
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('by-province', 'provinceId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

export async function getProvince(id: number): Promise<ProvinceData | undefined> {
  const db = await getDB();
  return db.get('provinces', id);
}

export async function getAllProvinces(): Promise<ProvinceData[]> {
  const db = await getDB();
  return db.getAll('provinces');
}

export async function saveProvince(data: ProvinceData): Promise<void> {
  const db = await getDB();
  await db.put('provinces', data);
}

export async function addPhoto(provinceId: number, photo: PhotoEntry): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['photos', 'provinces'], 'readwrite');
  await tx.objectStore('photos').put({ ...photo, provinceId });
  const province = await tx.objectStore('provinces').get(provinceId);
  if (province) {
    province.photos.push({ ...photo, blob: undefined as unknown as Blob });
    await tx.objectStore('provinces').put(province);
  }
  await tx.done;
}

export async function getPhotosForProvince(provinceId: number): Promise<(PhotoEntry & { provinceId: number })[]> {
  const db = await getDB();
  return db.getAllFromIndex('photos', 'by-province', provinceId);
}

export async function deletePhoto(photoId: string, provinceId: number): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['photos', 'provinces'], 'readwrite');
  await tx.objectStore('photos').delete(photoId);
  const province = await tx.objectStore('provinces').get(provinceId);
  if (province) {
    province.photos = province.photos.filter(p => p.id !== photoId);
    await tx.objectStore('provinces').put(province);
  }
  await tx.done;
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'app');
  return settings ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'app');
}

export async function getStats() {
  const provinces = await getAllProvinces();
  return {
    total: 81,
    visited: provinces.filter(p => p.status === 'visited').length,
    wishlist: provinces.filter(p => p.status === 'wishlist').length,
    lived: provinces.filter(p => p.status === 'lived').length,
    photosCount: provinces.reduce((sum, p) => sum + (p.photos?.length ?? 0), 0),
  };
}

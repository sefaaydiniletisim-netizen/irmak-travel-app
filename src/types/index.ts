export type ProvinceStatus = 'visited' | 'wishlist' | 'lived' | 'none';

export interface ProvinceData {
  id: number;
  name: string;
  status: ProvinceStatus;
  notes: string;
  photos: PhotoEntry[];
  rating: number; // 0-5 stars
}

export interface PhotoEntry {
  id: string;
  blob: Blob;
  caption: string;
  date: string;
}

export interface AppSettings {
  colors: {
    visited: string;
    wishlist: string;
    lived: string;
    none: string;
  };
  statusLabels: {
    visited: string;
    wishlist: string;
    lived: string;
    none: string;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  colors: {
    visited: '#4ade80',
    wishlist: '#fb923c',
    lived: '#60a5fa',
    none: '#e2e8f0',
  },
  statusLabels: {
    visited: 'Gezdim',
    wishlist: 'Gitmek İstiyorum',
    lived: 'Yaşadım/Yaşıyorum',
    none: 'Henüz Gitmedim',
  },
};

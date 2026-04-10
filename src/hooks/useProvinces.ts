import { useState, useEffect, useCallback } from 'react';
import type { ProvinceData, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { getAllProvinces, saveProvince, getSettings, saveSettings as dbSaveSettings } from '../utils/db';

export function useProvinces() {
  const [provinces, setProvinces] = useState<Map<number, ProvinceData>>(new Map());
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [saved, appSettings] = await Promise.all([getAllProvinces(), getSettings()]);
      const map = new Map<number, ProvinceData>();
      saved.forEach(p => map.set(p.id, p));
      setProvinces(map);
      setSettings(appSettings);
      setLoading(false);
    })();
  }, []);

  const updateProvince = useCallback(async (data: ProvinceData) => {
    await saveProvince(data);
    setProvinces(prev => {
      const next = new Map(prev);
      next.set(data.id, data);
      return next;
    });
  }, []);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    await dbSaveSettings(newSettings);
    setSettings(newSettings);
  }, []);

  const stats = {
    total: 81,
    visited: Array.from(provinces.values()).filter(p => p.status === 'visited').length,
    wishlist: Array.from(provinces.values()).filter(p => p.status === 'wishlist').length,
    lived: Array.from(provinces.values()).filter(p => p.status === 'lived').length,
  };

  return { provinces, updateProvince, settings, updateSettings, stats, loading };
}

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteSettings } from '@/types';
import { apiRequest } from '@/lib/api';

const defaultSettings: SiteSettings = {
  id: 1,
  org_email: 'info@jumuiyachess.org',
  org_phone: '+254700000000',
  mpesa_paybill: '174379',
  shop_enabled: true,
};

const SettingsContext = createContext<{ settings: SiteSettings; loading: boolean }>({
  settings: defaultSettings,
  loading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await apiRequest<SiteSettings>('/settings');
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load site settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SettingsContext);
}

'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FONT_PRESET, FONT_PRESET_CLASS } from '@/modules/general/constants/general.constants';
import { FONT_PRESET_COOKIE, FONT_PRESET_COOKIE_MAX_AGE, getCookie, setCookie } from '@/utils/cookie';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

interface FontPresetContextValue {
  preset: FONT_PRESET;
  setPreset: (next: FONT_PRESET) => void;
}

const FontPresetContext = createContext<FontPresetContextValue | undefined>(undefined);

const VALID_PRESETS = new Set<string>([FONT_PRESET.GEIST, FONT_PRESET.INTER, FONT_PRESET.MONO]);

const isValidPreset = (raw: string | null | undefined): raw is FONT_PRESET => !!raw && VALID_PRESETS.has(raw);

const readStoredPreset = (): FONT_PRESET | null => {
  if (typeof window === 'undefined') return null;

  const fromLocal = getFromLocalStorage(LOCAL_STORAGE_KEYS.FONT_PRESET);

  if (isValidPreset(fromLocal)) return fromLocal;

  const fromCookie = getCookie(FONT_PRESET_COOKIE);

  if (isValidPreset(fromCookie)) return fromCookie;

  return null;
};

const persistPreset = (next: FONT_PRESET) => {
  setToLocalStorage(LOCAL_STORAGE_KEYS.FONT_PRESET, next);
  setCookie(FONT_PRESET_COOKIE, next, FONT_PRESET_COOKIE_MAX_AGE);
};

const applyPresetClass = (next: FONT_PRESET) => {
  const root = document.documentElement;

  Object.values(FONT_PRESET_CLASS).forEach((cls) => root.classList.remove(cls));
  root.classList.add(FONT_PRESET_CLASS[next]);
};

interface FontPresetProviderProps {
  children: React.ReactNode;
  initialPreset: FONT_PRESET;
}

export const FontPresetProvider = ({ children, initialPreset }: FontPresetProviderProps) => {
  const [preset, setPresetState] = useState<FONT_PRESET>(initialPreset);

  const setPreset = useCallback((next: FONT_PRESET) => {
    persistPreset(next);
    applyPresetClass(next);
    setPresetState(next);
  }, []);

  const syncFromStorage = useCallback(() => {
    const next = readStoredPreset();

    if (!next) return;
    applyPresetClass(next);
    setPresetState(next);
  }, []);

  const handleStorageChange = useCallback(
    (event: StorageEvent) => {
      if (event.key !== LOCAL_STORAGE_KEYS.FONT_PRESET) return;
      syncFromStorage();
    },
    [syncFromStorage],
  );

  const value = useMemo(() => ({ preset, setPreset }), [preset, setPreset]);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [handleStorageChange]);

  return <FontPresetContext.Provider value={value}>{children}</FontPresetContext.Provider>;
};

export const useFontPreset = () => {
  const context = useContext(FontPresetContext);

  if (!context) {
    throw new Error('useFontPreset must be used within a FontPresetProvider');
  }

  return context;
};

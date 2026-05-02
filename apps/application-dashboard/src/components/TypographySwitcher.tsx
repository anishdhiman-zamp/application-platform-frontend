'use client';

import { useCallback, useEffect } from 'react';
import { useDialKit } from 'dialkit';
import { useFontPreset } from '@/app/_providers/font-preset-provider';
import { FONT_PRESET, FONT_PRESET_OPTIONS } from '@/modules/general/constants/general.constants';

const PRESET_SELECT_OPTIONS = FONT_PRESET_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const TypographySwitcher = () => {
  const { preset, setPreset } = useFontPreset();

  const params = useDialKit('Typography', {
    preset: {
      type: 'select',
      options: PRESET_SELECT_OPTIONS,
      default: preset,
    },
  });

  const syncPresetFromPanel = useCallback(() => {
    if (params.preset === preset) return;
    setPreset(params.preset as FONT_PRESET);
  }, [params.preset, preset, setPreset]);

  useEffect(() => {
    syncPresetFromPanel();
  }, [syncPresetFromPanel]);

  return null;
};

export default TypographySwitcher;

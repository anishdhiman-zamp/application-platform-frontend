'use client';

import DashboardDowntime from '@/modules/cards/DashboardDowntime';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS } from '@/utils/localstorage';

export default function GodModeGate({ children }: { children: React.ReactNode }) {
  const isGodMode = getFromLocalStorage(LOCAL_STORAGE_KEYS.XZAMP_GOD_MODE);

  if (!isGodMode) {
    return <DashboardDowntime />;
  }

  return <>{children}</>;
}

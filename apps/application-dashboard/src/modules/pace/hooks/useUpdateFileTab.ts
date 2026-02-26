import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getChatFileRoute } from '@/constants/routeConfig';
import { usePaceContext } from '@/modules/pace/pace.context';

interface UpdateFileTabParams {
  oldPath: string;
  newPath: string;
  newName: string;
}

export const useUpdateFileTab = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dynamicTabs, updateDynamicTab, setActiveFileTabKey } = usePaceContext();

  const updateFileTab = useCallback(
    ({ oldPath, newPath, newName }: UpdateFileTabParams) => {
      const openTab = dynamicTabs.find((tab) => tab.id === oldPath);

      if (!openTab) return;

      const newTabPath = getChatFileRoute(newPath);
      const currentFileParam = searchParams?.get('f') ?? null;
      const isCurrentlyActive = currentFileParam === oldPath;

      if (isCurrentlyActive) {
        setActiveFileTabKey(openTab.stableKey);
      }

      updateDynamicTab(oldPath, {
        id: newPath,
        name: newName,
        path: newTabPath,
      });

      if (isCurrentlyActive) {
        router.replace(newTabPath);
      }
    },
    [dynamicTabs, updateDynamicTab, setActiveFileTabKey, searchParams, router],
  );

  return { updateFileTab };
};

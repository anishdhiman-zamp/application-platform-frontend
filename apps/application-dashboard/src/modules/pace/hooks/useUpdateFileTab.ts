import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getChatFileRoute } from '@/constants/routeConfig';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTabType } from '@/modules/pace/pace.types';

interface UpdateFileTabParams {
  oldPath: string;
  newPath: string;
  newName: string;
}

export const useUpdateFileTab = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dynamicTabs, updateDynamicTab } = usePaceContext();

  const updateFileTab = useCallback(
    ({ oldPath, newPath, newName }: UpdateFileTabParams) => {
      const openTab = dynamicTabs.find((tab) => tab.id === oldPath);

      if (!openTab) return;

      const newTabPath = getChatFileRoute(newPath);

      updateDynamicTab(oldPath, {
        id: newPath,
        name: newName,
        type: DynamicTabType.FILE,
        path: newTabPath,
      });

      const currentFileParam = searchParams?.get('f') ?? null;

      if (currentFileParam === oldPath) {
        router.replace(newTabPath);
      }
    },
    [dynamicTabs, updateDynamicTab, searchParams, router],
  );

  return { updateFileTab };
};

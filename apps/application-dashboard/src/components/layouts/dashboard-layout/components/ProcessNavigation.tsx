import { FC, useEffect, useRef, useState } from 'react';
import { getCreateKnowledgeBaseRouteByProcessId, getProcessRouteById } from 'constants/routeConfig';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { Process } from '@/app/(authenticated)/resources';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { type ProcessResponseType, ProcessStatus } from '@/types/api/processApi.types';
import ProcessNavTab from 'components/layouts/dashboard-layout/components/ProcessNavTab';

type ProcessNavigationProps = {
  processes?: ProcessResponseType[];
  params: Record<string, string | string[]> | null;
  deleteProcess: (processId: string) => void;
  updateProcess: (processId: string, data: Partial<Process>) => void;
};

const selectors: string[] = [
  '#process-nav-tab-delete-process-button',
  '#process-nav-tab-popover-trigger',
  '#process-nav-tab-popover-content',
  '#delete-process-dialog',
];

const ProcessNavigation: FC<ProcessNavigationProps> = ({ processes, params, deleteProcess, updateProcess }) => {
  const [newProcessIds, setNewProcessIds] = useState<Set<string>>(new Set());
  const prevProcessIdsRef = useRef<Set<string>>(new Set(processes?.map((p) => p?.process_id) || []));
  const { isEnabled: isZampInternalEnabled } = useFeatureFlag(FEATURE_FLAGS.ZAMP_INTERNAL);

  useEffect(() => {
    if (processes) {
      const currentIds = new Set(processes.map((p) => p.process_id));
      const addedIds = processes.filter((p) => !prevProcessIdsRef.current.has(p.process_id)).map((p) => p.process_id);

      if (addedIds.length > 0) {
        setNewProcessIds(new Set(addedIds));
        const timer = setTimeout(() => {
          setNewProcessIds(new Set());
        }, 500);

        prevProcessIdsRef.current = currentIds;

        return () => clearTimeout(timer);
      }

      prevProcessIdsRef.current = currentIds;
    }
  }, [processes]);

  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='f-12-550 text-GRAY_700 px-1.5 py-2'>Processes</div>
      </div>

      <div className='flex flex-col gap-1'>
        <AnimatePresence initial={false}>
          {processes?.map((process) => {
            const isNewProcess = newProcessIds.has(process.process_id);

            return (
              <motion.div
                key={process.process_id}
                className='relative'
                initial={isNewProcess ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
              >
                <Link
                  href={
                    process.status === ProcessStatus.DRAFT
                      ? getCreateKnowledgeBaseRouteByProcessId(process.process_id)
                      : getProcessRouteById(process.process_id)
                  }
                  className='cursor-pointer'
                  prefetch
                  onClick={(e) => {
                    const target = e.target as HTMLElement;

                    if (selectors.some((selector) => target.closest(selector))) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <ProcessNavTab
                    deleteProcess={deleteProcess}
                    updateProcess={updateProcess}
                    processId={process.process_id}
                    label={process.display_name}
                    isSelected={params?.processId === process.process_id}
                    process={process}
                    isZampInternalEnabled={isZampInternalEnabled}
                  />
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ProcessNavigation;

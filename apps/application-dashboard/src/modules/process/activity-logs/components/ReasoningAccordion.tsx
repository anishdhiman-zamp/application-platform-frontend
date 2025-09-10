import { type FC, memo, type RefObject, useEffect, useRef, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import ConditionalRevealAnimation from 'modules/process/activity-logs/components/ConditionalRevealAnimationWrapper';
import { LOG_STATUS } from 'modules/process/process.types';
import { motion } from 'motion/react';
import Image from 'next/image';
import { ACCORDION_LIST } from '@/constants/icons';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

interface ReasoningAccordionProps {
  thoughtSteps: string[];
  logGroupId: string;
  isLastLog?: boolean;
  status: LOG_STATUS;
}

const STORAGE_KEY = LOCAL_STORAGE_KEYS.OPEN_LOG_GROUP_IDS;
const ACCORDION_ITEM = 'item-1';
const ACCORDION_CONTENT_MAX_HEIGHT = 160;

const ReasoningAccordion = ({ thoughtSteps, logGroupId, isLastLog, status }: ReasoningAccordionProps) => {
  const [openValue, setOpenValue] = useState<string | undefined>();
  const lastItemRef = useRef<HTMLDivElement>(null);
  const prevStepsLengthRef = useRef<number>(thoughtSteps.length);

  const getStoredIds = (): string[] => {
    return JSON.parse(getFromLocalStorage(STORAGE_KEY) || '[]');
  };

  const updateStoredIds = (ids: string[]) => {
    setToLocalStorage(STORAGE_KEY, JSON.stringify(ids));
  };

  useEffect(() => {
    if (getStoredIds().includes(logGroupId)) {
      setOpenValue(ACCORDION_ITEM);
    }
  }, [logGroupId]);

  useEffect(() => {
    const storedIds = getStoredIds();

    if (openValue === ACCORDION_ITEM) {
      if (!storedIds.includes(logGroupId)) {
        updateStoredIds([...storedIds, logGroupId]);
      }
    } else {
      updateStoredIds(storedIds.filter((id) => id !== logGroupId));
    }
  }, [openValue, logGroupId]);

  useEffect(() => {
    if (openValue !== ACCORDION_ITEM || !lastItemRef.current) return;

    const parent = lastItemRef.current.parentElement;
    const shouldScroll = parent && parent.scrollHeight > parent.clientHeight;
    const isNewStep = thoughtSteps.length > prevStepsLengthRef.current;

    if (shouldScroll) {
      const scrollBehavior = isNewStep ? 'smooth' : 'instant';

      parent.scrollTo({ top: parent.scrollHeight, behavior: scrollBehavior });
      if (isNewStep) {
        prevStepsLengthRef.current = thoughtSteps.length;
      }
    }
  }, [thoughtSteps, openValue]);

  // Automatically open/close last log's accordion based on reasoning completion
  useEffect(() => {
    if (isLastLog && status !== LOG_STATUS.SUCCESS) {
      setOpenValue(ACCORDION_ITEM);
    } else {
      setOpenValue(undefined);
    }
  }, [isLastLog, status]);

  return (
    <Accordion
      type='single'
      collapsible
      className={cn('mt-2 w-full max-w-[485px] min-w-[180px]')}
      value={openValue}
      onValueChange={setOpenValue}
    >
      <ConditionalRevealAnimation className='w-full' isLastLog={isLastLog}>
        <AccordionItem value={ACCORDION_ITEM} className='w-full border-0'>
          <div className='relative'>
            {!(status === LOG_STATUS.LOADING && isLastLog) && (
              <AccordionTrigger
                className={cn(
                  'f-12-450 text-GRAY_900 border-GRAY_100 top-0 left-0 w-full gap-x-2 rounded-tl-md rounded-tr-md border bg-white p-1.5',
                  openValue !== ACCORDION_ITEM && 'rounded-br-md',
                )}
              >
                <motion.span
                  className='text-wrap break-words'
                  key={thoughtSteps?.at(-1)}
                  transition={{
                    duration: 0.3,
                    delay: 0.1,
                  }}
                >
                  See reasoning
                </motion.span>
              </AccordionTrigger>
            )}

            <motion.div
              animate={{ maxHeight: openValue === ACCORDION_ITEM ? ACCORDION_CONTENT_MAX_HEIGHT : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className='overflow-hidden'
            >
              <AccordionContent
                className={cn(
                  'f-12-450 border-GRAY_100 flex max-h-[160px] w-full flex-col gap-y-2 overflow-y-auto rounded-br-md border-x border-b bg-white px-4 py-4 [&::-webkit-scrollbar]:hidden',
                  isLastLog && status === LOG_STATUS.LOADING && 'rounded-tl-md rounded-tr-md border-t pt-4',
                )}
              >
                {thoughtSteps?.map((step, index) => (
                  <ThoughtStepItem
                    key={index}
                    step={step}
                    isLast={index === thoughtSteps?.length - 1}
                    lastItemRef={lastItemRef}
                  />
                ))}
              </AccordionContent>
            </motion.div>
          </div>
        </AccordionItem>
      </ConditionalRevealAnimation>
    </Accordion>
  );
};

export default memo(ReasoningAccordion);

interface ThoughtStepItemProps {
  step: string;
  isLast: boolean;
  lastItemRef: RefObject<HTMLDivElement | null>;
}

const ThoughtStepItem: FC<ThoughtStepItemProps> = ({ step, isLast, lastItemRef }) => {
  return (
    <div ref={isLast ? lastItemRef : null} className='flex w-full items-start justify-start gap-x-4'>
      <div className='flex items-start justify-center'>
        <Image src={ACCORDION_LIST} alt='accordion-list' width={13} height={9} priority className='shrink-0' />
      </div>
      <p className='f-12-450 text-GRAY_900 w-full text-wrap break-words'>{step}</p>
    </div>
  );
};

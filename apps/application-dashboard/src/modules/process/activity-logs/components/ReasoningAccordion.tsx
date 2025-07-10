import { type FC, memo, type RefObject, useEffect, useRef, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, RevealElement } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
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
      className='mt-2 mb-10 w-full max-w-[485px] min-w-[180px]'
      value={openValue}
      onValueChange={setOpenValue}
    >
      <RevealElement className='w-full'>
        <AccordionItem value={ACCORDION_ITEM} className='w-full border-0'>
          <div className='relative'>
            {!(status === LOG_STATUS.LOADING && isLastLog) && (
              <AccordionTrigger
                className={cn(
                  'f-12-450 text-GRAY_900 border-GRAY_100 absolute top-0 left-0 w-full gap-x-2 rounded-tl-md rounded-tr-md border p-1.5',
                  openValue !== ACCORDION_ITEM && 'rounded-br-md',
                )}
              >
                <motion.span
                  className='text-wrap break-words'
                  key={thoughtSteps?.at(-1)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1,
                  }}
                >
                  {thoughtSteps?.at(-1) || 'See reasoning'}
                </motion.span>
              </AccordionTrigger>
            )}

            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: openValue !== ACCORDION_ITEM ? 0 : 1 }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
            >
              <AccordionContent
                className={cn(
                  'f-12-450 border-GRAY_100 flex max-h-40 w-full flex-col gap-y-2 overflow-y-scroll rounded-tl-md rounded-tr-md rounded-br-md border-x border-b px-4 pt-12 pb-4 [&::-webkit-scrollbar]:hidden',
                  isLastLog && status === LOG_STATUS.LOADING && 'border-t pt-4',
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
      </RevealElement>
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

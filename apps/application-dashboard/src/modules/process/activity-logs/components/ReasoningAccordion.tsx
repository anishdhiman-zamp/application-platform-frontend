import { type FC, memo, type RefObject, useEffect, useRef, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import Image from 'next/image';
import { ACCORDION_LIST } from '@/constants/icons';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

interface ReasoningAccordionProps {
  thoughtSteps: string[];
  logGroupId: string;
}

const STORAGE_KEY = LOCAL_STORAGE_KEYS.OPEN_LOG_GROUP_IDS;
const ACCORDION_ITEM = 'item-1';

const ReasoningAccordion = ({ thoughtSteps, logGroupId }: ReasoningAccordionProps) => {
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

  return (
    <Accordion
      type='single'
      collapsible
      className='mt-2 w-full max-w-[485px] min-w-[180px]'
      value={openValue}
      onValueChange={setOpenValue}
    >
      <AccordionItem value={ACCORDION_ITEM} className='border-GRAY_100 w-full rounded-t-md rounded-br-md border'>
        <AccordionTrigger className='f-12-450 text-GRAY_900 w-full cursor-pointer gap-x-2 p-1.5'>
          <span className='text-wrap break-words'>See reasoning</span>
        </AccordionTrigger>
        <AccordionContent className='border-GRAY_100 f-12-450 flex max-h-40 w-full flex-col gap-y-2 overflow-y-scroll border-t p-4 [&::-webkit-scrollbar]:hidden'>
          {thoughtSteps?.map((step, index) => (
            <ThoughtStepItem
              key={index}
              step={step}
              isLast={index === thoughtSteps?.length - 1}
              lastItemRef={lastItemRef}
            />
          ))}
        </AccordionContent>
      </AccordionItem>
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

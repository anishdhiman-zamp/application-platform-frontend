import { useEffect, useState } from 'react';
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
  const [openValue, setOpenValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    const storedLogGroupIds: string[] = JSON.parse(getFromLocalStorage(STORAGE_KEY) || '[]');

    if (storedLogGroupIds.includes(logGroupId)) {
      setOpenValue(ACCORDION_ITEM);
    }
  }, [logGroupId]);

  useEffect(() => {
    const storedLogGroupIds: string[] = JSON.parse(getFromLocalStorage(STORAGE_KEY) || '[]');

    if (openValue === ACCORDION_ITEM) {
      if (!storedLogGroupIds.includes(logGroupId)) {
        const updatedIds = [...storedLogGroupIds, logGroupId];

        setToLocalStorage(STORAGE_KEY, JSON.stringify(updatedIds));
      }
    } else {
      const updatedIds = storedLogGroupIds.filter((id) => id !== logGroupId);

      setToLocalStorage(STORAGE_KEY, JSON.stringify(updatedIds));
    }
  }, [openValue, logGroupId]);

  const handleAccordionChange = (value: string | undefined) => {
    setOpenValue(value);
  };

  return (
    <Accordion
      type='single'
      collapsible
      className='mt-2 w-full max-w-[485px] min-w-[180px]'
      value={openValue}
      onValueChange={handleAccordionChange}
    >
      <AccordionItem value={ACCORDION_ITEM} className='border-GRAY_100 w-full rounded-t-md rounded-br-md border'>
        <AccordionTrigger className='f-12-450 text-GRAY_900 w-full cursor-pointer gap-x-2 p-1.5'>
          <span className='text-wrap break-words'>See reasoning</span>
        </AccordionTrigger>
        <AccordionContent className='border-GRAY_100 f-12-450 flex max-h-40 w-full flex-col gap-y-2 overflow-y-scroll border-t p-4'>
          {thoughtSteps?.map((title, index) => (
            <div key={index} className='flex w-full items-start justify-start gap-x-4'>
              <div className='flex items-start justify-center'>
                <Image src={ACCORDION_LIST} alt='accordion-list' width={13} height={9} priority className='shrink-0' />
              </div>
              <p className='f-12-450 text-GRAY_900 w-full text-wrap break-words'>{title}</p>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ReasoningAccordion;

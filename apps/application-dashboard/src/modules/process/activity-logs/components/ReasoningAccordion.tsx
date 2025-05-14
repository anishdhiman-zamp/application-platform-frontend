import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import Image from 'next/image';
import { ACCORDION_LIST } from '@/constants/icons';

const REASONING_ACCORDION_MOCK_DATA = {
  id: 1,
  title: 'Missing 7 critical fields blocked extraction → Drafted vendor email requesting corrected invoice',
  content: [
    {
      id: 1,
      title: 'Missing 7 critical fields blocked extraction',
    },
    {
      id: 2,
      title: 'Missing 7 critical fields blocked extraction',
    },
    {
      id: 3,
      title: 'Missing 7 critical fields blocked extraction',
    },
  ],
};

const ReasoningAccordion = () => {
  return (
    <Accordion type='single' collapsible className='w-full mt-2'>
      <AccordionItem value='item-1' className='border border-GRAY_100 rounded-t-md rounded-br-md'>
        <AccordionTrigger className='f-12-450 text-GRAY_900 p-1.5 gap-x-2'>
          {REASONING_ACCORDION_MOCK_DATA?.title}
        </AccordionTrigger>
        <AccordionContent className='border-t border-GRAY_100 p-4 f-12-450 flex flex-col gap-y-2'>
          {REASONING_ACCORDION_MOCK_DATA?.content?.map((item) => (
            <div key={item.id} className='flex items-center justify-start gap-x-4'>
              <Image src={ACCORDION_LIST} alt='accordion-list' width={13} height={9} priority />
              <p className='f-12-450 text-GRAY_900'>{item.title}</p>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ReasoningAccordion;

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import Image from 'next/image';
import { ACCORDION_LIST } from '@/constants/icons';

interface ReasoningAccordionProps {
  thoughtSteps: string[];
}

const ReasoningAccordion = ({ thoughtSteps }: ReasoningAccordionProps) => {
  return (
    <Accordion type='single' collapsible className='w-full max-w-[485px] min-w-[200px] mt-2'>
      <AccordionItem value='item-1' className='border border-GRAY_100 rounded-t-md rounded-br-md w-full'>
        <AccordionTrigger className='f-12-450 text-GRAY_900 p-1.5 gap-x-2 w-full'>
          <span className='break-words text-wrap'>{thoughtSteps?.[thoughtSteps?.length - 1]}</span>
        </AccordionTrigger>
        <AccordionContent className='border-t border-GRAY_100 p-4 f-12-450 flex flex-col gap-y-2 w-full'>
          {thoughtSteps?.map((title: string, index: number) => (
            <div key={index} className='flex items-start justify-start gap-x-4 w-full'>
              <div className='flex items-start justify-center pt-1'>
                <Image src={ACCORDION_LIST} alt='accordion-list' width={13} height={9} priority className='shrink-0' />
              </div>
              <p className='f-12-450 text-GRAY_900 text-wrap break-words w-full'>{title}</p>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ReasoningAccordion;

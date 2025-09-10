import { type FC, Fragment } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronRight } from 'lucide-react';
import KnowledgeBaseNavCard from '@/modules/knowledge-based/KnowledgeBaseNavCard';

interface KnowledgeBaseNavigationProps {
  items: HeaderItem[];
  level?: number;
  currentSelectedHeader?: string | null;
  setCurrentSelectedHeader: (header: string | null) => void;
}
export interface HeaderItem {
  id: string;
  text: string;
  children?: HeaderItem[];
}

const KnowledgeBaseNavigation: FC<KnowledgeBaseNavigationProps> = ({
  items,
  level = 0,
  currentSelectedHeader,
  setCurrentSelectedHeader,
}) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClick = (id: string) => {
    scrollToSection(id);
    if (id.length > 0) {
      setCurrentSelectedHeader(id);
    }
  };

  return (
    <Accordion
      type='multiple'
      className={cn('w-full', {
        'border-gray-200': level > 0,
      })}
    >
      {items.map((item, index) => (
        <Fragment key={item.id}>
          {item.children && item.children.length > 0 ? (
            <AccordionItem key={item.id} value={item.id} className='mb-1.5 !border-none'>
              <AccordionTrigger
                className={cn(
                  'f-14-500 !justify-start gap-4 rounded px-2 py-1 text-left text-gray-900 hover:cursor-pointer [&>svg:last-child]:hidden',
                  {
                    '!-ml-2 !px-0': level !== 0,
                  },
                )}
              >
                <ChevronRight
                  className={cn(
                    'accordion-trigger-icon h-4.5 w-4.5 min-w-[18px] text-gray-700 transition-transform duration-200 hover:text-gray-900',
                    {
                      'text-gray-900': currentSelectedHeader === item.id,
                    },
                  )}
                />
                {item.text}
              </AccordionTrigger>
              <AccordionContent className={cn('pl-0', { '!pl-4': level === 0 })}>
                {item.children.map((child) => (
                  <KnowledgeBaseNavCard
                    key={child.id}
                    header={child}
                    handleClick={handleClick}
                    currentSelectedHeader={currentSelectedHeader ?? null}
                    level={1}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : (
            <div className={cn({ 'px-4': level === 0, 'mb-1.5': index === items.length - 1 })}>
              <div
                className={cn('border-gray-200 px-2', {
                  '!border-gray-1000 !text-gray-1000 f-14-500 border-l-2':
                    currentSelectedHeader === item.id && level !== 0,
                  'border-l px-8': level !== 0,
                  'mb-1 pl-4.5': level === 0,
                })}
              >
                <Button
                  variant='ghost'
                  size='small'
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(item.id);
                  }}
                  className={cn(
                    'f-14-500 block h-auto w-full cursor-pointer rounded bg-white px-2 py-1.5 text-left whitespace-break-spaces text-gray-900 hover:bg-gray-100',
                    {
                      '!text-gray-1000': currentSelectedHeader === item.id,
                    },
                  )}
                >
                  {item.text}
                </Button>
              </div>
            </div>
          )}
        </Fragment>
      ))}
    </Accordion>
  );
};

export default KnowledgeBaseNavigation;

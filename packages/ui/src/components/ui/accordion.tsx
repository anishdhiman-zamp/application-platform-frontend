'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronRight } from 'lucide-react';
import * as React from 'react';

import { cn } from '@zamp-platform/ui/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const Accordion = AccordionPrimitive.Root;

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot='accordion-item' className={cn('border-b', className)} {...props} />;
}

interface AccordionTriggerProps extends React.ComponentProps<typeof AccordionPrimitive.Trigger> {
  icon?: React.ComponentType<{ className?: string }>;
  iconRotation?: 90 | 180;
  useTooltip?: boolean;
  tooltipContent?: React.ReactNode;
}

function AccordionTrigger({
  className,
  children,
  icon,
  iconRotation = 90,
  useTooltip = false,
  tooltipContent,
  ...props
}: AccordionTriggerProps) {
  const Icon = icon || ChevronRight;
  const rotationClass =
    iconRotation === 180 ? '[&[data-state=open]>svg]:rotate-180' : '[&[data-state=open]>svg]:rotate-90';

  const iconElement = (
    <Icon className='text-GRAY_700 h-4 w-4 shrink-0 cursor-pointer transition-transform duration-200' />
  );

  return (
    <AccordionPrimitive.Header className='flex'>
      <AccordionPrimitive.Trigger
        data-slot='accordion-trigger'
        className={cn(
          'flex flex-1 items-center justify-between py-4 text-left text-sm font-medium transition-all',
          rotationClass,
          className,
        )}
        {...props}
      >
        {children}
        {useTooltip && tooltipContent ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{iconElement}</TooltipTrigger>
              <TooltipContent>{tooltipContent}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          iconElement
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot='accordion-content'
      className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm'
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };

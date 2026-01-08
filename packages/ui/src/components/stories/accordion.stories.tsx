import type { Meta, StoryObj } from '@storybook/nextjs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  argTypes: {
    type: {
      control: 'select',
      options: ['single', 'multiple'],
      description: 'Accordion type - single or multiple items can be open',
    },
    collapsible: {
      control: 'boolean',
      description: 'Whether accordion items can be collapsed',
    },
  },
  args: {
    type: 'single',
    collapsible: true,
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: (args) => (
    <Accordion {...args} className='w-full max-w-md'>
      <AccordionItem value='item-1'>
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-2'>
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-3'>
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>Yes. It&apos;s animated by default with smooth transitions.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  args: {
    type: 'multiple',
  },
  render: (args) => (
    <Accordion {...args} className='w-full max-w-md'>
      <AccordionItem value='item-1'>
        <AccordionTrigger>First Section</AccordionTrigger>
        <AccordionContent>Content for the first section.</AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-2'>
        <AccordionTrigger>Second Section</AccordionTrigger>
        <AccordionContent>Content for the second section.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithTooltip: Story = {
  render: (args) => (
    <Accordion {...args} className='w-full max-w-md'>
      <AccordionItem value='item-1'>
        <AccordionTrigger useTooltip tooltipContent='Click to expand'>
          Hover over the icon
        </AccordionTrigger>
        <AccordionContent>This accordion trigger has a tooltip on the icon.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

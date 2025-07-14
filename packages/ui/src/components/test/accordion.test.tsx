import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

describe('Accordion Component - Functional Tests', () => {
  it('renders with trigger and content', () => {
    const { getByText } = render(
      <Accordion type='single' defaultValue='item-1'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(getByText('Section 1')).toBeInTheDocument();
    expect(getByText('Content 1')).toBeInTheDocument();
  });

  it('renders chevron icon with expected styling', () => {
    const { container } = render(
      <Accordion type='single'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Section</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const chevron = container.querySelector('svg');
    expect(chevron).toBeInTheDocument();
    expect(chevron).toHaveClass('h-4', 'w-4');
  });

  it('applies custom classNames to trigger, content, and item', () => {
    const { getByRole, container } = render(
      <Accordion type='single' defaultValue='item-1'>
        <AccordionItem className='custom-item-class' value='item-1'>
          <AccordionTrigger className='custom-trigger-class'>Trigger</AccordionTrigger>
          <AccordionContent className='custom-content-class'>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const item = container.querySelector('[data-slot="accordion-item"]');
    const contentWrapper = container.querySelector('[data-slot="accordion-content"] > div');

    expect(item).toHaveClass('custom-item-class');
    expect(getByRole('button')).toHaveClass('custom-trigger-class');
    expect(contentWrapper).toHaveClass('custom-content-class');
  });

  // Critical snapshots that could break component usage
  it('matches snapshot for default accordion', () => {
    const { container } = render(
      <Accordion type='single' defaultValue='item-1'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for multiple type accordion', () => {
    const { container } = render(
      <Accordion type='multiple' defaultValue={['item-1']}>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for collapsible accordion', () => {
    const { container } = render(
      <Accordion type='single' collapsible defaultValue='item-1'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Collapsible Section</AccordionTrigger>
          <AccordionContent>Collapsible Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Accordion Component - Type Behavior Tests', () => {
  it('single type allows only one item to be open at a time', () => {
    render(
      <Accordion type='single' defaultValue='item-1'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByText('Trigger 1');
    const trigger2 = screen.getByText('Trigger 2');
    const content1 = screen.getByText('Content 1');
    const content2 = screen.queryByText('Content 2');

    // Initially, item-1 should be open (defaultValue)
    expect(content1).toBeVisible();
    expect(content2).not.toBeInTheDocument();

    // Clicking trigger2 should close item-1 and open item-2
    fireEvent.click(trigger2);
    expect(content1).not.toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();

    // Clicking trigger1 should close item-2 and open item-1
    fireEvent.click(trigger1);
    expect(screen.getByText('Content 1')).toBeVisible();
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
  });

  it('multiple type allows multiple items to be open simultaneously', () => {
    render(
      <Accordion type='multiple' defaultValue={['item-1']}>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger1 = screen.getByText('Trigger 1');
    const trigger2 = screen.getByText('Trigger 2');
    const content1 = screen.getByText('Content 1');
    const content2 = screen.queryByText('Content 2');

    // Initially, only item-1 should be open
    expect(content1).toBeVisible();
    expect(content2).not.toBeInTheDocument();

    // Clicking trigger2 should open item-2 while keeping item-1 open
    fireEvent.click(trigger2);
    expect(content1).toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();

    // Clicking trigger1 should close item-1 while keeping item-2 open
    fireEvent.click(trigger1);
    expect(content1).not.toBeVisible();
    expect(screen.getByText('Content 2')).toBeVisible();
  });

  it('handles long content without layout breaking', () => {
    const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'.repeat(20);
    const { getByText } = render(
      <Accordion type='single' defaultValue='item-1'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>{longContent}</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(getByText(/Lorem ipsum/)).toBeInTheDocument();
  });

  it('supports collapsible behavior in single type', () => {
    render(
      <Accordion type='single' collapsible defaultValue='item-1'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = screen.getByText('Trigger');
    const content = screen.getByText('Content');

    // Initially open
    expect(content).toBeVisible();

    // Clicking trigger should close the item (collapsible behavior)
    fireEvent.click(trigger);
    expect(content).not.toBeVisible();

    // Clicking trigger again should open the item
    fireEvent.click(trigger);
    expect(screen.getByText('Content')).toBeVisible();
  });
});

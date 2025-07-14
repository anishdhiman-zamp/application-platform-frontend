import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

describe('Tabs Component - Functional Tests', () => {
  it('renders tab list and triggers with default selected tab', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList data-testid='tabs-list'>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );

    expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();

    expect(screen.getByText('Content 1')).toBeInTheDocument();
    expect(screen.queryByText('Content 2')).toBeNull();
  });

  it('switches tab content on user click', async () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );

    await userEvent.click(screen.getByText('Tab 2'));

    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).toBeNull();
  });

  it('supports className props for TabsList and TabsTrigger', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsList className='custom-list' data-testid='list'>
          <TabsTrigger value='tab1' className='custom-trigger'>
            Tab 1
          </TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content</TabsContent>
      </Tabs>,
    );

    expect(screen.getByTestId('list')).toHaveClass('custom-list');
    expect(screen.getByText('Tab 1')).toHaveClass('custom-trigger');
  });

  it('forwards props to TabsContent', () => {
    render(
      <Tabs defaultValue='tab1'>
        <TabsContent value='tab1' data-testid='tab-panel' aria-label='Tab Panel'>
          Hello
        </TabsContent>
      </Tabs>,
    );

    const el = screen.getByTestId('tab-panel');
    expect(el).toHaveAttribute('aria-label', 'Tab Panel');
  });

  // Critical snapshots that could break component usage
  it('matches snapshot for basic tabs', () => {
    const { container } = render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>Tab 1</TabsTrigger>
          <TabsTrigger value='tab2'>Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>Content 1</TabsContent>
        <TabsContent value='tab2'>Content 2</TabsContent>
      </Tabs>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for tabs with custom classes', () => {
    const { container } = render(
      <Tabs defaultValue='tab1' className='custom-tabs'>
        <TabsList className='custom-list'>
          <TabsTrigger value='tab1' className='custom-trigger'>
            Styled Tab
          </TabsTrigger>
        </TabsList>
        <TabsContent value='tab1' className='custom-content'>
          Styled Content
        </TabsContent>
      </Tabs>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for tabs with multiple triggers', () => {
    const { container } = render(
      <Tabs defaultValue='tab1'>
        <TabsList>
          <TabsTrigger value='tab1'>First</TabsTrigger>
          <TabsTrigger value='tab2'>Second</TabsTrigger>
          <TabsTrigger value='tab3'>Third</TabsTrigger>
          <TabsTrigger value='tab4'>Fourth</TabsTrigger>
        </TabsList>
        <TabsContent value='tab1'>First Content</TabsContent>
        <TabsContent value='tab2'>Second Content</TabsContent>
        <TabsContent value='tab3'>Third Content</TabsContent>
        <TabsContent value='tab4'>Fourth Content</TabsContent>
      </Tabs>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

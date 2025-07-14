import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandShortcut,
} from '../ui/command';

describe('Command Component - Core Functional Tests', () => {
  it('renders CommandInput with placeholder', () => {
    render(
      <Command>
        <CommandInput placeholder='Search commands...' />
      </Command>,
    );
    expect(screen.getByPlaceholderText('Search commands...')).toBeInTheDocument();
  });

  it('renders CommandList with items', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Item One</CommandItem>
          <CommandItem>Item Two</CommandItem>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
  });

  it('shows CommandEmpty when no results found', () => {
    render(
      <Command>
        <CommandEmpty>No results</CommandEmpty>
      </Command>,
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('renders CommandGroup with heading and items', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading='Group A'>
            <CommandItem>Item A1</CommandItem>
            <CommandItem>Item A2</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Item A1')).toBeInTheDocument();
    expect(screen.getByText('Item A2')).toBeInTheDocument();
  });

  it('renders CommandItem with shortcut', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>
            New File
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.getByText('⌘N')).toBeInTheDocument();
  });

  it('supports selecting a CommandItem', () => {
    const handleSelect = jest.fn();
    render(
      <Command>
        <CommandList>
          <CommandItem onSelect={handleSelect}>Run</CommandItem>
        </CommandList>
      </Command>,
    );

    fireEvent.click(screen.getByText('Run'));
    expect(handleSelect).toHaveBeenCalled();
  });

  it('renders CommandDialog with input and list', () => {
    render(
      <CommandDialog open onOpenChange={jest.fn()}>
        <CommandInput placeholder='Find...' />
        <CommandList>
          <CommandItem>Command 1</CommandItem>
        </CommandList>
      </CommandDialog>,
    );

    expect(screen.getByPlaceholderText('Find...')).toBeInTheDocument();
    expect(screen.getByText('Command 1')).toBeInTheDocument();
  });

  it('renders CommandSeparator', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem>Above</CommandItem>
          <CommandSeparator data-testid='separator' />
          <CommandItem>Below</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByTestId('separator')).toBeInTheDocument();
  });

  it('renders CommandLoading', () => {
    render(
      <Command>
        <CommandList>
          <CommandLoading data-testid='loading'>Loading...</CommandLoading>
        </CommandList>
      </Command>,
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies custom className to Command and subcomponents', () => {
    render(
      <Command className='custom-command'>
        <CommandInput className='custom-input' />
        <CommandList className='custom-list'>
          <CommandGroup className='custom-group' heading='Group'>
            <CommandItem className='custom-item'>Item</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(document.querySelector('.custom-command')).toBeInTheDocument();
    expect(document.querySelector('.custom-input')).toBeInTheDocument();
    expect(document.querySelector('.custom-list')).toBeInTheDocument();
    expect(document.querySelector('.custom-group')).toBeInTheDocument();
    expect(document.querySelector('.custom-item')).toBeInTheDocument();
  });

  it('renders disabled and selected CommandItem', () => {
    render(
      <Command>
        <CommandList>
          <CommandItem disabled data-testid='disabled-item'>
            Disabled
          </CommandItem>
          <CommandItem data-testid='selected-item' aria-selected='true'>
            Selected
          </CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByTestId('disabled-item')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('selected-item')).toHaveAttribute('aria-selected', 'true');
  });

  it('forwards refs correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Command ref={ref} />);
    expect(ref.current).toBeDefined();
    expect(ref.current).toBeDefined();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('handles undefined children gracefully', () => {
    expect(() => {
      render(<Command>{undefined}</Command>);
    }).not.toThrow();
  });

  // Critical snapshots that could break component usage
  it('matches snapshot for basic command with input and list', () => {
    const { container } = render(
      <Command>
        <CommandInput placeholder='Snapshot...' />
        <CommandList>
          <CommandItem>Snap 1</CommandItem>
          <CommandItem>Snap 2</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for command dialog', () => {
    const { container } = render(
      <CommandDialog open onOpenChange={jest.fn()}>
        <CommandInput placeholder='Dialog...' />
        <CommandList>
          <CommandItem>Dialog Item</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for command with groups and separators', () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandGroup heading='Group'>
            <CommandItem>Item 1</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandItem>Item 2</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for command item with shortcut', () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandItem>
            New File
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
        </CommandList>
      </Command>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for command with loading state', () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandLoading>Loading...</CommandLoading>
        </CommandList>
      </Command>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for command with empty state', () => {
    const { container } = render(
      <Command>
        <CommandEmpty>No results found</CommandEmpty>
      </Command>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});

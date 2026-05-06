import { fireEvent, render, screen } from '@testing-library/react';
import PageSidePanel from '@/modules/pace/components/page-side-panel/PageSidePanel';

describe('PageSidePanel', () => {
  const getStoredWidths = () => JSON.parse(localStorage.getItem('PACE_PAGE_SIDE_PANEL_WIDTHS') ?? '{}');

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1400,
    });
  });

  it('renders open drawer content and calls onClose from the default header', () => {
    const onClose = jest.fn();

    render(
      <PageSidePanel open title='Details' onClose={onClose}>
        <div>Panel body</div>
      </PageSidePanel>,
    );

    expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument();
    expect(screen.getByText('Panel body')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close panel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when closed', () => {
    render(
      <PageSidePanel open={false} title='Details' onClose={jest.fn()}>
        <div>Panel body</div>
      </PageSidePanel>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('resizes from the left edge and remembers the user-set width for its tab', () => {
    render(
      <PageSidePanel open title='Details' widthStorageId='files' onClose={jest.fn()}>
        <div>Panel body</div>
      </PageSidePanel>,
    );

    const panel = screen.getByRole('dialog', { name: 'Details' });
    const resizeHandle = screen.getByRole('separator', { name: 'Resize details panel' });

    expect(panel).toHaveStyle({ width: '800px' });

    fireEvent(resizeHandle, new MouseEvent('pointerdown', { bubbles: true, clientX: 500 }));
    fireEvent(document, new MouseEvent('pointermove', { bubbles: true, clientX: 300 }));

    expect(panel).toHaveStyle({ width: '1000px' });

    fireEvent(document, new MouseEvent('pointerup', { bubbles: true, clientX: 300 }));

    expect(getStoredWidths()).toEqual({ files: 1000 });
  });

  it('supports keyboard resizing', () => {
    render(
      <PageSidePanel open title='Details' widthStorageId='tasks' onClose={jest.fn()}>
        <div>Panel body</div>
      </PageSidePanel>,
    );

    const panel = screen.getByRole('dialog', { name: 'Details' });
    const resizeHandle = screen.getByRole('separator', { name: 'Resize details panel' });

    fireEvent.keyDown(resizeHandle, { key: 'ArrowLeft' });

    expect(panel).toHaveStyle({ width: '824px' });
    expect(getStoredWidths()).toEqual({ tasks: 824 });
  });

  it('restores the width across fresh sessions after the user has resized the panel', () => {
    localStorage.setItem('PACE_PAGE_SIDE_PANEL_WIDTHS', JSON.stringify({ files: 1000 }));

    render(
      <PageSidePanel open title='Details' widthStorageId='files' onClose={jest.fn()}>
        <div>Panel body</div>
      </PageSidePanel>,
    );

    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveStyle({ width: '1000px' });
  });

  it('keeps user-set widths isolated by tab', () => {
    localStorage.setItem('PACE_PAGE_SIDE_PANEL_WIDTHS', JSON.stringify({ files: 1000, tasks: 640 }));

    render(
      <PageSidePanel open title='Details' widthStorageId='tasks' onClose={jest.fn()}>
        <div>Panel body</div>
      </PageSidePanel>,
    );

    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveStyle({ width: '640px' });
  });

  it('starts from the default width before the user has resized the panel', () => {
    render(
      <PageSidePanel open title='Details' widthStorageId='agents' onClose={jest.fn()}>
        <div>Panel body</div>
      </PageSidePanel>,
    );

    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveStyle({ width: '800px' });
  });
});

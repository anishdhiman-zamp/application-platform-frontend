import React, { type RefObject } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Row from 'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/Row';
import type { ColumnDef } from '@/components/common/agGridTable/AgGridTable';
import { FILTER_TYPES } from '@/components/filter/filter.types';

const mockGetFormattedDate = jest.fn((_config, value) => value);

jest.mock('next/navigation', () => ({
  useParams: () => ({ processId: 'test-process-id' }),
}));

jest.mock('modules/process/artifacts/context/completedFields.context', () => ({
  useCompletedFields: () => ({
    state: { completedFields: {} },
  }),
}));

jest.mock('@/modules/chatbot', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid='chatbot-wrapper'>{children}</div>,
}));

jest.mock('@/modules/chatbot/CommentButton', () => ({
  __esModule: true,
  default: () => <button data-testid='comment-button'>Comment</button>,
}));

jest.mock('@/modules/data/data.utils', () => ({
  getColumnOrderingVisibilityForCurrentDataset: () => [],
  getFormattedDate: (config: unknown, value: unknown) => mockGetFormattedDate(config, value),
  getValueFormatter: () => undefined,
}));

jest.mock('@/modules/widgets/TreeTable/utils', () => ({
  isValueEmpty: (value: unknown) => value === null || value === undefined || value === '',
}));

jest.mock(
  'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/DisplayField',
  () =>
    function MockDisplayField({ value, onClick }: { value: string; onClick: () => void }) {
      return (
        <div data-testid='display-field' onClick={onClick}>
          {value}
        </div>
      );
    },
);

jest.mock(
  'modules/process/artifacts/components/pdf-dataset-artifact/dataset-row/EditableField',
  () =>
    function MockEditableField({
      editingValue,
      onInputChange,
      onBlur,
      onKeyDown,
      onDoubleClick,
      isEditing,
      shouldShowInputDirectly,
    }: {
      value: string;
      editingValue: string;
      onInputChange: (value: string) => void;
      onBlur: () => void;
      onKeyDown: (e: React.KeyboardEvent) => void;
      onDoubleClick: () => void;
      isEditing: boolean;
      shouldShowInputDirectly: boolean;
    }) {
      const showTextarea = isEditing || shouldShowInputDirectly;

      return (
        <div data-testid='editable-field'>
          {showTextarea ? (
            <textarea
              data-testid='edit-textarea'
              value={editingValue}
              onChange={(e) => onInputChange(e.target.value)}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
            />
          ) : (
            <div data-testid='display-value' onDoubleClick={onDoubleClick}>
              {editingValue}
            </div>
          )}
        </div>
      );
    },
);

// Helper to create default props
const createDefaultProps = (overrides: Partial<Parameters<typeof Row>[0]> = {}) => {
  const textareaRef = { current: null } as RefObject<HTMLTextAreaElement | null>;
  const selectedKeyRef = { current: null } as RefObject<HTMLDivElement | null>;

  const defaultColumns: ColumnDef[] = [
    {
      field: 'testField',
      headerName: 'Test Field',
      cellRendererParams: { is_editable: true },
    },
  ];

  return {
    keyValue: ['testField', 'original value'] as [string, string],
    rowId: 'row-1',
    selectedKey: '',
    columns: defaultColumns,
    onChange: jest.fn(),
    missingFields: [],
    requiredMissingFields: [],
    currentUserHasEditAccess: true,
    textareaRef,
    selectedKeyRef,
    clickedField: '',
    setClickedField: jest.fn(),
    datasetId: 'dataset-1',
    activityId: 'activity-1',
    filterConfig: [],
    rowData: { testField: 'original value' },
    isPdfDataset: false,
    ...overrides,
  };
};

describe('Row Component - Flush on Unmount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Scenario 1: Basic flush (Type → switch tab)', () => {
    it('should flush pending edit on unmount when user types and switches tab without saving', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      // Find and interact with the textarea (shouldShowInputDirectly = true since isEditable && !isCompleted)
      const textarea = screen.getByTestId('edit-textarea');

      fireEvent.change(textarea, { target: { value: 'new value' } });

      // Unmount (simulates tab switch)
      unmount();

      // Should have called onChange exactly once on unmount
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('testField', 'new value', 'row-1');
    });
  });

  describe('Scenario 2: No duplicate after Enter', () => {
    it('should not flush on unmount if user already saved via Enter', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // Type a new value
      fireEvent.change(textarea, { target: { value: 'saved value' } });

      // Press Enter to save
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      // Should have saved once via Enter
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('testField', 'saved value', 'row-1');

      // Clear mock to track unmount behavior
      onChange.mockClear();

      // Unmount
      unmount();

      // Should NOT have called onChange again on unmount
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 3: No duplicate after blur', () => {
    it('should not flush on unmount if user already saved via blur', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // Type a new value
      fireEvent.change(textarea, { target: { value: 'blurred value' } });

      // Blur to save
      fireEvent.blur(textarea);

      // Should have saved once via blur
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('testField', 'blurred value', 'row-1');

      // Clear mock
      onChange.mockClear();

      // Unmount
      unmount();

      // Should NOT have called onChange again
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 4: Cancel respected (Escape)', () => {
    it('should not flush on unmount if user pressed Escape to cancel', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // Type a new value
      fireEvent.change(textarea, { target: { value: 'cancelled value' } });

      // Press Escape to cancel
      fireEvent.keyDown(textarea, { key: 'Escape' });

      // Should NOT have called onChange (cancel doesn't save)
      expect(onChange).not.toHaveBeenCalled();

      // Unmount
      unmount();

      // Should still NOT have called onChange (cancelled edit should not flush)
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Scenario 5: Re-edit after save', () => {
    it('should flush the second edit on unmount after first edit was saved via Enter', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // First edit + save
      fireEvent.change(textarea, { target: { value: 'first edit' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('testField', 'first edit', 'row-1');

      // Second edit (no save)
      fireEvent.change(textarea, { target: { value: 'second edit' } });

      // Unmount
      unmount();

      // Should have called onChange twice total (once for Enter, once for unmount)
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenLastCalledWith('testField', 'second edit', 'row-1');
    });
  });

  describe('Scenario 6: Re-edit after cancel', () => {
    it('should flush the new edit on unmount after previous edit was cancelled', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // First edit + cancel
      fireEvent.change(textarea, { target: { value: 'cancelled edit' } });
      fireEvent.keyDown(textarea, { key: 'Escape' });

      // No save should have happened
      expect(onChange).not.toHaveBeenCalled();

      // New edit after cancel
      fireEvent.change(textarea, { target: { value: 'new edit after cancel' } });

      // Unmount
      unmount();

      // Should flush the new edit
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('testField', 'new edit after cancel', 'row-1');
    });
  });

  describe('Scenario 7: No-op on clean field', () => {
    it('should not flush on unmount if user did not edit the field', () => {
      const onChange = jest.fn();
      // Use same value for both to avoid formattedValue !== value edge case
      const props = createDefaultProps({
        onChange,
        keyValue: ['testField', 'unchanged value'],
        rowData: { testField: 'unchanged value' },
      });

      const { unmount } = render(<Row {...props} />);

      // Don't do anything - just unmount
      unmount();

      // Should NOT have called onChange
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not flush when editingValue equals original value (no actual change)', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // Type the same value as original
      fireEvent.change(textarea, { target: { value: 'original value' } });

      // Unmount
      unmount();

      // Should NOT flush since value hasn't actually changed
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should not flush on formatted field when user did not type (isDirtyRef guards spurious flush)', () => {
      // This test verifies that when formattedValue !== value (e.g., DATE_RANGE formatting),
      // the component does NOT spuriously flush on unmount if the user never typed anything.
      // This is the key fix provided by isDirtyRef.

      const onChange = jest.fn();

      // Mock getFormattedDate to return a DIFFERENT formatted value
      mockGetFormattedDate.mockImplementation(() => '26 Feb 2026');

      const props = createDefaultProps({
        onChange,
        keyValue: ['dateField', '2026-02-26'], // raw value
        rowData: { dateField: '2026-02-26' },
        columns: [
          {
            field: 'dateField',
            headerName: 'Date Field',
            cellRendererParams: { is_editable: true },
          },
        ],
        // filterConfig with DATE_RANGE type triggers the formatting path
        filterConfig: [
          {
            column: 'dateField',
            type: FILTER_TYPES.DATE_RANGE,
            alias: 'Date Field',
            options: [],
            datatype: 'date',
            metadata: {},
          },
        ],
      });

      const { unmount } = render(<Row {...props} />);

      // At this point:
      // - value (raw) = "2026-02-26"
      // - formattedValue = "26 Feb 2026" (from mock)
      // - editingValue is initialized to formattedValue = "26 Feb 2026"
      // - editingValueRef = "26 Feb 2026"
      // - valueRef = "2026-02-26"
      // WITHOUT isDirtyRef, this would cause a spurious flush because editingValueRef !== valueRef

      // Don't do anything - just unmount without user interaction
      unmount();

      // Should NOT have called onChange because isDirtyRef.current is false (user never typed)
      expect(onChange).not.toHaveBeenCalled();

      // Restore the mock to default behavior for other tests
      mockGetFormattedDate.mockImplementation((_config, value) => value);
    });
  });

  describe('Scenario 8: shouldShowInputDirectly path', () => {
    it('should flush when typing directly in always-visible textarea', () => {
      const onChange = jest.fn();
      // isEditable = true (via column config + currentUserHasEditAccess)
      // isCompleted = false (no completed fields)
      // shouldShowInputDirectly = isEditable && !isCompleted = true
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      // Textarea should be visible immediately (shouldShowInputDirectly)
      const textarea = screen.getByTestId('edit-textarea');

      expect(textarea).toBeInTheDocument();

      // Type directly without double-clicking
      fireEvent.change(textarea, { target: { value: 'direct edit' } });

      // Unmount
      unmount();

      // Should flush
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('testField', 'direct edit', 'row-1');
    });
  });

  describe('Scenario 9: Multiple fields (separate Row instances)', () => {
    it('should flush each dirty Row independently', () => {
      const onChange1 = jest.fn();
      const onChange2 = jest.fn();

      // Each Row needs its keyValue field to match its column's field
      const props1 = createDefaultProps({
        onChange: onChange1,
        keyValue: ['field1', 'value1'],
        rowId: 'row-1',
        columns: [
          {
            field: 'field1',
            headerName: 'Field 1',
            cellRendererParams: { is_editable: true },
          },
        ],
      });

      const props2 = createDefaultProps({
        onChange: onChange2,
        keyValue: ['field2', 'value2'],
        rowId: 'row-2',
        columns: [
          {
            field: 'field2',
            headerName: 'Field 2',
            cellRendererParams: { is_editable: true },
          },
        ],
      });

      // Render both in a single container to query them together
      const { unmount } = render(
        <>
          <Row {...props1} />
          <Row {...props2} />
        </>,
      );

      // Get both textareas
      const textareas = screen.getAllByTestId('edit-textarea');

      expect(textareas).toHaveLength(2);

      // Edit both fields
      fireEvent.change(textareas[0], { target: { value: 'edited field 1' } });
      fireEvent.change(textareas[1], { target: { value: 'edited field 2' } });

      // Unmount both at once (simulates tab switch unmounting parent)
      unmount();

      // Both should have flushed independently
      expect(onChange1).toHaveBeenCalledTimes(1);
      expect(onChange1).toHaveBeenCalledWith('field1', 'edited field 1', 'row-1');

      expect(onChange2).toHaveBeenCalledTimes(1);
      expect(onChange2).toHaveBeenCalledWith('field2', 'edited field 2', 'row-2');
    });
  });

  describe('Scenario 10: HITL Submit & Continue (unmount mid-edit)', () => {
    it('should flush pending edit when component unmounts due to navigation', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // User is mid-edit
      fireEvent.change(textarea, { target: { value: 'mid-edit value' } });

      // Simulate HITL navigation by unmounting (same as tab switch)
      unmount();

      // Should flush the pending edit
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('testField', 'mid-edit value', 'row-1');
    });
  });

  describe('Edge Cases', () => {
    it('should not flush empty string edits', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // Clear the field (empty string)
      fireEvent.change(textarea, { target: { value: '' } });

      // Unmount
      unmount();

      // Should NOT flush empty string (guarded by `current !== ''` check)
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle rapid Enter then type then unmount correctly', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // Rapid sequence: type → Enter → type → unmount
      fireEvent.change(textarea, { target: { value: 'first' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      fireEvent.change(textarea, { target: { value: 'second' } });
      unmount();

      // Should have 2 calls: one from Enter, one from unmount
      expect(onChange).toHaveBeenCalledTimes(2);
      expect(onChange).toHaveBeenNthCalledWith(1, 'testField', 'first', 'row-1');
      expect(onChange).toHaveBeenNthCalledWith(2, 'testField', 'second', 'row-1');
    });

    it('should handle Escape then type then Enter then unmount correctly', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      // type → Escape → type → Enter → unmount
      fireEvent.change(textarea, { target: { value: 'cancelled' } });
      fireEvent.keyDown(textarea, { key: 'Escape' });
      fireEvent.change(textarea, { target: { value: 'final' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
      unmount();

      // Only 1 call from Enter (Escape cancelled first edit, Enter saved second, unmount skipped due to hasSavedRef)
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('testField', 'final', 'row-1');
    });

    it('should not render Row when column is not found', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({
        onChange,
        columns: [], // No matching column
      });

      const { container } = render(<Row {...props} />);

      // Should render nothing
      expect(container.firstChild).toBeNull();
    });

    it('should not call onChange if onChange prop is undefined', () => {
      const props = createDefaultProps({ onChange: undefined });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      fireEvent.change(textarea, { target: { value: 'new value' } });

      // Should not throw when unmounting with undefined onChange
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Shift+Enter behavior', () => {
    it('should not save on Shift+Enter (allows newline)', () => {
      const onChange = jest.fn();
      const props = createDefaultProps({ onChange });

      const { unmount } = render(<Row {...props} />);

      const textarea = screen.getByTestId('edit-textarea');

      fireEvent.change(textarea, { target: { value: 'line1\nline2' } });
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      // Shift+Enter should NOT trigger save
      expect(onChange).not.toHaveBeenCalled();

      // Unmount should flush
      unmount();
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});

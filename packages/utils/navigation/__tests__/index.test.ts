import { getNextNavigationTarget } from '../index';

interface TestItem {
  id: string;
  name: string;
}

const createItems = (count: number): TestItem[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }));

const isEqual = (a: TestItem, b: TestItem) => a.id === b.id;

describe('getNextNavigationTarget', () => {
  describe('when no items remain after closing', () => {
    it('should return null target', () => {
      const items = createItems(1);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[0],
        isEqual,
      });

      expect(result.target).toBeNull();
      expect(result.hasRemainingItems).toBe(false);
      expect(result.remainingItems).toHaveLength(0);
    });
  });

  describe('browser-like strategy (default)', () => {
    it('should navigate to next item when closing first item', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[0],
        isEqual,
      });

      expect(result.target?.id).toBe('item-1');
      expect(result.hasRemainingItems).toBe(true);
    });

    it('should navigate to next item when closing middle item', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[1],
        isEqual,
      });

      expect(result.target?.id).toBe('item-2');
    });

    it('should navigate to previous item when closing last item', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[3],
        isEqual,
      });

      expect(result.target?.id).toBe('item-2');
    });

    it('should navigate to remaining item when only two items exist', () => {
      const items = createItems(2);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[0],
        isEqual,
      });

      expect(result.target?.id).toBe('item-1');
    });
  });

  describe('previous strategy', () => {
    it('should navigate to previous item when closing middle item', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[2],
        isEqual,
        strategy: 'previous',
      });

      expect(result.target?.id).toBe('item-1');
    });

    it('should navigate to first item when closing first item', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[0],
        isEqual,
        strategy: 'previous',
      });

      expect(result.target?.id).toBe('item-1');
    });

    it('should navigate to previous item when closing last item', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[3],
        isEqual,
        strategy: 'previous',
      });

      expect(result.target?.id).toBe('item-2');
    });
  });

  describe('next strategy', () => {
    it('should navigate to next item when closing first item', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[0],
        isEqual,
        strategy: 'next',
      });

      expect(result.target?.id).toBe('item-1');
    });

    it('should navigate to next item when closing middle item', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[1],
        isEqual,
        strategy: 'next',
      });

      expect(result.target?.id).toBe('item-2');
    });

    it('should navigate to last remaining item when closing last item', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[3],
        isEqual,
        strategy: 'next',
      });

      expect(result.target?.id).toBe('item-2');
    });
  });

  describe('remainingItems', () => {
    it('should return correct remaining items', () => {
      const items = createItems(4);
      const result = getNextNavigationTarget({
        items,
        closingItem: items[1],
        isEqual,
      });

      expect(result.remainingItems).toHaveLength(3);
      expect(result.remainingItems.map((i) => i.id)).toEqual(['item-0', 'item-2', 'item-3']);
    });
  });
});

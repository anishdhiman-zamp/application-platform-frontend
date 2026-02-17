import { prioritizedSearch } from '../index';

interface TestItem {
  id: string;
  name: string;
  description: string;
}

const testItems: TestItem[] = [
  { id: '1', name: 'Payment Processing', description: 'Handle all payment transactions' },
  { id: '2', name: 'Order Management', description: 'Manage orders with payment tracking' },
  { id: '3', name: 'User Authentication', description: 'Secure login and authentication' },
  { id: '4', name: 'payment', description: 'Simple payment handler' },
  { id: '5', name: 'Inventory Control', description: 'Track inventory levels' },
];

const defaultFields = [
  { getValue: (item: TestItem) => item.name, weight: 100 },
  { getValue: (item: TestItem) => item.description, weight: 10 },
];

describe('prioritizedSearch', () => {
  describe('basic filtering', () => {
    it('should return all items when query is empty', () => {
      const result = prioritizedSearch({
        items: testItems,
        query: '',
        fields: defaultFields,
      });

      expect(result).toEqual(testItems);
    });

    it('should return all items when query is whitespace only', () => {
      const result = prioritizedSearch({
        items: testItems,
        query: '   ',
        fields: defaultFields,
      });

      expect(result).toEqual(testItems);
    });

    it('should filter items that match the query', () => {
      const result = prioritizedSearch({
        items: testItems,
        query: 'inventory',
        fields: defaultFields,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('5');
    });

    it('should return empty array when no matches found', () => {
      const result = prioritizedSearch({
        items: testItems,
        query: 'nonexistent',
        fields: defaultFields,
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('prioritization', () => {
    it('should prioritize name matches over description matches', () => {
      const result = prioritizedSearch({
        items: testItems,
        query: 'payment',
        fields: defaultFields,
      });

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('4');
      expect(result[1].id).toBe('1');
      expect(result[2].id).toBe('2');
    });

    it('should give bonus to exact matches', () => {
      const result = prioritizedSearch({
        items: testItems,
        query: 'payment',
        fields: defaultFields,
      });

      expect(result[0].name).toBe('payment');
    });

    it('should give bonus to "starts with" matches', () => {
      const items = [
        { id: '1', name: 'Authentication Service', description: '' },
        { id: '2', name: 'User Auth', description: '' },
        { id: '3', name: 'Auth', description: '' },
      ];

      const result = prioritizedSearch({
        items,
        query: 'auth',
        fields: [{ getValue: (item: { id: string; name: string; description: string }) => item.name, weight: 100 }],
      });

      expect(result[0].id).toBe('3');
      expect(result[1].id).toBe('1');
      expect(result[2].id).toBe('2');
    });
  });

  describe('case insensitivity', () => {
    it('should match regardless of case', () => {
      const result = prioritizedSearch({
        items: testItems,
        query: 'PAYMENT',
        fields: defaultFields,
      });

      expect(result).toHaveLength(3);
    });

    it('should treat uppercase and lowercase as equal for scoring', () => {
      const result = prioritizedSearch({
        items: testItems,
        query: 'Payment',
        fields: defaultFields,
      });

      expect(result[0].name.toLowerCase()).toBe('payment');
    });
  });

  describe('multiple fields', () => {
    it('should accumulate scores from multiple matching fields', () => {
      const items = [
        { id: '1', name: 'Auth Service', description: 'Authentication handler' },
        { id: '2', name: 'Login', description: 'Auth module' },
      ];

      const result = prioritizedSearch({
        items,
        query: 'auth',
        fields: [
          { getValue: (item: { id: string; name: string; description: string }) => item.name, weight: 100 },
          { getValue: (item: { id: string; name: string; description: string }) => item.description, weight: 10 },
        ],
      });

      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('custom bonuses', () => {
    it('should use custom exactMatchBonus', () => {
      const items = [
        { id: '1', name: 'test', description: '' },
        { id: '2', name: 'testing', description: '' },
      ];

      const result = prioritizedSearch({
        items,
        query: 'test',
        fields: [{ getValue: (item: { id: string; name: string; description: string }) => item.name, weight: 100 }],
        exactMatchBonus: 200,
      });

      expect(result[0].id).toBe('1');
    });

    it('should use custom startsWithBonus', () => {
      const items = [
        { id: '1', name: 'testing', description: '' },
        { id: '2', name: 'unit test', description: '' },
      ];

      const result = prioritizedSearch({
        items,
        query: 'test',
        fields: [{ getValue: (item: { id: string; name: string; description: string }) => item.name, weight: 100 }],
        startsWithBonus: 75,
      });

      expect(result[0].id).toBe('1');
    });
  });
});

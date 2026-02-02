import { formatPlural, normalize, withArticle } from '../index';

describe('string utilities', () => {
  describe('formatPlural', () => {
    it('should return singular form for count of 1', () => {
      expect(formatPlural(1, 'file')).toBe('1 file');
    });

    it('should return plural form for count greater than 1', () => {
      expect(formatPlural(3, 'file')).toBe('3 files');
    });

    it('should use custom plural word when provided', () => {
      expect(formatPlural(2, 'child', 'children')).toBe('2 children');
    });
  });

  describe('normalize', () => {
    it('should convert to lowercase and remove non-alphanumeric characters', () => {
      expect(normalize('Hello World!')).toBe('helloworld');
    });

    it('should return empty string for undefined', () => {
      expect(normalize(undefined)).toBe('');
    });
  });

  describe('withArticle', () => {
    it('should return "an" for words starting with a vowel', () => {
      expect(withArticle('apple')).toBe('an apple');
      expect(withArticle('elephant')).toBe('an elephant');
      expect(withArticle('igloo')).toBe('an igloo');
      expect(withArticle('orange')).toBe('an orange');
      expect(withArticle('umbrella')).toBe('an umbrella');
    });

    it('should return "a" for words starting with a consonant', () => {
      expect(withArticle('banana')).toBe('a banana');
      expect(withArticle('cat')).toBe('a cat');
      expect(withArticle('dog')).toBe('a dog');
    });

    it('should handle uppercase words by converting to lowercase', () => {
      expect(withArticle('Gmail')).toBe('a gmail');
      expect(withArticle('APPLE')).toBe('an apple');
      expect(withArticle('Outlook')).toBe('an outlook');
    });
  });
});

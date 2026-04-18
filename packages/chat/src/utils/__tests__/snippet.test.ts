import { createSnippetFile, getNextSnippetFileName, isLargeText } from '../snippet';

describe('isLargeText', () => {
  it('returns false for short single-line text', () => {
    expect(isLargeText('Hello world')).toBe(false);
  });

  it('returns false for text with many lines but under char threshold', () => {
    const text = Array.from({ length: 20 }, (_, i) => `line${i + 1}`).join('\n');
    expect(isLargeText(text)).toBe(false);
  });

  it('returns false for text over char threshold but with few lines', () => {
    expect(isLargeText('a'.repeat(2001))).toBe(false);
  });

  it('returns true when both line and char thresholds are exceeded', () => {
    const text = ('a'.repeat(150) + '\n').repeat(16);
    expect(isLargeText(text)).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isLargeText('')).toBe(false);
  });

  it('returns false for exactly 2000 characters on many lines', () => {
    const text = ('a'.repeat(124) + '\n').repeat(16);
    expect(isLargeText(text)).toBe(false);
  });

  it('returns false for exactly 15 lines over char threshold', () => {
    const text = ('a'.repeat(150) + '\n').repeat(15);
    expect(isLargeText(text)).toBe(false);
  });
});

describe('getNextSnippetFileName', () => {
  it('returns Pasted.txt when no existing files', () => {
    expect(getNextSnippetFileName([])).toBe('Pasted.txt');
  });

  it('returns Pasted.txt when no existing pasted files', () => {
    expect(getNextSnippetFileName(['image.png', 'doc.pdf'])).toBe('Pasted.txt');
  });

  it('returns Pasted(1).txt when Pasted.txt exists', () => {
    expect(getNextSnippetFileName(['Pasted.txt'])).toBe('Pasted(1).txt');
  });

  it('returns Pasted(2).txt when Pasted.txt and Pasted(1).txt exist', () => {
    expect(getNextSnippetFileName(['Pasted.txt', 'Pasted(1).txt'])).toBe('Pasted(2).txt');
  });

  it('returns Pasted(3).txt when highest index is 2', () => {
    expect(getNextSnippetFileName(['Pasted.txt', 'Pasted(2).txt'])).toBe('Pasted(3).txt');
  });

  it('handles non-sequential indices correctly', () => {
    expect(getNextSnippetFileName(['Pasted(5).txt'])).toBe('Pasted(6).txt');
  });

  it('ignores non-matching filenames', () => {
    expect(getNextSnippetFileName(['Pasted.txt', 'other.txt', 'Pasted(1).txt'])).toBe('Pasted(2).txt');
  });
});

describe('createSnippetFile', () => {
  it('creates a File with text/plain type', () => {
    const file = createSnippetFile('test content', []);
    expect(file.type).toBe('text/plain');
  });

  it('names first file Pasted.txt', () => {
    const file = createSnippetFile('test content', []);
    expect(file.name).toBe('Pasted.txt');
  });

  it('names second file Pasted(1).txt', () => {
    const file = createSnippetFile('test content', ['Pasted.txt']);
    expect(file.name).toBe('Pasted(1).txt');
  });

  it('creates a File with .txt extension', () => {
    const file = createSnippetFile('test content', []);
    expect(file.name.endsWith('.txt')).toBe(true);
  });

  it('preserves the text content in the file', async () => {
    const content = 'Hello\nWorld\nTest';
    const file = createSnippetFile(content, []);
    const text = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(file);
    });
    expect(text).toBe(content);
  });
});

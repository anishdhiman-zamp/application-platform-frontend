import { createSnippetFile, getNextSnippetFileName, isLargeText } from '../snippet';

describe('isLargeText', () => {
  it('returns false for short single-line text', () => {
    expect(isLargeText('Hello world')).toBe(false);
  });

  it('returns false for text with few lines under char threshold', () => {
    expect(isLargeText('line1\nline2\nline3\nline4\nline5')).toBe(false);
  });

  it('returns true when text exceeds line threshold', () => {
    const text = 'line1\nline2\nline3\nline4\nline5\nline6';
    expect(isLargeText(text)).toBe(true);
  });

  it('returns true when text exceeds character threshold', () => {
    const text = 'a'.repeat(501);
    expect(isLargeText(text)).toBe(true);
  });

  it('returns true when both thresholds are exceeded', () => {
    const text = ('a'.repeat(100) + '\n').repeat(6);
    expect(isLargeText(text)).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isLargeText('')).toBe(false);
  });

  it('returns false for exactly 500 characters', () => {
    expect(isLargeText('a'.repeat(500))).toBe(false);
  });

  it('returns false for exactly 5 lines', () => {
    expect(isLargeText('a\nb\nc\nd\ne')).toBe(false);
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
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(file);
    });
    expect(text).toBe(content);
  });
});

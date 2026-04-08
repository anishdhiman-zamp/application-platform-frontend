import { PUA_TO_UNICODE } from 'modules/pace/components/file-viewer/viewers/docx/docx.constants';

function mapPuaChar(ch: string): string {
  return PUA_TO_UNICODE[ch.charCodeAt(0)] ?? ch;
}

export function replacePuaChars(text: string): string {
  return text.replace(/[\uF000-\uF0FF]/g, mapPuaChar);
}

export function fixSymbolFonts(styleContainer: HTMLElement, bodyContainer: HTMLElement) {
  const styleTags = [
    ...Array.from(styleContainer.querySelectorAll('style')),
    ...Array.from(bodyContainer.querySelectorAll('style')),
  ];

  const symbolFontRe = /font-family:\s*['"]?(Symbol|Wingdings|Wingdings\s*2|Wingdings\s*3|Webdings)['"]?/gi;

  for (const style of styleTags) {
    let css = style.textContent ?? '';
    const original = css;

    css = replacePuaChars(css);
    css = css.replace(symbolFontRe, "font-family: 'Arial', sans-serif");

    if (css !== original) {
      style.textContent = css;
    }
  }

  const spans = bodyContainer.querySelectorAll<HTMLSpanElement>('span');

  for (const span of spans) {
    const ff = (span.style.fontFamily || '').replace(/['"]/g, '').toLowerCase().trim();
    const isSymbolFont = ff.startsWith('symbol') || ff.startsWith('wingdings') || ff.startsWith('webdings');

    if (!isSymbolFont) continue;

    if (span.textContent) {
      span.textContent = replacePuaChars(span.textContent);
    }

    span.style.fontFamily = 'Arial, sans-serif';
  }
}

import { readFileSync } from 'fs';
import { join } from 'path';

const readMilkdownEditorCss = () => readFileSync(join(process.cwd(), 'src/styles/milkdown-editor.css'), 'utf8');

describe('milkdown editor styles', () => {
  it('rounds the ProseMirror textbox to 16px', () => {
    const css = readMilkdownEditorCss();

    expect(css).toMatch(/\.milkdown-editor-wrapper \.milkdown \.ProseMirror\s*\{[^}]*border-radius:\s*16px;/);
  });
});

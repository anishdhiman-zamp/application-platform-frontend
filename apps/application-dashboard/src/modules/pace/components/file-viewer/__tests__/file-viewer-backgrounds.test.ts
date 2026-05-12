import { readFileSync } from 'fs';
import { join } from 'path';

const readAppFile = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8');

describe('file viewer backgrounds', () => {
  it('uses a white background for the shared file viewer surface', () => {
    const source = readAppFile('src/modules/pace/components/file-viewer/FileViewerContent.tsx');

    expect(source).toContain("className='bg-BG_WHITE flex h-full w-full items-center justify-center'");
  });

  it('uses a white background for docx preview chrome', () => {
    const css = readAppFile('src/styles/docx-viewer.css');
    const source = readAppFile('src/modules/pace/components/file-viewer/viewers/DocxViewer.tsx');

    expect(css).toMatch(
      /\.docx-viewer-container \.docx-preview-wrapper\s*\{[^}]*background:\s*var\(--BG_WHITE,\s*#fff\)/,
    );
    expect(source).toContain(
      "className='docx-viewer-container bg-BG_WHITE h-full w-full overflow-auto [scrollbar-width:none]'",
    );
  });

  it('uses a white background for full-canvas PDF and image previews', () => {
    const pdfSource = readAppFile('src/modules/pace/components/file-viewer/viewers/PdfViewer.tsx');
    const imageSource = readAppFile('src/modules/pace/components/file-viewer/viewers/ImageViewer.tsx');

    expect(pdfSource).toContain("'pdfSlick bg-BG_WHITE relative h-full w-full'");
    expect(imageSource).toContain("className='bg-BG_WHITE relative flex-1 overflow-auto'");
  });
});

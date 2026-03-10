import dynamic from 'next/dynamic';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';

const DynamicLoader = () => <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;

export const PdfViewer = dynamic(() => import('./viewers/PdfViewer'), {
  ssr: false,
  loading: DynamicLoader,
});

export const MonacoCodeEditor = dynamic(() => import('./viewers/MonacoCodeEditor'), {
  ssr: false,
  loading: DynamicLoader,
});

export const MilkdownEditor = dynamic(() => import('./viewers/MilkdownEditor'), {
  ssr: false,
  loading: DynamicLoader,
});

export const SpreadsheetViewer = dynamic(() => import('./viewers/spreadsheet/SpreadsheetViewer'), {
  ssr: false,
  loading: DynamicLoader,
});

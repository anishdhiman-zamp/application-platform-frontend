import { type FC } from 'react';
import type { PdfArtifactsResponseType } from '@/types/api/processApi.types';

interface PdfArtifactProps {
  pdfArtifact: PdfArtifactsResponseType;
}

const PdfArtifact: FC<PdfArtifactProps> = ({ pdfArtifact }) => {
  console.log(pdfArtifact);

  return <div>PdfArtifact:</div>;
};

export default PdfArtifact;

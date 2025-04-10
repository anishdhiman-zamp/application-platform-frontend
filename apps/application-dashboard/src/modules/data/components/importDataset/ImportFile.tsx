import React, { FC } from 'react';
import FileUploader from 'modules/data/components/importDataset/FileUploader';
import { FILE_SIZE } from 'modules/data/components/importDataset/importData.constants';
import { FILE_MIME, ImportFilePropsType } from 'modules/data/components/importDataset/importData.types';
import { MapAny } from 'types/commonTypes';
import { read, utils } from 'xlsx';
import FileUploaderWrapper from '@/components/file-upload/FileUploaderWrapper';
import { UploadFileResponseType } from '@/types/api/fileUpload.types';

const ImportFile: FC<ImportFilePropsType> = ({
  acceptedFormats,
  fileName,
  setFileName,
  filesSelected,
  className,
  setRawData,
  setFileUploadId,
  keepLoadingFlow,
  isFileUploading,
}) => {
  const handleFileUpload = (file: UploadFileResponseType | null) => {
    if (!file?.rawFile) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return;

      let workbook;
      let sheet: MapAny = [];

      if (file?.rawFile?.type === FILE_MIME.TEXT_CSV) {
        const text = e?.target?.result as string;

        workbook = read(text, { type: 'string' });
      } else {
        const data = new Uint8Array(e.target.result as ArrayBuffer);

        workbook = read(data, { type: 'array' });
      }

      const sheetName = workbook?.SheetNames[0];

      sheet = utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', header: 1 });

      if (sheet?.length === 0) {
        setRawData({ columns: [], rows: [] });

        return;
      }

      const columns = sheet[0].map((col: any) => col?.toLowerCase().trim());

      const rows = sheet
        .slice(1)
        .map((row: MapAny[]) =>
          Object?.fromEntries(columns.map((col: MapAny, index: number) => [col, row[index] || ''])),
        );

      setRawData({ columns, rows });
    };

    if (file?.rawFile?.type === FILE_MIME.TEXT_CSV) {
      reader.readAsText(file?.rawFile);
    } else {
      reader.readAsArrayBuffer(file?.rawFile);
    }
  };

  return (
    <FileUploaderWrapper
      fileName={fileName}
      setFileName={setFileName}
      onFileSelect={handleFileUpload}
      Component={FileUploader}
      acceptedFormats={acceptedFormats}
      maxSize={FILE_SIZE.THREE_HUNDRED_MB}
      filesSelected={filesSelected}
      className={className}
      setRawData={setRawData}
      setFileUploadId={setFileUploadId}
      keepLoadingFlow={keepLoadingFlow}
      isFileUploading={isFileUploading}
    />
  );
};

export default ImportFile;

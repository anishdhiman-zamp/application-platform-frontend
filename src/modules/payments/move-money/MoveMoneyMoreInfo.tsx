import { FC, useEffect, useMemo, useRef, useState } from 'react';
import FileUploader from 'modules/data/components/importDataset/FileUploader';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { UploadFileResponseType } from 'types/api/dataset.types';
import { SIZE_TYPES } from 'types/common/components';
import { INPUT_FILE_FORMATS } from 'types/common/mime';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Textarea from 'components/common/Textarea';
import FileUploaderWrapperV2 from 'components/file-upload/FileUploaderWrapperV2';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface MoneyTransferMoreDetailsStepProps {
  shouldReset: boolean;
}

const MoneyTransferMoreDetailsStep: FC<MoneyTransferMoreDetailsStepProps> = ({ shouldReset }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    dispatch,
    state: { moreDetails, currentStep },
  } = useMoveMoneyContextStore();
  const isActiveStep = useMemo(() => currentStep === 2, [currentStep]);

  const [uploadedFiles, setUploadedFiles] = useState<UploadFileResponseType[]>(moreDetails?.attachments ?? []);
  const [transferNote, setTransferNote] = useState(moreDetails?.note);
  const [externalMemo, setExternalMemo] = useState(moreDetails?.externalMemo);
  const [isFileUploading, setIsFileUploading] = useState(false);

  const onNextClick = async () => {
    dispatch({
      type: moveMoneyContextActions.MORE_DETAILS,
      payload: {
        moreDetails: {
          note: transferNote,
          externalMemo: externalMemo,
          attachments: uploadedFiles,
        },
      },
    });
    dispatch({
      type: moveMoneyContextActions.CURRENT_STEP,
      payload: { currentStep: 3 },
    });
  };

  const onBackClick = () => {
    dispatch({
      type: moveMoneyContextActions.MORE_DETAILS,
      payload: {
        moreDetails: {
          note: transferNote,
          externalMemo: externalMemo,
          attachments: uploadedFiles,
        },
      },
    });
    dispatch({
      type: moveMoneyContextActions.CURRENT_STEP,
      payload: { currentStep: 1 },
    });
  };

  const handleFileUpload = (file: UploadFileResponseType | null) => file && setUploadedFiles((prev) => [...prev, file]);

  const handleRemoveFile = (idx: number) => setUploadedFiles((prev) => prev.filter((_, index) => index !== idx));

  useEffect(() => {
    if (textareaRef.current && isActiveStep)
      textareaRef.current.focus({
        preventScroll: true,
      });
  }, [isActiveStep]);

  useEffect(() => {
    if (shouldReset) {
      setUploadedFiles([]);
      setTransferNote('');
      setExternalMemo('');
    }
  }, [shouldReset]);

  return (
    <div className='h-screen overflow-y-scroll'>
      <div className='pt-34 max-w-75 m-auto pb-20'>
        <div className='f-22-550 mb-5'>Additional Details</div>
        <div className='mt-5'>
          <div className='text-GRAY_900 f-12-500 mb-2'>External memo</div>
          <Textarea
            id='SELF_TRANSFER_EXTERNAL_MEMO_TEXTAREA'
            name='text'
            textAreaRef={textareaRef}
            value={externalMemo}
            placeHolder='Add external memo'
            tabIndex={isActiveStep ? 0 : -1}
            className=' f-12-300'
            onChange={({ target }) => setExternalMemo(target.value)}
          />
        </div>
        <div className='text-GRAY_900 f-12-500 mb-2 mt-4'>Attachments</div>
        <FileUploaderWrapperV2
          className='min-h-[100px]'
          Component={FileUploader}
          showUploadButton={false}
          tabIndex={isActiveStep ? 0 : -1}
          footer='Click to upload or drag & drop here'
          onFilesSelect={handleFileUpload}
          disableNext={(value: boolean) => setIsFileUploading(value)}
          acceptedFormats={`${INPUT_FILE_FORMATS.PNG}, ${INPUT_FILE_FORMATS.JPEG}, ${INPUT_FILE_FORMATS.JPG}, ${INPUT_FILE_FORMATS.PDF}, ${INPUT_FILE_FORMATS.BMP}`}
        />
        {uploadedFiles.length > 0 && (
          <div className='-z-10 -mt-px  border border-BORDER_7 divide-y divide-BORDER_7'>
            {uploadedFiles.map((file, idx) => (
              <div
                key={file?.fileName + idx}
                style={{ zIndex: idx * -1 }}
                className='relative animate-file-upload bg-white overflow-hidden flex justify-between items-center px-3 py-4'
              >
                <div className='whitespace-nowrap w-full overflow-hidden text-ellipsis pr-4'>{file?.fileName}</div>
                <SvgSpriteLoader
                  id='x-close'
                  className='cursor-pointer'
                  onClick={() => handleRemoveFile(idx)}
                  width={20}
                  height={20}
                />
              </div>
            ))}
          </div>
        )}
        <div className='text-GRAY_700 f-11-450 mt-1'>Only visible to members of your organization</div>
        <div className='mt-5'>
          <div className='text-GRAY_900 f-12-500 mb-2'>Notes</div>
          <Textarea
            id='SELF_TRANSFER_NOTE_TEXTAREA'
            name='text'
            tabIndex={isActiveStep ? 0 : -1}
            value={transferNote}
            placeHolder='Add any notes for future reference...'
            className='f-12-300'
            onChange={({ target }) => setTransferNote(target.value)}
          />
          <div className='text-GRAY_700 f-11-450 mt-1'>Only visible to members of your organization</div>
        </div>
        <div className='flex gap-3 mt-10'>
          <Button
            type={BUTTON_TYPES.SECONDARY}
            size={SIZE_TYPES.MEDIUM}
            id='SELF_TRANSFER_AMOUNT_DETAILS_BACK'
            onClick={onBackClick}
          >
            Back
          </Button>
          <Button
            size={SIZE_TYPES.MEDIUM}
            id='SELF_TRANSFER_AMOUNT_DETAILS_NEXT'
            onClick={onNextClick}
            isLoading={isFileUploading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MoneyTransferMoreDetailsStep;

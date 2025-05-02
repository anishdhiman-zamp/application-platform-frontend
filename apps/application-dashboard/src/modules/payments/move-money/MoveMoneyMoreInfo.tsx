import { FC, useEffect, useMemo, useRef, useState } from 'react';
import FileUploader from 'modules/data/components/importDataset/FileUploader';
import { moveMoneyContextActions, useMoveMoneyContextStore } from 'modules/payments/move-money/moveMoney.context';
import { MOVE_MONEY_ATTACHMENTS_FILE_FORMATS } from 'modules/payments/payments.constant';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import FileUploaderWrapper from '@/components/file-upload/FileUploaderWrapper';
import { UploadFileResponseType } from '@/types/api/fileUpload.types';
import { Button } from 'components/common/button/Button';
import Textarea from 'components/common/Textarea';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface MoneyTransferMoreDetailsStepProps {
  handleStepChange: (step: number) => void;
}

const MoneyTransferMoreDetailsStep: FC<MoneyTransferMoreDetailsStepProps> = ({ handleStepChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    dispatch,
    state: { moreDetails, currentStep, reset },
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
    handleStepChange(currentStep + 1);
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
    handleStepChange(currentStep - 1);
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
    if (reset) {
      setUploadedFiles([]);
      setTransferNote('');
      setExternalMemo('');
    }
  }, [reset]);

  return (
    <div className='h-screen overflow-y-scroll'>
      <div className='pt-20 max-w-75 m-auto pb-20'>
        <div className='f-22-550 mb-5'>Additional Details</div>
        <div className='mt-5'>
          <div className='text-GRAY_900 f-12-500 mb-2'>External Memo (Optional)</div>
          <Textarea
            id='SELF_TRANSFER_EXTERNAL_MEMO_TEXTAREA'
            name='text'
            placeHolder=''
            textAreaRef={textareaRef}
            value={externalMemo}
            tabIndex={isActiveStep ? 0 : -1}
            className=' f-12-300'
            onChange={({ target }) => setExternalMemo(target.value)}
          />
        </div>
        <div className='text-GRAY_900 f-12-500 mb-2 mt-4'>Attachments (Optional)</div>
        <FileUploaderWrapper
          className='min-h-[100px] px-6'
          Component={FileUploader}
          showUploadButton={false}
          tabIndex={isActiveStep ? 0 : -1}
          footer='Click to upload or drag & drop here'
          onFileSelect={handleFileUpload}
          disableNext={(value: boolean) => setIsFileUploading(value)}
          acceptedFormats={MOVE_MONEY_ATTACHMENTS_FILE_FORMATS.join(', ')}
          uploadPath={API_ENDPOINTS.FORMS_SIGNED_UPLOAD_URL_POST}
        />
        {uploadedFiles?.length > 0 && (
          <div className='flex flex-col gap-2 my-2.5'>
            {uploadedFiles.map((file, idx) => (
              <div
                key={file?.fileName + idx}
                style={{ zIndex: 100 - idx }}
                className='border border-GRAY_400 rounded-md relative animate-file-upload overflow-hidden flex justify-between gap-1.5 items-center p-2'
              >
                <SvgSpriteLoader id='file-05' onClick={() => handleRemoveFile(idx)} size={14} />
                <div className='whitespace-nowrap w-full overflow-hidden text-ellipsis f-14-400'>{file?.fileName}</div>
                <SvgSpriteLoader
                  id='x-close'
                  className='cursor-pointer'
                  onClick={() => handleRemoveFile(idx)}
                  size={14}
                />
              </div>
            ))}
          </div>
        )}
        <div className='text-GRAY_700 f-11-450 mt-1'>Only visible to members of your organization</div>
        <div className='mt-5'>
          <div className='text-GRAY_900 f-12-500 mb-2'>Notes (Optional)</div>
          <Textarea
            id='SINGLE_TRANSFER_NOTE_TEXTAREA'
            name='text'
            tabIndex={isActiveStep ? 0 : -1}
            value={transferNote}
            placeHolder=''
            className='f-12-300'
            onChange={({ target }) => setTransferNote(target.value)}
          />
          <div className='text-GRAY_700 f-11-450 mt-1'>Only visible to members of your organization</div>
        </div>
        <div className='flex gap-3 mt-10'>
          <Button
            type={BUTTON_TYPES.SECONDARY}
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_MORE_INFO_BACK'
            onClick={onBackClick}
          >
            Back
          </Button>
          <Button
            size={SIZE_TYPES.MEDIUM}
            id='MOVE_MONEY_MORE_INFO_NEXT'
            onClick={onNextClick}
            disabled={isFileUploading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MoneyTransferMoreDetailsStep;

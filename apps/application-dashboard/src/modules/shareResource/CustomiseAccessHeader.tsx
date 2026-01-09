import { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import Image from 'next/image';
import { Label } from '@/components/common/Label';
import { HAND_ICON } from '@/constants/icons';
import { defaultFnType } from '@/types/commonTypes';

type CustomiseAccessHeaderProps = {
  onCancel?: defaultFnType;
  onSave?: defaultFnType;
  datasetTitle: string;
  isSaving?: boolean;
};

const CustomiseAccessHeader: FC<CustomiseAccessHeaderProps> = ({
  onCancel,
  onSave,
  datasetTitle,
  isSaving = false,
}) => {
  return (
    <>
      <div className='border-GRAY_400 m-2 flex justify-between rounded-lg border bg-white p-4'>
        <Label
          title={
            <div className='flex items-center gap-1.5'>
              <Image src={HAND_ICON} alt='hand' width={14} height={15} className='min-w-[14px]' />
              <span className='f-16-600 text-gray-950'>Customise access</span>
            </div>
          }
          description='Filter through the dataset to select the data people can access'
          titleClassName=''
          descriptionClassName='f-13-400 text-gray-700 ml-5'
        />
        <div className='flex gap-4'>
          {onCancel && (
            <Button testId='cancel-customise-access-btn' variant='outline' size='small' onClick={onCancel}>
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              testId='save-customise-access-btn'
              size='small'
              leadingIcon={<SvgSpriteLoader id='check' width={14} height={14} />}
              onClick={onSave}
              isLoading={isSaving}
            >
              Save
            </Button>
          )}
        </div>
      </div>
      <h2 className='f-13-500 text-gray-1000 px-5 py-4'>{datasetTitle}</h2>
    </>
  );
};

export default CustomiseAccessHeader;

import { FC } from 'react';
import Image from 'next/image';
import { Button } from '@/components/common/button/Button';
import { Label } from '@/components/common/Label';
import { HAND_ICON } from '@/constants/icons';
import { SIZE_TYPES } from '@/types/common/components';
import { defaultFnType } from '@/types/commonTypes';
import { BUTTON_TYPES, ICON_POSITION_TYPES } from '@/types/components/button.type';

type CustomiseAccessHeaderProps = {
  onCancel: defaultFnType;
  onSave: defaultFnType;
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
      <div className='p-4 border border-GRAY_400 rounded-lg flex justify-between m-2 bg-white'>
        <Label
          title={
            <div className='flex gap-1.5 items-center'>
              <Image src={HAND_ICON} alt='hand' width={14} height={15} className='min-w-[14px]' />
              <span className='f-16-600 text-gray-950'>Customise access</span>
            </div>
          }
          description='Filter through the dataset to select the data people can access'
          titleClassName=''
          descriptionClassName='f-13-400 text-gray-700 ml-5'
        />
        <div className='flex gap-4'>
          <Button
            id='cancel-customise-access-btn'
            type={BUTTON_TYPES.SECONDARY}
            size={SIZE_TYPES.SMALL}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            id='save-customise-access-btn'
            type={BUTTON_TYPES.PRIMARY}
            size={SIZE_TYPES.SMALL}
            iconPosition={ICON_POSITION_TYPES.LEFT}
            iconProps={{ id: 'check', size: 14 }}
            onClick={onSave}
            isLoading={isSaving}
          >
            Save
          </Button>
        </div>
      </div>
      <h2 className='f-13-500 text-gray-1000 px-5 py-4'>{datasetTitle}</h2>
    </>
  );
};

export default CustomiseAccessHeader;

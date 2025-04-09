import { AdminDeleteDatasetDetailsType } from 'modules/admin/admin.types';
import { SIZE_TYPES } from 'types/common/components';
import { defaultFnType } from 'types/commonTypes';
import { BUTTON_TYPES } from 'types/components/button.type';
import { Button } from 'components/common/button/Button';
import Popup from 'components/common/popup/Popup';

type AdminDatasetDeleteProps = {
  isOpen: boolean;
  onClose: defaultFnType;
  datasetDetails: AdminDeleteDatasetDetailsType;
};

const AdminDatasetDelete = ({ isOpen, onClose, datasetDetails }: AdminDatasetDeleteProps) => {
  const handleApplyChanges = () => {
    onClose();
  };

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title='Delete Dataset ?'
      iconId='x-close'
      className='w-[344px] border-2 border-GRAY_400 rounded-3.5 bg-white !p-0 shadow-menuList'
      titleClassName='f-16-600 text-GRAY_950'
      showIcon
      closeOnClickOutside={false}
    >
      <div className='f-13-400 text-GRAY_900 px-5 py-6'>
        Are you sure you want to delete <span className='f-13-700'>{datasetDetails?.datasetName}</span>? This action
        cannot be undone.
      </div>
      <div className='flex justify-end gap-2 px-5 py-4 border-t border-GRAY_400'>
        <Button
          type={BUTTON_TYPES.SECONDARY}
          size={SIZE_TYPES.MEDIUM}
          id='admin-dataset-delete-cancel'
          onClick={onClose}
        >
          Discard
        </Button>
        <Button
          type={BUTTON_TYPES.PRIMARY}
          size={SIZE_TYPES.MEDIUM}
          id='admin-dataset-delete-confirm'
          onClick={handleApplyChanges}
        >
          Confirm
        </Button>
      </div>
    </Popup>
  );
};

export default AdminDatasetDelete;

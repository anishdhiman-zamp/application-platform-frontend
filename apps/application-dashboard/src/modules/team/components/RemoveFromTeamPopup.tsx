import { FC } from 'react';
import { ConfirmationDialog } from '@zamp-platform/ui';
import { RemoveFromTeamPopupPropsType } from 'modules/team/people.types';

const RemoveFromTeamPopup: FC<RemoveFromTeamPopupPropsType> = ({
  isOpen,
  onClose,
  onDelete,
  isLoading,
  warningDescription,
}) => {
  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose?.()}
      title='Remove from team'
      description={warningDescription}
      confirmLabel='Delete'
      onConfirm={() => onDelete?.()}
      isLoading={isLoading}
      contentClassName='z-1004'
      overlayClassName='z-1004'
    />
  );
};

export default RemoveFromTeamPopup;

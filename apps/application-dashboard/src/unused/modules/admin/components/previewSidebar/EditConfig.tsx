import React, { ChangeEvent } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from 'constants/colors';
import { cn } from 'utils/common';
import Input from 'components/common/input';

const EditConfig = ({ isEditing, onClick }: { isEditing: boolean; onClick: () => void }) => {
  return (
    <div onClick={onClick}>
      <span className='bg-GRAY_100 hover:bg-GRAY_200 flex h-fit w-fit cursor-pointer rounded-md p-2'>
        <SvgSpriteLoader id={isEditing ? 'check' : 'pencil-02'} height={14} width={14} color={COLORS.TEXT_PRIMARY} />
      </span>
    </div>
  );
};

const EditableConfigField = ({
  value,
  isEditing,
  onEditToggle,
  onChange,
  firstColumn,
}: {
  value: string | number;
  isEditing: boolean;
  onEditToggle?: () => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  firstColumn?: boolean;
}) => {
  const handleEditToggle = () => {
    if (onEditToggle) {
      onEditToggle();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div
      className={cn(firstColumn && 'border-l', 'border-GRAY_400 flex items-center gap-2 overflow-hidden border-r p-2')}
    >
      {onEditToggle && onChange && <EditConfig isEditing={isEditing} onClick={handleEditToggle} />}
      {isEditing ? (
        <Input type='text' value={value} onChange={handleChange} />
      ) : (
        <span className='text-wrap break-words'>{value}</span>
      )}
    </div>
  );
};

export default EditableConfigField;

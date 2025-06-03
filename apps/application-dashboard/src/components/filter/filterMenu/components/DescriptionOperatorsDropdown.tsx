import { FC, useRef, useState } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { COLORS } from 'constants/colors';
import { useOnClickOutside } from 'hooks';
import { OptionsType } from 'types/common/components/dropdown/dropdown.types';
import { MapAny } from 'types/commonTypes';
import { CONDITION_OPERATOR_TYPE, DESCRIPTION_OPERATORS } from 'components/filter/filters.constants';

interface DescriptionOperatorsDropdownProps {
  operator?: MapAny;
  updateOperator: (operator: MapAny) => void;
  isLoading?: boolean;
  label?: string;
  operatorOptions?: OptionsType[];
  isDisabled?: boolean;
}

const DescriptionOperatorsDropdown: FC<DescriptionOperatorsDropdownProps> = ({
  operator,
  updateOperator,
  isLoading,
  label = 'Description',
  operatorOptions = DESCRIPTION_OPERATORS,
  isDisabled = false,
}) => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (operator: MapAny) => {
    if (isLoading) return;

    setIsOpen(false);
    updateOperator(operator);
  };

  const onToggleDropdown = () => {
    if (isLoading || isDisabled) return;

    setIsOpen(!isOpen);
  };

  useOnClickOutside(ref, () => setIsOpen(false));

  return (
    <div className='flex items-center'>
      <div className='text-GRAY_700 f-11-400 mr-1'>{label} </div>
      <div className=''>
        <div className='relative flex cursor-pointer items-center' onClick={onToggleDropdown}>
          <div className='text-BLUE_700 f-11-500 mr-1'>{operator?.label ?? CONDITION_OPERATOR_TYPE.ARRAY_CONTAINS}</div>
          <SvgSpriteLoader id='chevron-down' width={12} height={12} color={COLORS.GRAY_700} />
          {isOpen && (
            <div
              ref={ref}
              className='text-GRAY_900 border-GRAY_400 shadow-table-filter-menu absolute left-0 top-full z-10 min-w-[120px] rounded-md border bg-white p-1'
            >
              {operatorOptions.map((option) => (
                <div
                  className='hover:bg-GRAY_100 f-12-500 rounded-md px-2.5 py-2'
                  key={option.value}
                  onClick={() => onSelect(option)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DescriptionOperatorsDropdown;

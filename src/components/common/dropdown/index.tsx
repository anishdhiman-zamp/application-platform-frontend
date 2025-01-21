import React, { Children, FC, useRef } from 'react';
import {
  ActionMeta,
  components,
  MenuListProps,
  MultiValue,
  MultiValueProps,
  OptionProps,
  SingleValue,
  SingleValueProps,
  ValueContainerProps,
} from 'react-select';
import { COLORS } from 'constants/colors';
import { SIZE_TYPES } from 'types/common/components';
import { DropdownProps, OptionsType } from 'types/common/components/dropdown/dropdown.types';
import { defaultFn, MapAny } from 'types/commonTypes';
import CustomReactSelect from 'components/common/dropdown/CustomReactSelect';
import { ACTIONS, DROPDOWN_SIZE_STYLES, SELECT_ALL_OPTION } from 'components/common/dropdown/dropdown.constants';
import MenuSingleValue from 'components/common/dropdown/MenuSingleValue';
import { ResetSection } from 'components/common/dropdown/ResetSection';
import ValueContainerContent from 'components/common/dropdown/ValueContainerContent';
import { Label } from 'components/common/Label';
import { MenuOption } from 'components/common/MenuOption';
import { SupporterInfo } from 'components/common/SupporterInfo';

export const Dropdown: FC<DropdownProps> = ({
  options = [],
  onChange,
  showLabel = false,
  wrapperClass = 'tw-w-full',
  labelProps = {},
  selectFieldWrapperClass = 'tw-w-full tw-my-3',
  error = false,
  errorColor = COLORS.RED_SECONDARY,
  placeholder = '',
  noOptionsText = 'No options found',
  customStyles,
  customClassNames,
  isMulti = false,
  autoFocus = false,
  menuOptionClasses = {
    wrapperClass: 'tw-flex tw-items-center tw-cursor-pointer',
    containerClass: 'hover:tw-bg-BASE_SECONDARY',
    labelOverrideClassName: '',
  },
  spriteSelectedIcon,
  selectedIcon,
  isSearchable = true,
  defaultMenuIsOpen = false,
  spriteSelectedIconColor = COLORS.GREEN_SECONDARY,
  showSupporterInfo = false,
  supporterInfoProps = {},
  defaultValue = null,
  handleInputChange = defaultFn,
  handleKeyDown = defaultFn,
  onFocus = defaultFn,
  controlled = false,
  value,
  enableSelectAll = false,
  showCountOfSelected = false,
  countSelectedSuffix = '',
  disabled = false,
  readOnly = false,
  id,
  eventCallback = () => 0,
  showValueInControl = false,
  showLabelInControl = false,
  controlColor = {
    focused: COLORS.DIVIDER_SAIL_2,
    background: COLORS.WHITE,
    overrideBackgroundColor: '',
  },
  tooltipBodyClassName = '',
  enableReset = false,
  resetProps = {
    resetClassName: '',
    resetTextClassName: '',
    resetText: 'Reset filters',
  },
  onReset,
  size = SIZE_TYPES.MEDIUM,
  menuPortalTarget,
  customClass,
}) => {
  const valueRef = useRef(value);

  valueRef.current = value;

  const handleChange = (
    selected: MultiValue<OptionsType> | SingleValue<OptionsType>,
    actionMeta: ActionMeta<OptionsType>,
  ) => {
    const { action, option, removedValue } = actionMeta;

    let updatedValue: OptionsType | MultiValue<OptionsType> = [];

    if (action === ACTIONS.SELECT_OPTION && option?.value === SELECT_ALL_OPTION.value) {
      updatedValue = options;
    } else if (
      (action === ACTIONS.DESELECT_OPTION && option?.value === SELECT_ALL_OPTION.value) ||
      ((action === ACTIONS.REMOVE_VALUE || action === ACTIONS.POP_VALUE) &&
        removedValue?.value === SELECT_ALL_OPTION.value)
    ) {
      updatedValue = [];
    } else if (action === ACTIONS.DESELECT_OPTION && isSelectAllSelected()) {
      updatedValue = options.filter(({ value }) => value !== option?.value);
    } else {
      updatedValue = selected || [];
    }

    onChange?.(updatedValue);

    eventCallback?.('DROPDOWN_CHANGE', {
      id,
      selectedValue: Array.isArray(updatedValue)
        ? updatedValue.map((each) => each.value)
        : JSON.stringify((updatedValue as MapAny)?.value),
    });
  };

  const onClickReset = () => {
    handleChange([], { action: 'clear', removedValues: [] });
    onReset?.();
  };

  const MultiValue = (props: MultiValueProps<OptionsType>) => {
    const { index, getValue } = props;
    const value = getValue();
    const selectAll = value?.[0]?.value === SELECT_ALL_OPTION.value;

    return index === 0 ? (
      <div className='f-16-300'>{`${selectAll ? options.length : value.length} ${countSelectedSuffix}`}</div>
    ) : (
      <div />
    );
  };

  const ValueContainer = (props: ValueContainerProps<OptionsType>) => {
    const { children, getValue } = props;
    const value = getValue();

    return (
      <>
        <ValueContainerContent
          labelProps={labelProps}
          value={value as { value: string; label: string }[]}
          showCountOfSelected={showCountOfSelected}
          tooltipBodyClassName={tooltipBodyClassName}
        />
        {Children.toArray(children)[Children.count(children) - 1]}
      </>
    );
  };

  const CustomSingleValue = (props: SingleValueProps<OptionsType>) => {
    const { data } = props;
    const { spriteIcon = '', icon = null, label = '', value = '' } = data;

    return (
      <components.SingleValue {...props}>
        <MenuSingleValue
          {...props}
          spriteIcon={spriteIcon}
          icon={icon}
          label={typeof label === 'string' ? label : undefined}
          value={value}
          size={size}
          showValueInControl={showValueInControl}
          customClassNames={customClassNames}
        />
      </components.SingleValue>
    );
  };

  const CustomOption = (props: OptionProps<OptionsType>) => {
    const selectAllWrapperClass = `tw-p-2 tw-h-16 tw-flex tw-items-center tw-border-b tw-border-DIVIDER_GRAY`;
    const { data, isSelected } = props;

    return (
      <components.Option {...props}>
        <MenuOption
          {...props}
          isMulti={isMulti}
          contentWrapper={`${DROPDOWN_SIZE_STYLES[size].menuOptionClasses.contentWrapper} ${menuOptionClasses.contentWrapper}`}
          wrapperClass={`${data?.value === SELECT_ALL_OPTION.value ? selectAllWrapperClass : ''} ${
            DROPDOWN_SIZE_STYLES[size].menuOptionClasses.wrapperClass
          } ${menuOptionClasses.wrapperClass}`}
          containerClass={`${DROPDOWN_SIZE_STYLES[size].menuOptionClasses.wrapperClass} ${
            menuOptionClasses.containerClass
          } ${isSelected && 'hover:tw-bg-transparent'}`}
          selectedIcon={selectedIcon}
          spriteSelectedIcon={spriteSelectedIcon}
          spriteSelectedIconColor={spriteSelectedIconColor}
          eventCallback={eventCallback}
          labelOverrideClassName={`${DROPDOWN_SIZE_STYLES[size].menuOptionClasses.labelOverrideClassName} ${menuOptionClasses.labelOverrideClassName}`}
        />
      </components.Option>
    );
  };

  const MenuList = (props: MenuListProps<OptionsType>) => {
    return (
      <>
        <components.MenuList {...props} />
        <ResetSection resetProps={resetProps} onClickReset={onClickReset} />
      </>
    );
  };

  const addSelectAllInOptions = (): OptionsType[] => [SELECT_ALL_OPTION, ...options];

  const isSelectAllSelected = () => Array.isArray(valueRef?.current) && valueRef?.current?.length === options.length;

  const getValue: () => OptionsType[] = () =>
    enableSelectAll && isSelectAllSelected() ? [SELECT_ALL_OPTION] : Array.isArray(value) ? value : [];

  const isOptionSelected = (option: OptionsType) =>
    (Array.isArray(valueRef?.current) && valueRef?.current?.some(({ value }) => value === option.value)) ||
    isSelectAllSelected();

  return (
    <div className={wrapperClass}>
      {showLabel && <Label {...labelProps} />}
      <div
        data-testid={`dropdown-wrapper-${id}`}
        className={`${selectFieldWrapperClass} ${disabled ? 'tw-cursor-not-allowed' : ''} ${
          readOnly ? 'tw-pointer-events-none' : ''
        }`}
      >
        <CustomReactSelect
          enableSelectAll={enableSelectAll}
          options={options}
          defaultValue={defaultValue}
          isMulti={isMulti}
          defaultMenuIsOpen={defaultMenuIsOpen}
          placeholder={placeholder}
          autoFocus={autoFocus}
          noOptionsText={noOptionsText}
          CustomOption={CustomOption}
          CustomSingleValue={CustomSingleValue}
          enableReset={enableReset}
          MenuList={MenuList}
          showLabelInControl={showLabelInControl}
          ValueContainer={ValueContainer}
          showCountOfSelected={showCountOfSelected}
          customStyles={customStyles}
          size={size}
          controlColor={controlColor}
          menuPortalTarget={menuPortalTarget}
          id={id}
          controlled={controlled}
          onFocus={onFocus}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          handleInputChange={handleInputChange}
          isOptionSelected={isOptionSelected}
          isSearchable={isSearchable}
          disabled={disabled}
          readOnly={readOnly}
          customClassNames={customClassNames}
          error={error}
          errorColor={errorColor}
          addSelectAllInOptions={addSelectAllInOptions}
          getValue={getValue}
          MultiValue={MultiValue}
          eventCallback={eventCallback}
          customClass={customClass}
        />
      </div>
      {showSupporterInfo && <SupporterInfo {...supporterInfoProps} />}
    </div>
  );
};

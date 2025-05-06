import { Dispatch, FC, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { useOnClickOutside } from 'hooks';
import { DisplayConfigToggleType } from 'modules/widgets/displayConfig/displayConfig.types';
import { getToggleConfigFromLocalStorage } from 'modules/widgets/displayConfig/displayConfig.utils';
import { defaultFnType, MapAny } from 'types/commonTypes';
import { cn } from 'utils/common';
import ToggleSwitch from '@/components/common/toggleSwitch';
import { DATE_RANGE_TYPES } from '@/constants/date.constants';
import { LOCAL_STORAGE_KEYS } from '@/utils/localstorage';
import SvgSpriteLoader from 'components/SvgSpriteLoader';

interface PivotConfigDropdownProps {
  handleExportAgGridData?: defaultFnType;
  displayConfigToggleData?: {
    default: boolean;
    toggle_field: string;
    toggle_title: string;
  }[];
  currentSheetId?: string;
  currentWidgetInstanceId?: string;
  setToggleUpdateSignal?: Dispatch<SetStateAction<number>>;
  colIdsToHideForDisplayOptions?: MapAny;
}

const PivotConfigDropdown: FC<PivotConfigDropdownProps> = ({
  handleExportAgGridData,
  displayConfigToggleData,
  currentSheetId = '',
  setToggleUpdateSignal,
  colIdsToHideForDisplayOptions,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showDisplayConfig, setShowDisplayConfig] = useState(false);
  const storageKey = LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID;
  const storedData = JSON.parse(localStorage.getItem(storageKey) || '{}');
  const widgetData = storedData[currentSheetId ?? ''] || {};

  const isToggleOptionDisabled = (toggleField: string) => {
    const checkIfPeriodicityDaily = widgetData?.filters?.time_stamp_local?.periodicity === DATE_RANGE_TYPES.DAY;
    const hasHideWeekendKey = Object.keys(colIdsToHideForDisplayOptions ?? {}).includes(
      DisplayConfigToggleType.HIDE_WEEKENDS,
    );

    return toggleField === DisplayConfigToggleType.HIDE_WEEKENDS && !checkIfPeriodicityDaily && hasHideWeekendKey;
  };

  const disabledToggleFields = useMemo(() => {
    return displayConfigToggleData?.reduce(
      (acc, item) => {
        const field = item?.toggle_field;

        acc[field] = isToggleOptionDisabled(field);

        return acc;
      },
      {} as Record<string, boolean>,
    );
  }, [displayConfigToggleData, isToggleOptionDisabled]);

  const getUpdatedToggles = (
    existingToggles: { toggle_field: string; default: boolean }[],
    toggleField: string,
    defaultValue: boolean,
  ) => {
    const exists = existingToggles?.find((option: { toggle_field: string }) => option?.toggle_field === toggleField);

    if (exists) {
      return existingToggles?.map((option: { toggle_field: string }) =>
        option?.toggle_field === toggleField ? { ...option, default: defaultValue } : option,
      );
    } else {
      return [...existingToggles, { toggle_field: toggleField, default: defaultValue }];
    }
  };

  const updateDisplayConfigToggle = ({
    toggleField,
    defaultValue,
    currentSheetId,
  }: {
    toggleField: string;
    defaultValue: boolean;
    currentSheetId: string;
  }) => {
    const storageKey = LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID;
    const storedData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const widgetData = storedData[currentSheetId] || {};
    const existingToggles = widgetData?.display_config?.toggle || [];

    const updatedToggles = getUpdatedToggles(existingToggles, toggleField, defaultValue);
    const updatedWidgetData = {
      ...widgetData,
      display_config: {
        ...widgetData?.display_config,
        toggle: updatedToggles,
      },
    };

    const updatedStoredData = {
      ...storedData,
      [currentSheetId]: updatedWidgetData,
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedStoredData));
  };

  const handleToggleConfigOptions = (
    currentSheetId?: string | null,
    toggleField?: string,
    setToggleUpdateSignal?: Dispatch<SetStateAction<number>>,
  ) => {
    setToggleUpdateSignal?.((prev) => prev + 1);

    const currentValue =
      getToggleConfigFromLocalStorage(currentSheetId ?? '')?.find(
        (option: { toggle_field: string }) => option?.toggle_field === toggleField,
      )?.default ?? false;

    updateDisplayConfigToggle({
      toggleField: toggleField ?? '',
      defaultValue: !currentValue,
      currentSheetId: currentSheetId ?? '',
    });
  };

  const handleGetCheckedValue = (toggleField: string) =>
    getToggleConfigFromLocalStorage(currentSheetId ?? '')?.find(
      (option: { toggle_field: string }) => option?.toggle_field === toggleField,
    )?.default ?? false;

  useEffect(() => {
    const checkDisplayConfigForWeekends = widgetData?.display_config?.toggle;
    const checkIfPeriodicityDaily = widgetData?.filters?.time_stamp_local?.periodicity === DATE_RANGE_TYPES.DAY;

    if (!checkDisplayConfigForWeekends || checkIfPeriodicityDaily) return;

    const updatedToggles = checkDisplayConfigForWeekends.map((toggle: { toggle_field: string; default: boolean }) => {
      if (toggle?.toggle_field === DisplayConfigToggleType.HIDE_WEEKENDS && toggle.default === true) {
        return { ...toggle, default: false };
      }

      return toggle;
    });

    const updatedWidgetData = {
      ...widgetData,
      display_config: {
        ...widgetData.display_config,
        toggle: updatedToggles,
      },
    };

    const storageKey = LOCAL_STORAGE_KEYS.WIDGET_INSTANCE_ID;
    const storedData = JSON.parse(localStorage.getItem(storageKey) || '{}');

    const updatedStoredData = {
      ...storedData,
      [currentSheetId ?? '']: updatedWidgetData,
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedStoredData));
  }, [widgetData, currentSheetId]);

  useOnClickOutside(ref, () => setShowDisplayConfig(false));

  return (
    <>
      <div
        className='h-[38px] px-[2px] py-1.5 flex items-center rounded-full border border-GRAY_200 absolute w-fit top-[29px] -left-[11px] cursor-pointer z-1000 overflow-hidden bg-[#fafafa] opacity-0 group-hover:opacity-100 transition-opacity duration-200'
        onClick={() => setShowDisplayConfig(!showDisplayConfig)}
      >
        <SvgSpriteLoader id='dots-vertical' width={16} height={16} iconCategory={ICON_SPRITE_TYPES.GENERAL} />
      </div>
      {showDisplayConfig && (
        <div
          className={cn(
            'absolute z-10 top-[72px] -left-2.5 bg-white flex flex-col  p-1 border border-GRAY_400 rounded-md shadow-tableFilterMenu max-h-[330px] min-w-[200px] ',
          )}
          ref={ref}
        >
          {!!displayConfigToggleData && displayConfigToggleData?.length > 0 && (
            <>
              <span className='f-11-500 gap-2.5 pt-2 pb-1.5 px-2.5 text-GRAY_600'>Display</span>
              {displayConfigToggleData?.map((item, index) => {
                const disabledToggle = disabledToggleFields?.[item?.toggle_field];

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center justify-between gap-2.5 py-2 px-2.5 rounded cursor-pointer hover:bg-GRAY_100',
                      disabledToggle && 'opacity-50 cursor-not-allowed',
                    )}
                    onClick={() => {
                      if (!disabledToggle) {
                        handleToggleConfigOptions(currentSheetId, item?.toggle_field, setToggleUpdateSignal);
                      }
                    }}
                  >
                    <div className='flex items-center gap-3'>
                      <ToggleSwitch
                        wrapperClassName='flex'
                        toggleClassName='relative w-6 h-3.5 rounded-full border-none'
                        sliderClassName='absolute top-[2px] rounded-full w-2.5 h-2.5 transition-all duration-200'
                        id={`toggle-display-config-${item?.toggle_title}`}
                        onChange={() => {}}
                        disabled={disabledToggle}
                        checked={handleGetCheckedValue(item?.toggle_field)}
                      />
                      <span className='f-12-500 text-GRAY_900'>{item?.toggle_title}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          <div className='flex flex-col'>
            <span className='f-11-500 gap-2.5 pt-2 pb-1.5 px-2.5 text-GRAY_600'>Export</span>
            <div className='flex py-2 px-2.5 rounded cursor-pointer hover:bg-GRAY_100' onClick={handleExportAgGridData}>
              <span className='f-12-500 text-GRAY_900'>Export Data</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PivotConfigDropdown;

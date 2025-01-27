import React, { FC } from 'react';
import { useRouter } from 'next/router';
import { MenuItem, SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { LOCAL_STORAGE_KEYS, setToLocalStorage } from 'utils/localstorage';
import { Button } from 'components/common/button/Button';

interface SheetsTabsProps {
  tabs: MenuItem[];
  currentSheetId: string;
}

const SheetsTabs: FC<SheetsTabsProps> = ({ tabs, currentSheetId }) => {
  const router = useRouter();
  const { id } = router.query;
  const handleTabSelect = (selected?: MenuItem) => {
    if (!selected?.value) return;
    router.push(`#${selected?.value}`);
    setToLocalStorage(LOCAL_STORAGE_KEYS.DATA_SHEET_ID, JSON.stringify({ [id as string]: selected?.value }));
  };

  return (
    <div className='flex items-center fixed bottom-0 right-0 border-t border-l border-border-GRAY_400 h-[57px] w-[calc(100%-240px)] bg-white shadow-pageBottomBar px-16 gap-3'>
      {tabs?.map((tab) => (
        <Button
          key={tab?.value}
          id='sheets-tabs'
          onClick={() => handleTabSelect(tab)}
          type={BUTTON_TYPES.SECONDARY}
          className='w-fit !rounded-lg !bg-BG_GRAY_2'
          size={SIZE_TYPES.MEDIUM}
        >
          <div className={`transition-all duration-100 ${currentSheetId === tab?.value ? 'f-13-600' : 'f-13-500'}`}>
            {tab?.label}
          </div>
        </Button>
      ))}
    </div>
  );
};

export default SheetsTabs;

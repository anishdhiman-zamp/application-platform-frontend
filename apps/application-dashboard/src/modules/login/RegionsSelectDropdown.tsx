import { type FC, useEffect, useMemo, useState } from 'react';
import { reinitializeApiDomain } from '@zamp-platform/api';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@zamp-platform/utils';
import DropdownToggle from 'modules/payments/move-money/components/DropdownToggle';
import type { MenuItem } from '@/types/common/components';
import type { MapAny } from '@/types/commonTypes';

interface RegionsSelectDropdownProps {
  regions: { region: string; url: string }[];
  defaultRegion: string;
}

const RegionsSelectDropdown: FC<RegionsSelectDropdownProps> = ({ regions, defaultRegion }) => {
  const [selectedRegion, setSelectedRegion] = useState<MapAny>({});
  const [isRegionsSelectDropdownMenuOpen, setIsRegionsSelectDropdownMenuOpen] = useState(false);

  const handleRegionChange = (region: MenuItem) => {
    setSelectedRegion(region);
    setToLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION, JSON.stringify({ region: region?.label, url: region?.value }));
    reinitializeApiDomain(region?.value as string);
  };

  const regionsList = useMemo(() => {
    return regions.map((region) => {
      return {
        label: region.region,
        value: region.url,
      };
    });
  }, [regions]);

  useEffect(() => {
    const selectedRegion = regionsList.find(
      (region) => region?.value === JSON.parse(getFromLocalStorage(LOCAL_STORAGE_KEYS.ORG_REGION)).region,
    );

    if (selectedRegion) {
      setSelectedRegion(selectedRegion);
    }
  }, [regionsList, defaultRegion]);

  if (regionsList.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu onOpenChange={setIsRegionsSelectDropdownMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className='flex h-12 items-center gap-1 !ring-0 !ring-offset-0 select-none focus-visible:outline-hidden'
          size='small'
          variant='outline'
        >
          {selectedRegion?.label}
          <DropdownToggle
            isShowMenu={isRegionsSelectDropdownMenuOpen}
            setIsShowMenu={setIsRegionsSelectDropdownMenuOpen}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='z-100 max-h-[300px] min-w-[70px]! overflow-y-auto' sideOffset={5}>
        {regionsList.map((item: MenuItem) => (
          <DropdownMenuItem
            onClick={() => handleRegionChange(item)}
            key={item?.value}
            className='hover:!bg-GRAY_50 text-GRAY_1000 f-12-500 rounded px-2.5 py-2'
          >
            <div className='f-12-500 flex w-full cursor-pointer items-center gap-1.5'>
              <div>{item?.label}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RegionsSelectDropdown;

import { type FC, useMemo, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import DropdownToggle from '@/components/common/dropdown/DropdownToggle';
import type { MenuItem } from '@/types/common/components';

interface RegionsSelectDropdownProps {
  regions: { region: string; url: string }[];
  selectedRegion: { region: string; url: string };
  setSelectedRegion: (region: { region: string; url: string }) => void;
}

const RegionsSelectDropdown: FC<RegionsSelectDropdownProps> = ({ regions, selectedRegion, setSelectedRegion }) => {
  const [isRegionsSelectDropdownMenuOpen, setIsRegionsSelectDropdownMenuOpen] = useState(false);

  const handleRegionChange = (region: MenuItem) => {
    setSelectedRegion({ region: region?.label, url: region?.value as string });
  };

  const regionsList = useMemo(() => {
    return regions.map((region) => {
      return {
        label: region.region,
        value: region.url,
      };
    });
  }, [regions]);

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
          {selectedRegion?.region?.toUpperCase()}
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
              <div>{item?.label.toUpperCase()}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RegionsSelectDropdown;

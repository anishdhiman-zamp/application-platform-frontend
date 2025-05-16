import { useState } from 'react';
import { Combobox } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ARTIFACT_ICON_MAPPING } from 'modules/process/process.constant';
import { COLORS } from '@/constants/colors';
import { ICON_SPRITE_TYPES } from '@/constants/icons';
import { cn } from '@/utils/common';

type Artifact = {
  id: string;
  display_name: string;
  artifact_type: keyof typeof ARTIFACT_ICON_MAPPING;
};

type ArtifactPillProps = {
  count: number;
  artifacts: Artifact[];
};

const ArtifactPill = ({ count, artifacts }: ArtifactPillProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Combobox
      options={artifacts?.map((artifact) => ({
        value: artifact?.id,
        label: artifact?.display_name,
        icon: <SvgSpriteLoader id={ARTIFACT_ICON_MAPPING[artifact?.artifact_type].id} width={12} height={12} />,
      }))}
      onSelect={(option) => {
        setValue(option.id === value ? '' : (option.id ?? ''));
      }}
      open={open}
      onOpenChange={setOpen}
      searchPlaceholder='Search artifacts'
      emptyText='No artifacts found'
      inputClassName='placeholder:text-GRAY_500 placeholder:f-12-400'
      contentClassName=' w-[300px] h-[334px] rounded-md border-[0.5px] border-GRAY_500 shadow-md'
      itemClassName='f-13-450 text-GRAY_950 hover:bg-GRAY_900 rounded-md'
      overLayContent={<OverlayContent />}
      isPortalNeeded={true}
    >
      <div
        className={cn(
          'flex items-center py-1 px-1.5 gap-1.5 border border-GRAY_400 rounded-[4px] transition-colors hover:bg-GRAY_50 data-[state=open]:bg-GRAY_50 cursor-pointer',
          count === 0 && 'opacity-50 cursor-none',
        )}
      >
        <SvgSpriteLoader
          id='stand'
          iconCategory={ICON_SPRITE_TYPES.EDUCATION}
          width={12}
          height={12}
          color={COLORS.GRAY_900}
        />
        <span className='f-11-400 text-GRAY_1000'>{count}</span>
      </div>
    </Combobox>
  );
};

const OverlayContent = () => {
  return (
    <div className='flex flex-col gap-2 items-start justify-center w-full overflow-hidden text-wrap break-words'>
      <SvgSpriteLoader
        id='stand'
        iconCategory={ICON_SPRITE_TYPES.EDUCATION}
        width={16}
        height={16}
        color={COLORS.GRAY_900}
      />
      <p className='f-11-450 text-GRAY_900'>
        Artifacts simplify working with key content that you may need to edit, expand upon, or refer to in the future.
      </p>
    </div>
  );
};

export default ArtifactPill;

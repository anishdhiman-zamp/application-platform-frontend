import { useMemo, useState } from 'react';
import { Button, Combobox } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ARTIFACT_ICON_MAPPING } from 'modules/process/process.constant';
import { useParams, useRouter } from 'next/navigation';
import { COLORS } from '@/constants/colors';
import { ICON_SPRITE_TYPES } from '@/constants/icons';
import { getProcessActivityLogsRouteById } from '@/constants/routeConfig';
import { cn } from '@/utils/common';

type Artifact = {
  id: string;
  display_name: string;
  artifact_type: keyof typeof ARTIFACT_ICON_MAPPING;
  status: string;
};

type ArtifactPillProps = {
  count: number;
  artifacts: Artifact[];
  status: string;
  activityId: string;
};

const ArtifactPill = ({ count, artifacts, status, activityId }: ArtifactPillProps) => {
  const [open, setOpen] = useState(false);
  const { processId, process } = useParams();
  const router = useRouter();

  const isDisabled = useMemo(() => {
    return count === 0;
  }, [count]);

  const handleSelect = (value: string) => {
    const artifact = artifacts?.find((artifact) => artifact?.id === value);
    const path = getProcessActivityLogsRouteById(processId as string, process as string, activityId);

    router.push(`${path}?status=${status}&artifactId=${artifact?.id}&artifactType=${artifact?.artifact_type}`);
  };

  return (
    <Combobox
      options={artifacts?.map((artifact) => ({
        value: artifact?.id,
        label: artifact?.display_name,
        icon: <SvgSpriteLoader id={ARTIFACT_ICON_MAPPING[artifact?.artifact_type].id} size={12} />,
      }))}
      onSelect={(option) => {
        handleSelect(option?.value as string);
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
      triggerClassName='combobox-trigger'
    >
      <Button
        className={cn(
          'flex items-center h-5 py-1 px-1.5 gap-1.5 border border-GRAY_400 rounded-[4px] transition-colors hover:bg-GRAY_50 data-[state=open]:bg-GRAY_50 cursor-pointer',
          isDisabled && 'opacity-50',
        )}
        disabled={isDisabled}
        variant='outline'
      >
        <SvgSpriteLoader
          id='stand'
          iconCategory={ICON_SPRITE_TYPES.EDUCATION}
          size={12}
          color={COLORS.GRAY_900}
          className='scale-75'
        />

        <span className='f-11-400 text-GRAY_1000'>{count ?? 0}</span>
      </Button>
    </Combobox>
  );
};

const OverlayContent = () => {
  return (
    <div className='flex flex-col gap-2 items-start justify-center w-full overflow-hidden text-wrap break-words'>
      <SvgSpriteLoader id='stand' size={16} color={COLORS.GRAY_900} />
      <p className='f-11-450 text-GRAY_900'>
        Artifacts simplify working with key content that you may need to edit, expand upon, or refer to in the future.
      </p>
    </div>
  );
};

export default ArtifactPill;

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Combobox } from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { ARTIFACT_ICON_MAPPING } from 'modules/process/process.constant';
import { ARTIFACT_TYPE } from 'modules/process/process.types';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLazyGetArtifactsByArtifactIdQuery } from '@/apis/processes';
import { toast } from '@/components/common/toast/Toast';
import { COLORS } from '@/constants/colors';
import { ICON_SPRITE_TYPES } from '@/constants/icons';
import { getProcessActivityLogsRouteById } from '@/constants/routeConfig';
import type { OtherArtifactsResponseType } from '@/types/api/processApi.types';
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

  const searchParams = useSearchParams();
  const processId = searchParams?.get('processId') as string;
  const process = searchParams?.get('process') as string;

  const router = useRouter();
  const [getArtifact, { isFetching: isLoadingArtifact }] = useLazyGetArtifactsByArtifactIdQuery();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isDisabled = useMemo(() => {
    return count === 0;
  }, [count]);

  const handleGetArtifacts = (artifactId: string) => {
    if (!artifactId) return;

    getArtifact({
      processId: processId as string,
      activityRunId: activityId as string,
      artifact_ids: artifactId,
    })
      .unwrap()
      .then((res) => {
        const artifactData = res?.artifacts?.[0]?.artifact_data as OtherArtifactsResponseType;

        if (artifactData?.url) {
          window.open(artifactData?.url, '_blank');
        }
      })
      .catch((err) => {
        toast.error(err?.data?.message ?? 'Failed to redirect');
      });
  };

  const handleSelect = (value: string) => {
    const artifact = artifacts?.find((artifact) => artifact?.id === value);

    if (artifact?.artifact_type === ARTIFACT_TYPE.EXTERNAL_LINK) {
      handleGetArtifacts(artifact?.id as string);

      return;
    }

    const path = getProcessActivityLogsRouteById(processId as string, process as string, activityId, status);

    router.push(`${path}&artifactId=${artifact?.id}&artifactType=${artifact?.artifact_type}`);
  };

  useEffect(() => {
    if (isLoadingArtifact) {
      toast.loading('Redirecting...', {
        id: 'redirecting',
      });
    } else {
      toast.dismiss('redirecting');
    }
  }, [isLoadingArtifact]);

  useEffect(() => {
    if (!buttonRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && open) {
          setOpen(false);
        }
      },
      {
        threshold: 0,
      },
    );

    observer.observe(buttonRef.current);

    return () => {
      observer.disconnect();
    };
  }, [open]);

  return (
    <Combobox
      options={artifacts?.map((artifact) => ({
        value: artifact?.id,
        label: artifact?.display_name,
        icon: (
          <Image
            src={
              ARTIFACT_ICON_MAPPING[artifact?.artifact_type]?.icon_url ??
              ARTIFACT_ICON_MAPPING[ARTIFACT_TYPE.PDF_DATASET]?.icon_url
            }
            alt={artifact?.display_name}
            width={12}
            height={12}
            priority
          />
        ),
      }))}
      onSelect={(option) => {
        handleSelect(option?.value as string);
      }}
      open={open}
      onOpenChange={setOpen}
      searchPlaceholder='Search artifacts'
      emptyText='No artifacts found'
      inputClassName='placeholder:text-GRAY_500 placeholder:f-12-400'
      contentClassName='w-[300px] h-[334px] rounded-md border-[0.5px] border-GRAY_500 shadow-md flex flex-col justify-between'
      itemClassName='f-13-450 text-GRAY_950 hover:bg-GRAY_900 rounded-md'
      overLayContent={<OverlayContent />}
      isPortalNeeded
      triggerClassName='combobox-trigger'
      listClassName='flex-1 overflow-y-hidden'
      groupClassName='pb-11'
    >
      <Button
        ref={buttonRef}
        className={cn(
          'border-GRAY_400 hover:bg-GRAY_50 data-[state=open]:bg-GRAY_50 flex h-5 cursor-pointer items-center gap-1.5 rounded border px-1.5 py-1 transition-colors',
          isDisabled && 'border-GRAY_400 !opacity-100',
        )}
        disabled={isDisabled}
        variant='outline'
      >
        <SvgSpriteLoader
          id='stand'
          iconCategory={ICON_SPRITE_TYPES.EDUCATION}
          size={12}
          color={isDisabled ? COLORS.GRAY_500 : COLORS.GRAY_900}
          className='scale-75'
        />

        <span className={cn('f-11-400', isDisabled ? 'text-GRAY_500' : 'text-GRAY_1000')}>{count ?? 0}</span>
      </Button>
    </Combobox>
  );
};

const OverlayContent = () => {
  return (
    <div className='bg-GRAY_50 border-GRAY_400 flex h-24 w-full flex-col items-start justify-center gap-2 border-t px-3.5 py-4'>
      <div className='flex w-full items-center justify-start gap-2'>
        <SvgSpriteLoader id='stand' size={16} color={COLORS.GRAY_900} />
      </div>
      <p className='f-11-450 text-GRAY_900 text-wrap break-words'>
        Artifacts simplify working with key content that you may need to edit, expand upon, or refer to in the future.
      </p>
    </div>
  );
};

export default ArtifactPill;

'use client';

import { useMemo, useState } from 'react';
import { Button, Input, toast } from '@zamp-platform/ui';
import { prioritizedSearch, useAutoFocus } from '@zamp-platform/utils';
import { useListSkillsQuery } from '@/apis/pace';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import SkillCardSkeleton from '@/modules/pace/components/loaders/SkillCardSkeleton';
import SkillCard from '@/modules/pace/components/skills/SkillCard';
import SkillsEmptyState from '@/modules/pace/components/skills/SkillsEmptyState';
import UploadSkillModal from '@/modules/pace/components/skills/UploadSkillModal';

const SkillsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefetching, setIsRefetching] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [skillIdToUpdate, setSkillIdToUpdate] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, refetch } = useListSkillsQuery({});
  const { setRef: setSearchInputRef } = useAutoFocus<HTMLInputElement>({ enabled: !isLoading });

  const skills = data?.skills ?? [];

  const filteredSkills = useMemo(
    () =>
      prioritizedSearch({
        items: skills,
        query: searchQuery,
        fields: [
          { getValue: (skill) => skill.name, weight: 100 },
          { getValue: (skill) => skill.description, weight: 10 },
        ],
      }),
    [skills, searchQuery],
  );

  const onUpdate = (id: string) => {
    setSkillIdToUpdate(id);
    setIsUploadModalOpen(true);
  };

  const onCloseModal = () => {
    setIsUploadModalOpen(false);
    setSkillIdToUpdate(undefined);
  };

  const getSkillIdByName = (skillName: string): string | undefined => {
    const existingSkill = skills.find((s) => s.name === skillName);

    return existingSkill?.id;
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const onRefetch = async () => {
    setIsRefetching(true);
    try {
      await refetch();
    } catch {
      toast.error('Failed to refetch skills');
    } finally {
      setIsRefetching(false);
    }
  };

  return (
    <div className='flex w-full flex-col gap-y-4 overflow-hidden'>
      <div className='flex w-full items-center justify-between px-6 py-1'>
        <Input
          placeholder='Search skills...'
          value={searchQuery}
          onChange={onSearchChange}
          className='border-GRAY_400 focus:border-GRAY_600 bg-BG_WHITE h-8 w-full focus:ring-3'
          wrapperClassName='w-[40%]'
          size='small'
          disabled={isLoading}
          aria-label='Search skills'
          ref={setSearchInputRef}
        />
        <Button
          variant='secondary'
          size='medium'
          onClick={() => {
            setSkillIdToUpdate(undefined);
            setIsUploadModalOpen(true);
          }}
        >
          Upload skill
        </Button>
      </div>
      <div className='w-full flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden'>
        <CommonWrapper
          isLoading={isLoading || isRefetching}
          isError={isError}
          isNoData={!isLoading && !isRefetching && !isError && filteredSkills.length === 0}
          refetchFunction={onRefetch}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<SkillCardSkeleton />}
          noDataBanner={<SkillsEmptyState searchQuery={searchQuery} />}
          className='h-full w-full'
          disableAnimation
        >
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onUpdate={onUpdate} />
          ))}
        </CommonWrapper>
      </div>
      <UploadSkillModal
        isOpen={isUploadModalOpen}
        onClose={onCloseModal}
        skillId={skillIdToUpdate}
        getSkillIdByName={getSkillIdByName}
      />
    </div>
  );
};

export default SkillsSection;

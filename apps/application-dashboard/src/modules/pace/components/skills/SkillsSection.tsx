'use client';

import { useMemo, useState } from 'react';
import { Button, Input, toast } from '@zamp-platform/ui';
import { useListSkillsQuery } from '@/apis/pace';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useChatSidebarContext } from '@/modules/pace/chatsidebar.context';
import SkillCardSkeleton from '@/modules/pace/components/loaders/SkillCardSkeleton';
import SkillCard from '@/modules/pace/components/skills/SkillCard';
import SkillsEmptyState from '@/modules/pace/components/skills/SkillsEmptyState';
import UploadSkillModal from '@/modules/pace/components/skills/UploadSkillModal';

const SkillsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefetching, setIsRefetching] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [skillIdToUpdate, setSkillIdToUpdate] = useState<string | undefined>(undefined);

  const { isChatSidebarOpen, setIsChatSidebarOpen } = useChatSidebarContext();
  const { data, isLoading, isError, refetch } = useListSkillsQuery({});

  const skills = data?.skills ?? [];

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills;

    const query = searchQuery.toLowerCase();

    return skills.filter(
      (skill) => skill.name.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query),
    );
  }, [skills, searchQuery]);

  const onUpdate = (id: string) => {
    setSkillIdToUpdate(id);
    setIsUploadModalOpen(true);
  };

  const onCloseModal = () => {
    setIsUploadModalOpen(false);
    setSkillIdToUpdate(undefined);
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

  const onOpenChat = () => {
    setIsChatSidebarOpen(true);
  };

  return (
    <>
      <div className='flex w-full max-w-[700px] items-center justify-between gap-x-3 px-6 pb-4'>
        <Input
          placeholder='Search skills...'
          value={searchQuery}
          onChange={onSearchChange}
          className='border-GRAY_400 focus:border-GRAY_600 w-full focus:ring-3'
          size='small'
          aria-label='Search skills'
        />
        <Button
          variant='secondary'
          size='small'
          onClick={() => {
            setSkillIdToUpdate(undefined);
            setIsUploadModalOpen(true);
          }}
        >
          Upload skill
        </Button>
      </div>
      <div className='w-full max-w-[700px] flex-1 overflow-y-auto' style={{ scrollbarWidth: 'thin' }}>
        <CommonWrapper
          isLoading={isLoading || isRefetching}
          isError={isError}
          isNoData={!isLoading && !isRefetching && !isError && filteredSkills.length === 0}
          refetchFunction={onRefetch}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<SkillCardSkeleton />}
          noDataBanner={<SkillsEmptyState searchQuery={searchQuery} />}
          className='h-full w-full'
        >
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onUpdate={onUpdate} />
          ))}
        </CommonWrapper>
      </div>
      <UploadSkillModal isOpen={isUploadModalOpen} onClose={onCloseModal} skillId={skillIdToUpdate} />
      {!isChatSidebarOpen && (
        <Button
          onClick={onOpenChat}
          variant='secondary'
          size='icon'
          className='absolute bottom-3 left-3 h-14 w-14 rounded-full border-none transition-all [&_svg]:size-10'
          title='Start new chat'
        >
          <NewPaceIcons />
        </Button>
      )}
    </>
  );
};

export default SkillsSection;

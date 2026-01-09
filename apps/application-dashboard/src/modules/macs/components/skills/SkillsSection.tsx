'use client';

import { useMemo, useState } from 'react';
import { Button, Input, toast } from '@zamp-platform/ui';
import { useDeleteSkillMutation, useListSkillsQuery, useUpdateSkillStatusMutation } from '@/apis/macs';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { SkillCardSkeleton } from '@/modules/macs/components/loaders';
import SkillCard from '@/modules/macs/components/skills/SkillCard';
import SkillsHeader from '@/modules/macs/components/skills/SkillsHeader';
import UploadSkillModal from '@/modules/macs/components/skills/UploadSkillModal';
import { SkillStatus } from '@/types/api/skills.types';

const SkillsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefetching, setIsRefetching] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [skillIdToUpdate, setSkillIdToUpdate] = useState<string | undefined>(undefined);

  const { data, isLoading, isError, refetch } = useListSkillsQuery({});
  const [updateSkillStatus] = useUpdateSkillStatusMutation();
  const [deleteSkill] = useDeleteSkillMutation();

  const skills = data?.skills ?? [];

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills;

    const query = searchQuery.toLowerCase();

    return skills.filter(
      (skill) => skill.name.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query),
    );
  }, [skills, searchQuery]);

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await updateSkillStatus({
        skillId: id,
        status: enabled ? SkillStatus.ACTIVE : SkillStatus.DISABLED,
      }).unwrap();
    } catch {
      toast.error('Failed to update skill status');
    }
  };

  const handleUpdate = (id: string) => {
    setSkillIdToUpdate(id);
    setIsUploadModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill({ skillId: id }).unwrap();
      toast.success('Skill deleted successfully');
    } catch {
      toast.error('Failed to delete skill');
    }
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setSkillIdToUpdate(undefined);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRefetch = async () => {
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
    <div className='flex h-full flex-col items-center justify-start bg-white'>
      <SkillsHeader />

      <div className='flex w-full max-w-[700px] items-center justify-between gap-x-3 px-6 pb-4'>
        <Input
          placeholder='Search skills...'
          value={searchQuery}
          onChange={handleSearchChange}
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
          refetchFunction={handleRefetch}
          skeletonType={SkeletonTypes.CUSTOM}
          loader={<SkillCardSkeleton />}
          noDataBanner={
            <div className='f-14-400 text-GRAY_600 flex h-full items-center justify-center text-center'>
              {searchQuery
                ? `No skills found matching "${searchQuery}"`
                : 'No skills yet. Upload your first skill to get started.'}
            </div>
          }
          className='h-full w-full'
        >
          {filteredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </CommonWrapper>
      </div>

      <UploadSkillModal isOpen={isUploadModalOpen} onClose={handleCloseModal} skillId={skillIdToUpdate} />
    </div>
  );
};

export default SkillsSection;

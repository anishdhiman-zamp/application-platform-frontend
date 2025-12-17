'use client';

import { useMemo, useState } from 'react';
import { Input } from '@zamp-platform/ui';
import SkillCard from 'modules/macs/components/sections/SkillCard';
import SkillsHeader from 'modules/macs/components/sections/SkillsHeader';
import { MOCK_SKILLS } from '@/modules/macs/constants';
import type { Skill } from '@/modules/macs/types';

const SkillsSection = () => {
  const [skills, setSkills] = useState<Skill[]>(MOCK_SKILLS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skills;

    const query = searchQuery.toLowerCase();

    return skills.filter(
      (skill) => skill.name.toLowerCase().includes(query) || skill.description.toLowerCase().includes(query),
    );
  }, [skills, searchQuery]);

  const handleToggle = (id: string, enabled: boolean) => {
    setSkills((prev) => prev.map((skill) => (skill.id === id ? { ...skill, enabled } : skill)));
  };

  const handleUploadSkill = () => {
    // TODO: Implement skill upload functionality
    console.log('Upload skill clicked');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className='flex h-full flex-col items-center justify-start bg-white'>
      <SkillsHeader onUploadSkill={handleUploadSkill} />

      <div className='w-full max-w-[700px] px-6 pb-4'>
        <Input
          placeholder='Search skills...'
          value={searchQuery}
          onChange={handleSearchChange}
          className='border-GRAY_400 focus:border-GRAY_600 w-full focus:ring-3'
          size='small'
          aria-label='Search skills'
        />
      </div>

      <div className='max-w-[700px] flex-1 overflow-y-auto' style={{ scrollbarWidth: 'thin' }}>
        {filteredSkills.length > 0 ? (
          filteredSkills.map((skill) => <SkillCard key={skill.id} skill={skill} onToggle={handleToggle} />)
        ) : (
          <div className='f-14-400 text-GRAY_600 py-8 text-center'>No skills found matching "{searchQuery}"</div>
        )}
      </div>
    </div>
  );
};

export default SkillsSection;

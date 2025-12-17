'use client';

import { Button } from '@zamp-platform/ui';

interface SkillsHeaderProps {
  onUploadSkill: () => void;
}

const SkillsHeader = ({ onUploadSkill }: SkillsHeaderProps) => {
  return (
    <div className='border-GRAY_400 flex w-full max-w-[700px] items-start justify-between px-6 py-5'>
      <div className='flex flex-col gap-y-1'>
        <h1 className='f-18-600 text-GRAY_1000'>Skills</h1>
        <p className='f-13-400 text-GRAY_700'>
          Repeatable, customizable instructions that Pace can follow in any chat.
        </p>
      </div>

      <Button variant='secondary' size='small' onClick={onUploadSkill}>
        Upload skill
      </Button>
    </div>
  );
};

export default SkillsHeader;

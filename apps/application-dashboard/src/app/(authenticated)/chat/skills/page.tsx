import SkillsHeader from '@/modules/pace/components/skills/SkillsHeader';
import SkillsSection from '@/modules/pace/components/skills/SkillsSection';

const SkillsPage = () => {
  return (
    <div className='relative mx-auto flex h-full max-w-[700px] flex-col items-center justify-start bg-white pt-15'>
      <SkillsHeader />
      <SkillsSection />
    </div>
  );
};

export default SkillsPage;

import PaceSettingsSidebar from '@/modules/pace/components/layout/settings-sidebar/PaceSettingsSidebar';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex h-full'>
      <PaceSettingsSidebar />
      {children}
    </div>
  );
};

export default SettingsLayout;

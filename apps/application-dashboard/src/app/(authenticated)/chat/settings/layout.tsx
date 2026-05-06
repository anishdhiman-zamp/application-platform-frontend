import PageTopbar from '@/components/layouts/PageTopbar';
import PaceSettingsSidebar from '@/modules/pace/components/layout/settings-sidebar/PaceSettingsSidebar';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='bg-BG_WHITE flex h-full min-h-0 flex-col overflow-hidden'>
      <PageTopbar title='Settings' />
      <div className='flex min-h-0 flex-1 justify-center gap-6 overflow-clip px-4 pt-8'>
        <PaceSettingsSidebar />
        <div className='flex min-h-0 w-full max-w-[700px] flex-col overflow-hidden'>{children}</div>
      </div>
    </div>
  );
};

export default SettingsLayout;

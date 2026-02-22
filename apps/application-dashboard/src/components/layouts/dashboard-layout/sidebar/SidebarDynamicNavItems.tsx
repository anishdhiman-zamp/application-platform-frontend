import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import ProcessNavigation from '@/components/layouts/dashboard-layout/components/ProcessNavigation';
import SkeletonLoaderSidebarPages from '@/components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';
import { useProcesses } from '@/contexts/ProcessesContext';

const SidebarDynamicNavItems = ({ params }: { params: { pageId?: string; processId?: string } }) => {
  const { processes, isLoadingProcesses, deleteProcess, updateProcess } = useProcesses();

  return (
    <CommonWrapper
      isLoading={isLoadingProcesses}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<SkeletonLoaderSidebarPages />}
      className='px-2 py-2.5'
    >
      <ProcessNavigation
        processes={processes}
        params={params}
        deleteProcess={deleteProcess}
        updateProcess={updateProcess}
      />
    </CommonWrapper>
  );
};

export default SidebarDynamicNavItems;

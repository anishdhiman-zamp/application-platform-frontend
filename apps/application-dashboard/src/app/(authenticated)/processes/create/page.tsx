'use client';

import { FC, memo } from 'react';
import { useResource } from '@zamp-platform/battalion';
import type { Process } from '@/app/(authenticated)/resources';
import ProcessIcon from '@/modules/process/create/components/ProcessIcon';
import ProcessNameInput from '@/modules/process/create/components/ProcessNameInput';
import ProcessSharingSection from '@/modules/process/create/components/ProcessSharingSection';
import StartBuildingButton from '@/modules/process/create/components/StartBuildingButton';
import { useAudienceSelection } from '@/modules/process/create/hooks/useAudienceSelection';
import { useProcessCreation } from '@/modules/process/create/hooks/useProcessCreation';

const ProcessCreatePage: FC = memo(() => {
  const { create: createProcess } = useResource<Process>('Process');
  const { formData, errors, updateProcessName, updateSelectedAudiences, handleStartBuilding } =
    useProcessCreation(createProcess);

  const {
    selectedAudiences,
    setSelectedAudiences,
    search,
    setSearch,
    isOpen,
    handleValidateAndAdd,
    handleSelectOption,
  } = useAudienceSelection({
    onAudiencesChange: updateSelectedAudiences,
  });

  return (
    <div className='relative flex h-full w-full flex-col items-center overflow-hidden px-8 py-20'>
      <div className='relative z-10 flex w-full max-w-md flex-col items-start'>
        <ProcessIcon />

        <ProcessNameInput
          value={formData.processName}
          onChange={updateProcessName}
          error={errors.processName}
          onEnter={handleStartBuilding}
        />

        <ProcessSharingSection
          selectedAudiences={selectedAudiences}
          setSelectedAudiences={setSelectedAudiences}
          search={search}
          setSearch={setSearch}
          isOpen={isOpen}
          onValidateAndAdd={handleValidateAndAdd}
          onSelectOption={handleSelectOption}
        />

        <StartBuildingButton onClick={handleStartBuilding} disabled={!formData.processName.trim()} />
      </div>
    </div>
  );
});

export default ProcessCreatePage;

ProcessCreatePage.displayName = 'ProcessCreatePage';

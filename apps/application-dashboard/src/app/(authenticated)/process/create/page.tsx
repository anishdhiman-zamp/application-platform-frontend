'use client';

import { FC, useRef } from 'react';
import { InteractiveBackground } from '@/modules/process/create/components/InteractiveBackground';
import { PaceCursor } from '@/modules/process/create/components/PaceCursor';
import ProcessIcon from '@/modules/process/create/components/ProcessIcon';
import ProcessNameInput from '@/modules/process/create/components/ProcessNameInput';
import ProcessSharingSection from '@/modules/process/create/components/ProcessSharingSection';
import StartBuildingButton from '@/modules/process/create/components/StartBuildingButton';
import { useAudienceSelection } from '@/modules/process/create/hooks/useAudienceSelection';
import { usePaceCursor } from '@/modules/process/create/hooks/usePaceCursor';
import { useProcessCreation } from '@/modules/process/create/hooks/useProcessCreation';

const ProcessCreatePage: FC = () => {
  const { formData, errors, updateProcessName, updateSelectedAudiences, handleStartBuilding } = useProcessCreation();

  const {
    selectedAudiences,
    setSelectedAudiences,
    search,
    setSearch,
    isOpen,
    setIsOpen,
    handleValidateAndAdd,
    handleSelectOption,
  } = useAudienceSelection({
    onAudiencesChange: updateSelectedAudiences,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const { cursorPos, clickEvent, handleContainerClick } = usePaceCursor(containerRef, contentContainerRef);

  return (
    <div
      ref={containerRef}
      className='relative flex h-full w-full flex-col items-center overflow-hidden px-8 py-20'
      onClick={handleContainerClick}
    >
      <InteractiveBackground clickEvent={clickEvent} />

      {/* Render Pace cursor only when position is known */}
      {cursorPos && <PaceCursor x={cursorPos.x} y={cursorPos.y} />}

      <div ref={contentContainerRef} className='relative z-10 flex w-full max-w-md flex-col items-start'>
        <ProcessIcon />

        <ProcessNameInput value={formData.processName} onChange={updateProcessName} error={errors.processName} />

        <ProcessSharingSection
          selectedAudiences={selectedAudiences}
          setSelectedAudiences={setSelectedAudiences}
          search={search}
          setSearch={setSearch}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onValidateAndAdd={handleValidateAndAdd}
          onSelectOption={handleSelectOption}
        />

        <StartBuildingButton onClick={handleStartBuilding} disabled={!formData.processName.trim()} />
      </div>
    </div>
  );
};

export default ProcessCreatePage;

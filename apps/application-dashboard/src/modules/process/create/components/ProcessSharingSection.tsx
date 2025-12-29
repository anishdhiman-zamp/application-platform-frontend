import { Dispatch, FC, SetStateAction, useMemo } from 'react';
import MultiSelectInput from '@/components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from '@/components/multiSelectInput/multiSelectInput.types';
import { useAppSelector } from '@/hooks/toolkit';
import useAudienceMembers from '@/hooks/useAudienceMembers';
import { ResourceType } from '@/modules/shareResource/shareResource.types';
import { RootState } from '@/store';
import { ResourceAudienceType } from '@/types/api/auth.types';
import { GetTeamsByOrganizationIdResponseType } from '@/types/api/people.types';
import { getUserNameFromEmail } from '@/utils/common';

type ProcessSharingSectionProps = {
  selectedAudiences: ArrayListOption[];
  setSelectedAudiences: (audiences: ArrayListOption[]) => void;
  search: string;
  setSearch: (search: string) => void;
  isOpen: boolean;
  onValidateAndAdd: (option: { value: string; label: string; color?: string; type?: string; team_id?: string }) => void;
  onSelectOption: (option: { value: string; label: string; color?: string; type?: string; team_id?: string }) => void;
};

type CombinedOptionListDataType = {
  label: string;
  value: string;
  type?: string;
  color?: string;
  team_id?: string;
};

const ProcessSharingSection: FC<ProcessSharingSectionProps> = ({
  selectedAudiences,
  setSelectedAudiences,
  search,
  setSearch,
  isOpen,
  onValidateAndAdd,
  onSelectOption,
}) => {
  const orgName = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.name) ?? '';
  const orgLabel = `Everyone in ${orgName}`;

  // Get all audiences data (users and teams) using useAudienceMembers hook
  // Pass ResourceType.ORGANIZATION to get all organization members
  const {
    allTeamsData,
    audiencesData,
    loading: isLoadingOptions,
  } = useAudienceMembers({
    resourceType: ResourceType.ORGANIZATION,
    resourceId: '',
  });

  // Build combined options list with organization, users, and teams
  const combinedOptionListsData: CombinedOptionListDataType[] = useMemo(() => {
    const options: CombinedOptionListDataType[] = [];

    // Add organization option
    if (orgName) {
      options.push({
        label: orgLabel,
        value: orgName,
        type: ResourceAudienceType.ORGANIZATION,
        color: '',
      });
    }

    // Add team members (users) from audiencesData
    if (audiencesData) {
      audiencesData
        .filter((audience) => audience?.resource_audience_type === ResourceAudienceType.USER && audience?.user)
        .forEach((audience) => {
          options.push({
            label: audience?.user?.name ?? getUserNameFromEmail(audience?.user?.email ?? '') ?? '',
            value: audience?.user?.email ?? '',
            type: ResourceAudienceType.USER,
          });
        });
    }

    // Add teams
    if (allTeamsData) {
      allTeamsData.forEach((team: GetTeamsByOrganizationIdResponseType) => {
        options.push({
          label: team?.name ?? '',
          value: team?.name ?? '',
          type: ResourceAudienceType.TEAM,
          color: team?.metadata?.color_hex_code,
          team_id: team?.team_id,
        });
      });
    }

    return options;
  }, [audiencesData, allTeamsData, orgName, orgLabel]);

  // Filter out already selected items
  const filteredOptionListsData = useMemo(() => {
    return combinedOptionListsData.filter(
      (item) => !selectedAudiences?.some((selected) => selected?.value === item?.value),
    );
  }, [combinedOptionListsData, selectedAudiences]);

  const isLoadingOptionsList = isLoadingOptions;

  return (
    <div className='w-full'>
      <p className='f-14-500 text-GRAY_700 mb-3 text-left'>Share this process with others</p>
      <div className='w-full'>
        <MultiSelectInput
          id='process-audience-select'
          search={search}
          setSearch={setSearch}
          isOpen={isOpen}
          placeholderText='Share with people or teams'
          inputArrayList={selectedAudiences}
          setInputArrayList={setSelectedAudiences as Dispatch<SetStateAction<ArrayListOption[]>>}
          onValidateAndAdd={onValidateAndAdd}
          optionsList={filteredOptionListsData}
          onSelectOption={onSelectOption}
          selectOnlyFromList={true}
          isLoadingOptionsList={isLoadingOptionsList}
          wrapperClassName='bg-white max-h-[40px] overflow-hidden'
          inputWrapperClassName='flex-nowrap whitespace-nowrap overflow-auto [&::-webkit-scrollbar]:hidden'
          transformLabel={getUserNameFromEmail}
          labelCasing='capitalize'
          optionalOpenDropdownOptions={true}
        />
      </div>
    </div>
  );
};

export default ProcessSharingSection;

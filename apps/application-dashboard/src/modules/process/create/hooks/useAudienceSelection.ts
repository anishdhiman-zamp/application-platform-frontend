import { useCallback, useEffect, useState } from 'react';
import { ArrayListOption } from '@/components/multiSelectInput/multiSelectInput.types';
import { COLORS } from '@/constants/colors';
import { PROCESS_ACCESS_PRIVILEGES } from '@/modules/shareResource/shareResource.types';

type AudienceOption = {
  value: string;
  label: string;
  color?: string;
  type?: string;
  team_id?: string;
  resource_audience_id?: string;
};

type UseAudienceSelectionProps = {
  onAudiencesChange?: (audiences: ArrayListOption[]) => void;
};

export const useAudienceSelection = ({ onAudiencesChange }: UseAudienceSelectionProps) => {
  const [selectedAudiences, setSelectedAudiences] = useState<ArrayListOption[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const updateAudiences = useCallback(
    (audiences: ArrayListOption[]) => {
      setSelectedAudiences(audiences);
      onAudiencesChange?.(audiences);
    },
    [onAudiencesChange],
  );

  const handleValidateAndAdd = useCallback(
    ({ value, label, color, type, team_id, resource_audience_id }: AudienceOption) => {
      const newItem: ArrayListOption = {
        value,
        label,
        valid: true,
        role: PROCESS_ACCESS_PRIVILEGES.EDITOR,
        color: color || COLORS.WHITE,
        team_id,
        resource_audience_type: type,
        resource_audience_id,
      };

      setSelectedAudiences((prev) => {
        // Check for duplicates
        const isDuplicate = prev.some((item) => item.value === value);

        if (isDuplicate) {
          return prev;
        }

        return [...prev, newItem];
      });

      setSearch('');
    },
    [],
  );

  const handleSelectOption = useCallback(
    (option: AudienceOption) => {
      handleValidateAndAdd(option);
    },
    [handleValidateAndAdd],
  );

  useEffect(() => {
    onAudiencesChange?.(selectedAudiences);
  }, [selectedAudiences, onAudiencesChange]);

  return {
    selectedAudiences,
    setSelectedAudiences: updateAudiences,
    search,
    setSearch,
    isOpen,
    setIsOpen,
    handleValidateAndAdd,
    handleSelectOption,
  };
};

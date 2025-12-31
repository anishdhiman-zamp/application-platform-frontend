import { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';
import {
  useGetInvitedAudiencesByOrganisationIdQuery,
  usePostInviteAudiencesByOrganisationIdMutation,
} from 'apis/people';
import { COLORS } from 'constants/colors';
import { useAppSelector } from 'hooks/toolkit';
import { useCurrentUser } from 'hooks/useUserPrivilege';
import { TEAM_MEMBERS_PRIVILEGES_LIST } from 'modules/team/people.constants';
import { InviteMembersPopupPropsType, TEAM_MEMBERS_PRIVILEGES } from 'modules/team/people.types';
import { RootState } from 'store';
import { SIZE_TYPES } from 'types/common/components';
import { BUTTON_TYPES } from 'types/components/button.type';
import { accessPermissionForPeople } from 'utils/accessPermission/accessPermission';
import { PERMISSION_MESSAGES, VALIDATION_ERROR_MESSAGES } from 'utils/accessPermission/accessPermission.constants';
import { PERMISSION_TYPES } from 'utils/accessPermission/accessPermission.types';
import { validateEmail } from 'utils/common';
import { Button } from 'components/common/button/Button';
import Popup from 'components/common/popup/Popup';
import { toast } from 'components/common/toast/Toast';
import { TOAST_MESSAGES } from 'components/common/toast/toast.constants';
import MultiSelectInput from 'components/multiSelectInput/MultiSelectInput';
import { ArrayListOption } from 'components/multiSelectInput/multiSelectInput.types';

const InviteMembersPopup: FC<InviteMembersPopupPropsType> = ({ isOpen, onClose, teamMembersData }) => {
  const { userEmail: user_email, isMember } = useCurrentUser();
  const checkPermission = accessPermissionForPeople();
  const placeholderText = 'Share with people and teams';
  const organizationId = useAppSelector((state: RootState) => state?.user?.user?.orgs?.[0]?.organization_id) ?? '';
  const [validationErrorText, setValidationErrorText] = useState<string>('');
  const [showValidationError, setShowValidationError] = useState<boolean>(true);
  const [multiSelectInstances, setMultiSelectInstances] = useState<number[]>([0]);
  const [searchValues, setSearchValues] = useState<{ [key: number]: string }>({});
  const [pendingEntryByInstance, setPendingEntryByInstance] = useState<{ [key: number]: string }>({});
  const [selectedItemsByInstance, setSelectedItemsByInstance] = useState<{ [key: number]: ArrayListOption[] }>({});
  const [selectedRoleByInstance, setSelectedRoleByInstance] = useState<{ [key: number]: TEAM_MEMBERS_PRIVILEGES }>({});

  const hasEmptySearchValue = useMemo(() => {
    const values = Object.values(searchValues);

    return values.length === 0 || values.every((value) => !validateEmail(value));
  }, [searchValues]);
  const hasNonEmptySelectedItems = useMemo(
    () => Object.values(selectedItemsByInstance)?.some((item) => item?.length !== 0),
    [selectedItemsByInstance],
  );
  const isInvitable = useMemo(() => {
    if (showValidationError || isMember) return false;
    const hasValidSearch = !hasEmptySearchValue || hasNonEmptySelectedItems;

    return hasValidSearch && multiSelectInstances?.length > 0;
  }, [showValidationError, isMember, hasEmptySearchValue, hasNonEmptySelectedItems, multiSelectInstances]);
  const [postInviteAudiences, { isLoading: postInviteAudiencesIsLoading }] =
    usePostInviteAudiencesByOrganisationIdMutation();
  const { data: invitedTeamMembersData, refetch: refetchAudiencesByOrganizationId } =
    useGetInvitedAudiencesByOrganisationIdQuery(
      { organizationId },
      { skip: !organizationId, refetchOnMountOrArgChange: false },
    );

  const handleSearchChange = (id: number, value: string) => {
    setSearchValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    setPendingEntryByInstance((prev) => (prev[id] === value ? prev : { ...prev, [id]: value }));
  };

  const handleCloseInviteMembersPopup = () => {
    onClose?.();
    setShowValidationError(false);
    setSelectedItemsByInstance({});
    setSearchValues({});
    setMultiSelectInstances([0]);
    setPendingEntryByInstance({});
    setSelectedRoleByInstance({});
  };

  const handleInviteMembers = () => {
    if (!checkPermission) {
      return toast.error(PERMISSION_MESSAGES[PERMISSION_TYPES.INVITE]);
    }

    const finalSelectedItemsByInstance = { ...selectedItemsByInstance };

    Object.entries(pendingEntryByInstance)?.forEach(([idStr, value]) => {
      if (!value?.trim()) return;
      const id = Number(idStr);
      const { isValid, message } = validateAndGetUserDetails(value);
      const role = selectedRoleByInstance[id] || TEAM_MEMBERS_PRIVILEGES_LIST[0].value;

      if (!finalSelectedItemsByInstance[id]) {
        finalSelectedItemsByInstance[id] = [];
      }

      finalSelectedItemsByInstance[id].push({
        value,
        label: value,
        valid: isValid,
        role,
        color: isValid ? COLORS.WHITE : COLORS.RED_100,
        validationMessage: message,
      });
    });

    const invitations = Object.values(finalSelectedItemsByInstance)
      .flat()
      .filter((item) => item?.value)
      .map(({ value, role }) => ({ email: value, role: role ?? TEAM_MEMBERS_PRIVILEGES_LIST[0].value }));

    postInviteAudiences({ organizationId, body: { invitations } })
      .unwrap()
      .then(() => {
        refetchAudiencesByOrganizationId();
        toast.success(TOAST_MESSAGES.SUCCESS_AUDIENCE_INVITED);
        handleCloseInviteMembersPopup();
      })
      .catch((err) => {
        toast.error(err?.data?.error || TOAST_MESSAGES.FAILED_AUDIENCE_INVITED);
      });
  };

  const validateAndGetUserDetails = useCallback(
    (value: string) => {
      const invalidRulesList = [
        {
          isInvalid: () => !validateEmail(value),
          message: VALIDATION_ERROR_MESSAGES.INVALID_EMAIL,
        },
        {
          isInvalid: () => invitedTeamMembersData?.some((item) => item?.email === value),
          message: VALIDATION_ERROR_MESSAGES.USER_ALREADY_HAS_ACCESS,
        },
        {
          isInvalid: () => teamMembersData?.some((item) => item?.user?.email === value),
          message: VALIDATION_ERROR_MESSAGES.USER_ALREADY_IN_ORG,
        },
        {
          isInvalid: () => value === user_email,
          message: VALIDATION_ERROR_MESSAGES.CANNOT_ADD_SELF,
        },
      ];

      for (const rule of invalidRulesList) {
        if (rule.isInvalid()) {
          return { isValid: false, message: rule.message };
        }
      }

      return { isValid: true };
    },
    [invitedTeamMembersData, teamMembersData, user_email],
  );

  const handleValidateAndAdd = (id: number, { value }: { value: string; label: string; color?: string }) => {
    const instanceRole = selectedRoleByInstance[id] || TEAM_MEMBERS_PRIVILEGES_LIST[0].value;
    const existingEmails = new Set(selectedItemsByInstance[id]?.map((item) => item.value) || []);
    const uniqueEntries = new Set<string>();
    const splitUsingRegex = /[, ]+/;

    const validatedEntries = value
      .split(splitUsingRegex)
      .map((email) => email?.trim())
      .filter(Boolean)
      .filter((email) => !existingEmails?.has(email) && !uniqueEntries?.has(email))
      .map((email) => {
        uniqueEntries.add(email);
        const { isValid, message } = validateAndGetUserDetails(email);

        return {
          value: email,
          label: email,
          valid: isValid,
          role: instanceRole,
          color: isValid ? COLORS.WHITE : COLORS.RED_100,
          validationMessage: message,
        };
      });

    if (!validatedEntries?.length) return;

    setSelectedItemsByInstance((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), ...validatedEntries],
    }));

    const firstInvalidEntry = validatedEntries?.find((item) => !item?.valid);

    setShowValidationError(!!firstInvalidEntry);
    setValidationErrorText(firstInvalidEntry?.validationMessage ?? '');
  };

  const updateSelectedRoles = useCallback(() => {
    setSelectedRoleByInstance((prev) => {
      const updatedRoles = { ...prev };

      multiSelectInstances?.forEach((id) => {
        if (!(id in updatedRoles)) {
          updatedRoles[id] = TEAM_MEMBERS_PRIVILEGES_LIST[0].value;
        }
      });

      return updatedRoles;
    });
  }, [multiSelectInstances]);

  const validateSearchAndSelectedItems = (
    searchValues: { [key: number]: string },
    selectedItemsByInstance: { [key: number]: ArrayListOption[] },
    setShowValidationError: Dispatch<SetStateAction<boolean>>,
    setValidationErrorText: Dispatch<SetStateAction<string>>,
  ) => {
    let hasInvalidEntry = false;
    let firstErrorMessage = '';

    Object.entries(searchValues).forEach(([idStr, search]) => {
      const id = Number(idStr);

      if (search?.trim() !== '' && !selectedItemsByInstance[id]?.some((item) => item?.value === search)) {
        const { isValid, message } = validateAndGetUserDetails(search);

        if (!isValid) {
          hasInvalidEntry = true;
          firstErrorMessage = message || '';
        }
      }
    });

    if (!hasInvalidEntry) {
      Object.values(selectedItemsByInstance)?.forEach((items) => {
        if (!Array.isArray(items)) return;

        const invalidItem = items?.find((item) => !item?.valid);

        if (invalidItem) {
          hasInvalidEntry = true;
          firstErrorMessage = invalidItem.validationMessage || 'Invalid item found';
        }
      });
    }

    setShowValidationError(hasInvalidEntry);
    setValidationErrorText(firstErrorMessage);
  };

  useEffect(() => {
    updateSelectedRoles();
  }, [updateSelectedRoles]);

  useEffect(() => {
    const debounceSearchHandler = setTimeout(() => {
      validateSearchAndSelectedItems(
        searchValues,
        selectedItemsByInstance,
        setShowValidationError,
        setValidationErrorText,
      );
    }, 150);

    return () => clearTimeout(debounceSearchHandler);
  }, [searchValues, selectedItemsByInstance]);

  return (
    <Popup
      isOpen={isOpen}
      showIcon
      title='Invite Members'
      subTitle='Type or paste mail addresses, separated by spaces or commas'
      titleClassName='f-16-600 text-GRAY_950'
      iconCategory={ICON_SPRITE_TYPES.GENERAL}
      iconId='x-close'
      iconColor={COLORS.TEXT_PRIMARY}
      onClose={handleCloseInviteMembersPopup}
      popupWrapperClassName='bg-white rounded-t-3.5 border border-b-0 border-GRAY_400'
      closeOnClickOutside={false}
    >
      <div className='rounded-b-3.5 border-GRAY_400 flex w-[458px] flex-col border border-t-0 bg-white'>
        <div className='flex flex-col px-4 py-6'>
          <div className='flex flex-col gap-2'>
            {multiSelectInstances.map((id) => (
              <MultiSelectInput
                key={id}
                id={`invite-members-${id}`}
                search={searchValues[id] || ''}
                setSearch={(value) => handleSearchChange(id, value)}
                isOpen={isOpen}
                placeholderText={placeholderText}
                roleOptions={TEAM_MEMBERS_PRIVILEGES_LIST}
                inputArrayList={selectedItemsByInstance[id] || []}
                setInputArrayList={(items) =>
                  setSelectedItemsByInstance((prev) => ({
                    ...prev,
                    [id]: items as ArrayListOption[],
                  }))
                }
                onValidateAndAdd={({ value, label, color }) => handleValidateAndAdd(id, { value, label, color })}
                selectedRole={selectedRoleByInstance[id] ?? TEAM_MEMBERS_PRIVILEGES_LIST[0].value}
                setSelectedRole={(role) =>
                  setSelectedRoleByInstance((prev) => ({
                    ...prev,
                    [id]: role as TEAM_MEMBERS_PRIVILEGES,
                  }))
                }
              />
            ))}
          </div>
          {validationErrorText && showValidationError && (
            <span className='f-11-400 text-RED_700 mt-2 flex w-full text-start'>{validationErrorText}</span>
          )}
        </div>
        <div className='border-GRAY_200 flex w-full justify-end border-t px-5 py-4'>
          <Button
            type={BUTTON_TYPES.PRIMARY}
            id='send-user-invite'
            size={SIZE_TYPES.MEDIUM}
            disabled={!isInvitable}
            onClick={handleInviteMembers}
            isLoading={postInviteAudiencesIsLoading}
          >
            Send invite
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default InviteMembersPopup;

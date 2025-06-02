import { type FC, useState } from 'react';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@zamp-platform/ui';
import type { AudienceMembersDataType } from 'modules/dualAdmin/DualAdminHome';
import AudienceMember from '@/components/audience-member';
import type { MapAny } from '@/types/commonTypes';
type ApprovalDropdownProps = {
  selectedApprovers: AudienceMembersDataType[];
  onChange: (approvers: AudienceMembersDataType[]) => void;
  approversList: AudienceMembersDataType[];
  disabled: boolean;
};

const ApprovalDropdown: FC<ApprovalDropdownProps> = ({ selectedApprovers, onChange, approversList, disabled }) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const isChecked = (option: MapAny, selectedOptions: MapAny[]) => {
    return selectedOptions?.some(
      (selectedOption) => selectedOption?.resource_audience_id === option?.resource_audience_id,
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <div className='relative'>
          {selectedApprovers?.length > 0 ? (
            <div className='flex items-center gap-1 text-GRAY_1000'>
              <AudienceMember
                resourceType={selectedApprovers?.[0]?.resource_type}
                user={{ ...selectedApprovers?.[0]?.user, email: selectedApprovers?.[0]?.user?.email ?? '' }}
                currentUserHasAdminAccess={false}
                teamInfo={{
                  name: selectedApprovers?.[0]?.team_name,
                  color: selectedApprovers?.[0]?.team_color,
                }}
                resourceAudienceType={selectedApprovers?.[0]?.resource_audience_type}
                showAvatar
                tagClassName='border-none'
              />
              {`${selectedApprovers?.length > 1 ? `+${selectedApprovers?.length - 1}` : ''}`}
            </div>
          ) : (
            <div className='text-GRAY_600 f-12-450 cursor-pointer whitespace-nowrap'>Select approver</div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='z-1001 max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:hidden'
        sideOffset={6}
        align='start'
        side='bottom'
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        {approversList?.map((audience, index) => (
          <DropdownMenuCheckboxItem
            key={audience?.resource_audience_id ?? index}
            checked={isChecked(audience, selectedApprovers)}
            disabled={disabled}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...selectedApprovers, audience]);
              } else {
                onChange(
                  selectedApprovers.filter(
                    (selectedOption) => selectedOption?.resource_audience_id !== audience?.resource_audience_id,
                  ),
                );
              }
            }}
          >
            <AudienceMember
              resourceType={audience?.resource_type}
              user={{ ...audience?.user, email: audience?.user?.email ?? '' }}
              currentUserHasAdminAccess={false}
              teamInfo={{
                name: audience?.team_name,
                color: audience?.team_color,
              }}
              resourceAudienceType={audience?.resource_audience_type}
              showAvatar={false}
            />
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ApprovalDropdown;

export type ArrayListOption = {
  value: string;
  resource_audience_type?: string;
  resource_audience_id?: string;
  valid: boolean;
  role?: string;
  color?: string;
};

export type MultiSelectInputPropsType = {
  inputArrayList: ArrayListOption[];
  setInputArrayList: React.Dispatch<React.SetStateAction<ArrayListOption[]>>;
  checkAudiencePresentInOrg?: boolean;
  setShowValidationError: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: (value: string) => void;
  selectedRoleRef: React.MutableRefObject<any>;
  showValidationError: boolean;
  validationErrorText?: string;
  isOpen: boolean;
  placeholderText: string;
  dropdownOptions?: Array<{ label: string; value: string; color?: string }>;
  roleOptions?: Array<{ label: string; value: string }>;
  customDropdownMenuClass?: {
    width?: string;
    marginLeft?: string;
  };
};

export type ArrayListOption = {
  value: string;
  valid: boolean;
  role?: string;
  color?: string;
};

export type MultiSelectInputPropsType = {
  inputArrayList: ArrayListOption[];
  setInputArrayList: React.Dispatch<React.SetStateAction<ArrayListOption[]>>;
  setShowValidationError: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  search: string;
  setSearch: (value: string) => void;
  selectedRoleRef: React.MutableRefObject<any>;
  showValidationError: boolean;
  validationErrorText?: string;
  isOpen: boolean;
  placeholderText: string;
  dropdownOptions?: Array<{ label: string; value: string; color?: string }>;
  roleOptions?: Array<{ label: string; value: string }>;
};

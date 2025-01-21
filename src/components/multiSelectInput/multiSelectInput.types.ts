export type ArrayListOption = {
  value: string;
  valid: boolean;
};

export type MultiSelectInputPropsType = {
  inputArrayList: ArrayListOption[];
  setInputArrayList: React.Dispatch<React.SetStateAction<ArrayListOption[]>>;
  containerRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  search: string;
  setSearch: (value: string) => void;
  selectedRoleRef: React.MutableRefObject<any>;
  showValidationError: boolean;
  validationErrorText: string;
  isOpen: boolean;
  setShowValidationError: (value: boolean) => void;
  placeholderText: string;
};

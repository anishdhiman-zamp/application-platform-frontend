export type ArrayListOption = {
  value: string;
  resource_audience_type?: string;
  resource_audience_id?: string;
  valid: boolean;
  role?: string;
  color?: string;
};

export type MultiSelectInputPropsType = {
  id: string;
  checkAudiencePresentInOrg?: boolean;
  search: string;
  setSearch: (value: string) => void;
  selectedRoleRef: React.MutableRefObject<any>;
  isOpen: boolean;
  placeholderText: string;
  roleOptions?: Array<{ label: string; value: string }>;
  inputArrayList: ArrayListOption[];
  setInputArrayList: React.Dispatch<React.SetStateAction<ArrayListOption[]>>;
  showValidationError: boolean;
  setShowValidationError: React.Dispatch<React.SetStateAction<boolean>>;
  validationErrorText?: string;
  onValidateAndAdd: (value: string) => void;
  optionsList?: { value: string; label: string; color?: string }[];
  onSelectOption?: (option: { value: string; label: string; color?: string }) => void;
  selectOnlyFromList?: boolean;
  transformLabel?: (label: string) => string;
};

export const KEY_CODES = {
  BACKSPACE: 'Backspace',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  COMMA: ',',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
};

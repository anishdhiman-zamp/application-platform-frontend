export type SharePagePopupPropsType = {
  isOpen: boolean;
  onClose?: () => void;
  pageId: string;
};

export type PageAccessToAudiencesPropsType = {
  name?: string;
  resource_type: string;
  privilege?: string;
};

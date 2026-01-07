export enum SectionType {
  Skills = 'skills',
}

export interface ChatContextType {
  resetToDefault: () => void;
  chatTitle: string;
  setChatTitle: (title: string) => void;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  startNewChat: () => void;
  chatKey: number;
  setInitialConversationId: (id: string | null) => void;
}

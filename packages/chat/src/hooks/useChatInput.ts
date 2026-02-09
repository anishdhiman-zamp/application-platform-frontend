'use client';

import { formatPlural } from '@zamp-platform/utils';
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ActionType, Block, BLOCK_TYPE, ButtonBlockType } from '../types/block.types';
import {
  AnnotationType,
  ChatMessage,
  ChatMessageType,
  LocationData,
  ResourceType,
  ScopeType,
  SenderType,
} from '../types/chat.types';
import { MultipleFileUploadResult } from '../utils/fileUpload';
import { useChat } from './useChat';

export interface UploadedFile {
  file_id: string;
  file_name: string;
  file_type: string;
  file: File;
}

export interface MessageAttachment {
  file_id: string;
  file_name: string;
}

export interface ChatInputAdapter {
  getCurrentUserName: () => string;
  getResourceId: () => string;
  getScopeId: () => string;
  uploadFiles: (files: FileList) => Promise<MultipleFileUploadResult>;
  disableInteraction?: (params: {
    conversationId: string;
    messageId: string;
    resourceId: string;
    resourceType: ResourceType;
  }) => Promise<void>;
  onError?: (error: unknown) => void;
  onSuccess?: (message: string) => void;
}

export interface UseChatInputProps {
  chat: ReturnType<typeof useChat>;
  annotationLocation?: LocationData;
  conversationId?: string;
  setHeader?: (header: string) => void;
  scope?: ScopeType;
  externalInputValue?: string;
  setExternalInputValue?: Dispatch<SetStateAction<string>>;
  adapter: ChatInputAdapter;
  minTextareaHeight?: number;
  maxTextareaHeight?: number;
  resourceType?: ResourceType;
  annotationType?: AnnotationType;
  onConversationCreated?: (conversationId: string) => void;
  isDisabled?: boolean;
}

export interface UseChatInputReturn {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  handleSubmit: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  attachments: UploadedFile[];
  handleFileSelect: (files: FileList | null) => Promise<void>;
  removeAttachment: (fileId: string) => void;
  isUploading: boolean;
  firstMessage: string;
  setFirstMessage: Dispatch<SetStateAction<string>>;
  isSubmitDisabled: boolean;
}

/**
 * Creates a user message payload for chat
 */
export const createUserMessagePayload = (
  inputValue: string,
  resourceId: string,
  resourceType: ResourceType,
  senderName: string,
  attachments?: MessageAttachment[],
): ChatMessage => {
  return {
    resource_id: resourceId,
    resource_type: resourceType,
    message_content: {
      text: inputValue,
      text_type: 'plain_text',
      elements: [
        {
          id: `m_txt_${Date.now()}`,
          type: BLOCK_TYPE.PLAIN_TEXT,
          order: 0,
          payload: {
            text: inputValue,
          },
        },
      ] as Block[],
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    },
    message_type: ChatMessageType.TEXT,
    sender_type: SenderType.USER,
    timestamp: new Date().toISOString(),
    metadata: {},
    sender_name: senderName,
  };
};

/**
 * Creates a conversation payload for initial conversation creation
 */
export const createConversationPayload = (
  resourceId: string,
  resourceType: ResourceType,
  scopeId: string,
  messageText: string,
  senderName: string,
  attachments?: MessageAttachment[],
  scope = ScopeType.ACTIVITY_RUN,
  annotationLocation?: LocationData,
  annotationType?: AnnotationType,
) => {
  return {
    resource_id: resourceId,
    resource_type: resourceType,
    scope_type: scope,
    scope_id: scope === ScopeType.ACTIVITY_RUN ? scopeId : resourceId,
    annotation_type: annotationType,
    message_content: {
      text: messageText,
      text_type: 'plain_text',
      elements: [
        {
          id: 'm_txt_001',
          type: BLOCK_TYPE.PLAIN_TEXT,
          order: 0,
          payload: {
            text: messageText,
          },
        },
      ] as Block[],
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    },
    ...(annotationLocation && {
      annotation_data: {
        location: annotationLocation,
      },
    }),
    sender_name: senderName,
  };
};

const KEYBOARD_KEY_ENTER = 'Enter';
const DEFAULT_MIN_TEXTAREA_HEIGHT = 20;
const DEFAULT_MAX_TEXTAREA_HEIGHT = 200;

/**
 * Hook to manage chat input state and behavior
 * Uses injectable adapter for app-specific functionality
 */
export const useChatInput = ({
  chat,
  annotationLocation,
  conversationId,
  setHeader,
  scope = ScopeType.ACTIVITY_RUN,
  externalInputValue,
  setExternalInputValue,
  resourceType = ResourceType.PROCESS,
  adapter,
  minTextareaHeight = DEFAULT_MIN_TEXTAREA_HEIGHT,
  maxTextareaHeight = DEFAULT_MAX_TEXTAREA_HEIGHT,
  annotationType,
  onConversationCreated,
  isDisabled,
}: UseChatInputProps): UseChatInputReturn => {
  const currentUserName = adapter.getCurrentUserName();
  const resourceId = adapter.getResourceId();
  const scopeId = adapter.getScopeId();

  const [internalValue, setInternalValue] = useState('');

  const hasExternalControl = externalInputValue !== undefined && setExternalInputValue !== undefined;
  const value = hasExternalControl ? externalInputValue : internalValue;

  const setValue = useCallback(
    (newValue: SetStateAction<string>) => {
      if (hasExternalControl && setExternalInputValue) {
        setExternalInputValue(newValue);
      } else {
        setInternalValue(newValue);
      }
    },
    [hasExternalControl, setExternalInputValue],
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [firstMessage, setFirstMessage] = useState('');

  const isSubmitDisabled = useMemo(() => isDisabled || isUploading || !value.trim(), [isDisabled, isUploading, value]);

  const init = async () => {
    const payload = createConversationPayload(
      resourceId,
      resourceType,
      scopeId,
      firstMessage || 'Hello, how are you?',
      currentUserName || '',
      attachments.length > 0
        ? attachments.map((att) => ({ file_id: att.file_id, file_name: att.file_name }))
        : undefined,
      scope,
      annotationLocation,
      annotationType,
    );

    setAttachments([]);
    const response = await chat.createConversationV2(payload);

    if (!response?.conversation_id) {
      throw new Error('Failed to create conversation');
    }

    onConversationCreated?.(response.conversation_id);
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const uploadingFiles = Array.from(files).map((file) => ({
      file_id: '',
      file_name: file.name,
      file_type: file.type,
      file: file,
    }));

    setIsUploading(true);
    setAttachments((prev) => [...prev, ...uploadingFiles]);

    const { successful, failed } = await adapter.uploadFiles(files);

    const failedFileNames = new Set(failed.map((f) => f.file.name));

    setAttachments((prev) => {
      const tempEntriesMap = new Map<string, number>();

      prev.forEach((item, index) => {
        if (item.file_id === '' && !tempEntriesMap.has(item.file_name)) {
          tempEntriesMap.set(item.file_name, index);
        }
      });

      const updated = prev.filter((att) => {
        if (att.file_id !== '') return true;
        if (failedFileNames.has(att.file_name)) return false;
        return true;
      });

      const updatedTempEntriesMap = new Map<string, number>();
      updated.forEach((item, index) => {
        if (item.file_id === '' && !updatedTempEntriesMap.has(item.file_name)) {
          updatedTempEntriesMap.set(item.file_name, index);
        }
      });

      successful.forEach((newAttachment) => {
        const index = updatedTempEntriesMap.get(newAttachment.file_name);

        if (index !== undefined) {
          updated[index] = newAttachment;
        } else {
          updated.push(newAttachment);
        }
      });

      return updated;
    });

    if (!!failed?.length) {
      const failedNames = failed.map((f) => f?.file?.name).join(', ');
      adapter.onError?.(new Error(`Failed to upload ${formatPlural(failed.length, 'file')}: ${failedNames}`));
    }

    setIsUploading(false);
  };

  const removeAttachment = (fileId: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.file_id !== fileId));
  };

  const handleSubmit = () => {
    if (value.trim()) {
      setValue('');
    }

    if (!firstMessage && !conversationId) {
      setFirstMessage(value);
      setHeader?.('Analysing...');
      return;
    }

    handleSendMessage(value);
  };

  const handleSendMessage = async (inputValue: string) => {
    if (!inputValue.trim()) return;

    const messagePayload = createUserMessagePayload(
      inputValue,
      resourceId,
      resourceType,
      currentUserName || '',
      attachments.length > 0
        ? attachments.map((att) => ({ file_id: att.file_id, file_name: att.file_name }))
        : undefined,
    );

    setValue('');
    setAttachments([]);

    const lastMessage = chat.messages[chat.messages.length - 1];
    let messageId = '';

    if (lastMessage?.message_content?.elements) {
      for (const element of lastMessage.message_content.elements) {
        if (
          element?.type === BLOCK_TYPE.BUTTON &&
          (element as ButtonBlockType)?.action?.type === ActionType.INTERNAL_API
        ) {
          messageId = lastMessage.id || '';
        }
      }
    }

    try {
      if (messageId && adapter.disableInteraction) {
        adapter.disableInteraction({
          conversationId: conversationId || '',
          messageId: messageId,
          resourceId: resourceId,
          resourceType: resourceType,
        });
      }
      await chat.sendMessage(messagePayload, true);
    } catch (error) {
      adapter.onError?.(error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === KEYBOARD_KEY_ENTER && !e.shiftKey && !isSubmitDisabled) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    // Reset height to minimum to calculate new height
    textarea.style.height = `${minTextareaHeight}px`;

    // Only expand if there's actual content
    if (value.trim()) {
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minTextareaHeight), maxTextareaHeight);

      textarea.style.height = `${newHeight}px`;
    }
  }, [value, minTextareaHeight, maxTextareaHeight]);

  useEffect(() => {
    if (firstMessage && !conversationId) {
      init();
    }
  }, [firstMessage, conversationId]);

  return {
    value,
    setValue,
    handleSubmit,
    textareaRef,
    handleKeyDown,
    attachments,
    handleFileSelect,
    removeAttachment,
    isUploading,
    firstMessage,
    setFirstMessage,
    isSubmitDisabled,
  };
};

export default useChatInput;

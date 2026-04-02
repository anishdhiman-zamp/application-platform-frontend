'use client';

import {
  ActionType,
  type AnnotationType,
  BLOCK_TYPE,
  type ButtonBlockType,
  type ChatInputAdapter,
  type ChatMessage,
  createConversationPayload,
  createUserMessagePayload,
  handleFilesystemUploads,
  type LocationData,
  ResourceType,
  sanitizeFileName,
  ScopeType,
  type UploadedFile,
} from '@zamp-platform/chat';
import { formatPlural } from '@zamp-platform/utils';
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ConversationActions } from '../provider/ConversationActionsContext';

/**
 * Slim interface — only what useChatInput actually needs from the conversation.
 * Breaks the tight coupling with the full useChat return type.
 */
export interface ChatInputActions {
  sendMessage: ConversationActions['sendMessage'];
  createConversationV2: ConversationActions['createConversationV2'];
  messages: ChatMessage[];
}

export interface UseChatInputProps {
  chatActions: ChatInputActions;
  annotationLocation?: LocationData;
  conversationId?: string;
  setHeader?: (header: string) => void;
  scope?: ScopeType;
  externalInputValue?: string;
  setExternalInputValue?: Dispatch<SetStateAction<string>>;
  adapter: ChatInputAdapter;
  resourceType?: ResourceType;
  annotationType?: AnnotationType;
  onConversationCreated?: (conversationId: string) => void;
  isDisabled?: boolean;
  llmModel?: string | null;
}

export interface UseChatInputReturn {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  handleSubmit: () => void;
  fileReferences: UploadedFile[];
  handleFileSelect: (files: FileList | null) => Promise<void>;
  removeFileReference: (fileId: string) => void;
  addFileReference: (ref: { path: string; name: string }) => void;
  isUploading: boolean;
  firstMessage: string;
  setFirstMessage: Dispatch<SetStateAction<string>>;
  isSubmitDisabled: boolean;
}

export const useChatInput = ({
  chatActions,
  annotationLocation,
  conversationId,
  setHeader,
  scope = ScopeType.ACTIVITY_RUN,
  externalInputValue,
  setExternalInputValue,
  resourceType = ResourceType.PROCESS,
  adapter,
  annotationType,
  onConversationCreated,
  isDisabled,
  llmModel,
}: UseChatInputProps): UseChatInputReturn => {
  const prevConversationIdRef = useRef(conversationId);
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

  const [fileReferences, setFileReferences] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [firstMessage, setFirstMessage] = useState('');
  const externalFilePathsRef = useRef<Set<string>>(new Set());

  const isSubmitDisabled = useMemo(() => isDisabled || isUploading || !value.trim(), [isDisabled, isUploading, value]);

  const init = async () => {
    const payload = createConversationPayload(
      resourceId,
      resourceType,
      scopeId,
      firstMessage || 'Hello, how are you?',
      currentUserName || '',
      fileReferences.length > 0 ? fileReferences.map((ref) => ({ path: ref.path, name: ref.name })) : undefined,
      scope,
      annotationLocation,
      annotationType,
      llmModel,
    );

    setFileReferences([]);
    const response = await chatActions.createConversationV2(payload);

    if (!response?.conversation_id) {
      throw new Error('Failed to create conversation');
    }

    onConversationCreated?.(response.conversation_id);
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const username = adapter.getUsername();
    if (!username) {
      adapter.onError?.(new Error('Username is required for file uploads'));
      return;
    }

    const uploadingFiles = Array.from(files).map((file) => ({
      path: '',
      name: sanitizeFileName(file.name),
      file_type: file.type,
      file: file,
    }));

    setIsUploading(true);
    setFileReferences((prev) => [...prev, ...uploadingFiles]);

    const { successful, failed } = await handleFilesystemUploads(files, username, adapter.uploadMutations);
    const failedFileNames = new Set(failed.map((f) => sanitizeFileName(f.file.name)));

    setFileReferences((prev) => {
      const updated = prev.filter((att) => {
        if (att.path !== '') return true;
        if (failedFileNames.has(att.name)) return false;
        return true;
      });

      const updatedTempEntriesMap = new Map<string, number>();
      updated.forEach((item, index) => {
        if (item.path === '' && !updatedTempEntriesMap.has(item.name)) {
          updatedTempEntriesMap.set(item.name, index);
        }
      });

      successful.forEach((uploadedFile) => {
        const index = updatedTempEntriesMap.get(uploadedFile.name);
        if (index !== undefined) {
          updated[index] = uploadedFile;
        } else {
          updated.push(uploadedFile);
        }
      });

      return updated;
    });

    if (failed?.length) {
      const failedNames = failed.map((f) => f?.file?.name).join(', ');
      adapter.onError?.(new Error(`Failed to upload ${formatPlural(failed.length, 'file')}: ${failedNames}`));
    }

    setIsUploading(false);
  };

  const removeFileReference = useCallback(
    (fileId: string) => {
      setFileReferences((prev) => prev.filter((ref) => ref.path !== fileId));
      const isExternalFile = externalFilePathsRef.current.has(fileId);
      if (isExternalFile) {
        externalFilePathsRef.current.delete(fileId);
      } else if (fileId) {
        adapter.deleteFileMutation.deleteFile({ path: fileId }).catch((error) => {
          adapter.onError?.(error);
        });
      }
    },
    [adapter],
  );

  const addFileReference = useCallback((ref: { path: string; name: string }) => {
    setFileReferences((prev) => {
      const exists = prev.some((existing) => existing.path === ref.path);
      if (exists) return prev;
      externalFilePathsRef.current.add(ref.path);
      return [...prev, { path: ref.path, name: ref.name, file_type: '', file: new File([], ref.name) }];
    });
  }, []);

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    setValue('');

    if (!firstMessage && !conversationId) {
      setFirstMessage(trimmedValue);
      setHeader?.('Analysing...');
      return;
    }

    handleSendMessage(trimmedValue);
  };

  const handleSendMessage = async (inputValue: string) => {
    if (!inputValue) return;

    const messagePayload = createUserMessagePayload(
      inputValue,
      resourceId,
      resourceType,
      currentUserName || '',
      fileReferences.length > 0 ? fileReferences.map((ref) => ({ path: ref.path, name: ref.name })) : undefined,
      llmModel,
    );

    setFileReferences([]);

    // Check for INTERNAL_API buttons on last message
    const lastMessage = chatActions.messages[chatActions.messages.length - 1];
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
          messageId,
          resourceId,
          resourceType,
        });
      }
      await chatActions.sendMessage(messagePayload);
    } catch (error) {
      adapter.onError?.(error);
    }
  };

  useEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId;
      setFirstMessage('');
    }
  }, [conversationId]);

  useEffect(() => {
    if (firstMessage && !conversationId) {
      init();
    }
  }, [firstMessage, conversationId]);

  return {
    value,
    setValue,
    handleSubmit,
    fileReferences,
    handleFileSelect,
    removeFileReference,
    addFileReference,
    isUploading,
    firstMessage,
    setFirstMessage,
    isSubmitDisabled,
  };
};

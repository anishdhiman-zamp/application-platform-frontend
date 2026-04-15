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
import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
  externalFileReferences?: UploadedFile[];
  setExternalFileReferences?: Dispatch<SetStateAction<UploadedFile[]>>;
  externalFilePathsRef?: RefObject<Set<string>>;
  adapter: ChatInputAdapter;
  resourceType?: ResourceType;
  annotationType?: AnnotationType;
  onConversationCreated?: (conversationId: string) => void;
  isDisabled?: boolean;
  llmModel?: string | null;
  autoLoopEnabled?: boolean;
  metadata?: Record<string, unknown>;
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
  externalFileReferences,
  setExternalFileReferences,
  externalFilePathsRef: externalFilePathsRefProp,
  resourceType = ResourceType.PROCESS,
  adapter,
  annotationType,
  onConversationCreated,
  isDisabled,
  llmModel,
  autoLoopEnabled,
  metadata,
}: UseChatInputProps): UseChatInputReturn => {
  const prevConversationIdRef = useRef(conversationId);
  const fileReferencesRef = useRef<UploadedFile[]>([]);
  const internalFilePathsRef = useRef<Set<string>>(new Set());

  const currentUserName = adapter.getCurrentUserName();
  const resourceId = adapter.getResourceId();
  const scopeId = adapter.getScopeId();

  const [internalValue, setInternalValue] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [firstMessage, setFirstMessage] = useState('');
  const [pendingInit, setPendingInit] = useState(false);
  const [internalFileReferences, setInternalFileReferences] = useState<UploadedFile[]>([]);

  const hasExternalControl = externalInputValue !== undefined && setExternalInputValue !== undefined;
  const value = hasExternalControl ? externalInputValue : internalValue;

  const hasExternalFileControl = externalFileReferences !== undefined && setExternalFileReferences !== undefined;
  const fileReferences = hasExternalFileControl ? externalFileReferences : internalFileReferences;
  const externalFilePathsRef = externalFilePathsRefProp ?? internalFilePathsRef;

  const isSubmitDisabled = useMemo(
    () => isDisabled || isUploading || (!value.trim() && fileReferences.length === 0),
    [isDisabled, isUploading, value, fileReferences],
  );

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

  const setFileReferences = useCallback(
    (newValue: SetStateAction<UploadedFile[]>) => {
      if (hasExternalFileControl && setExternalFileReferences) {
        setExternalFileReferences(newValue);
      } else {
        setInternalFileReferences(newValue);
      }
    },
    [hasExternalFileControl, setExternalFileReferences],
  );

  const removeFileReference = useCallback(
    (fileId: string) => {
      setFileReferences((prev) => prev.filter((ref) => ref.path !== fileId));
      const isExternalFile = externalFilePathsRef.current.has(fileId);
      if (isExternalFile) {
        externalFilePathsRef.current.delete(fileId);
      } else if (fileId) {
        const parentDir = fileId.substring(0, fileId.lastIndexOf('/'));

        adapter.deleteFileMutation.deleteFile({ path: parentDir || fileId }).catch((error) => {
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
      return [
        ...prev,
        { id: crypto.randomUUID(), path: ref.path, name: ref.name, file_type: '', file: new File([], ref.name) },
      ];
    });
  }, []);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const username = adapter.getUsername();
      if (!username) {
        adapter.onError?.(new Error('Username is required for file uploads'));
        return;
      }

      const uploadingFiles = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
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
            updated[index] = { ...uploadedFile, id: updated[index].id };
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
    },
    [adapter],
  );

  const handleSendMessage = useCallback(
    async (inputValue: string) => {
      if (!inputValue && fileReferences.length === 0) return;

      const messagePayload = createUserMessagePayload(
        inputValue,
        resourceId,
        resourceType,
        currentUserName || '',
        fileReferences.length > 0 ? fileReferences.map((ref) => ({ path: ref.path, name: ref.name })) : undefined,
        llmModel,
        metadata,
        autoLoopEnabled,
      );

      setFileReferences([]);

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
    },
    [
      adapter,
      chatActions,
      conversationId,
      currentUserName,
      fileReferences,
      resourceId,
      resourceType,
      llmModel,
      autoLoopEnabled,
    ],
  );

  const init = async () => {
    const currentFileRefs = fileReferencesRef.current;
    const payload = createConversationPayload(
      resourceId,
      resourceType,
      scopeId,
      firstMessage || '',
      currentUserName || '',
      currentFileRefs.length > 0 ? currentFileRefs.map((ref) => ({ path: ref.path, name: ref.name })) : undefined,
      scope,
      annotationLocation,
      annotationType,
      llmModel,
      undefined,
      autoLoopEnabled,
    );

    setFileReferences([]);
    const response = await chatActions.createConversationV2(payload);

    if (!response?.conversation_id) {
      throw new Error('Failed to create conversation');
    }

    onConversationCreated?.(response.conversation_id);
  };

  const handleSubmit = useCallback(() => {
    const trimmedValue = value.trim();
    if (!trimmedValue && fileReferences.length === 0) return;

    setValue('');

    if (!firstMessage && !conversationId) {
      if (trimmedValue) {
        setFirstMessage(trimmedValue);
      } else {
        setPendingInit(true);
      }
      setHeader?.('Analysing...');
      return;
    }

    handleSendMessage(trimmedValue);
  }, [value, fileReferences, firstMessage, conversationId, setValue, setHeader, handleSendMessage]);

  useEffect(() => {
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId;
      setFirstMessage('');
      setPendingInit(false);
      setFileReferences([]);
      externalFilePathsRef.current.clear();
    }
  }, [conversationId]);

  useEffect(() => {
    if (firstMessage && !conversationId) {
      init();
    }
  }, [firstMessage, conversationId]);

  useEffect(() => {
    if (pendingInit && !conversationId) {
      setPendingInit(false);
      init();
    }
  }, [pendingInit, conversationId]);

  // Keep ref in sync so init() always reads the latest file references regardless of closure timing
  useEffect(() => {
    fileReferencesRef.current = fileReferences;
  }, [fileReferences]);

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

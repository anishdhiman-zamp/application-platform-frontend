import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { captureException } from '@sentry/nextjs';
import { ActionType, BLOCK_TYPE, LocationData, ResourceType, ScopeType, useChat } from '@zamp-platform/chat';
import { toast } from '@zamp-platform/ui';
import {
  createConversationPayload,
  createUserMessagePayload,
  handleFileUploadsWithMutation,
  UploadedFile,
  wrapPostFormsSignedUploadAck,
} from 'modules/chatbot/utils';
import { MAX_TEXTAREA_HEIGHT } from 'modules/process/process.constant';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { usePostFormsSignedUploadAckMutation } from '@/apis/dataset';
import { useGetSignedUrlMutation } from '@/apis/fileUpload';
import { usePostInteractionDisableMutation } from '@/apis/interaction';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { RootState } from '@/store';

interface UseChatInputProps {
  chat: ReturnType<typeof useChat>;
  annotationLocation?: LocationData;
  conversationId?: string;
  setHeader?: (header: string) => void;
  scope?: ScopeType;
  externalInputValue?: string;
  setExternalInputValue?: Dispatch<SetStateAction<string>>;
  resourceType?: ResourceType;
}

const useChatInput = ({
  chat,
  annotationLocation,
  conversationId,
  setHeader,
  scope = ScopeType.ACTIVITY_RUN,
  externalInputValue,
  setExternalInputValue,
  resourceType = ResourceType.PROCESS,
}: UseChatInputProps) => {
  const currentUserName = useSelector((state: RootState) => state?.user?.user?.user_name);
  const params = useParams();
  const processId = params?.processId as string;
  const activityRunId = params?.activityId as string;

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

  const [getSignedUrl] = useGetSignedUrlMutation();
  const [postFormsSignedUploadAck] = usePostFormsSignedUploadAckMutation();
  const [postInteractionDisable] = usePostInteractionDisableMutation();

  const init = async () => {
    const payload = createConversationPayload(
      processId,
      activityRunId,
      resourceType,
      firstMessage || 'Hello, how are you?',
      currentUserName || '',
      attachments.length > 0
        ? attachments.map((att) => ({ file_id: att.file_id, file_name: att.file_name }))
        : undefined,
      scope,
      annotationLocation,
    );

    setAttachments([]);
    const response = await chat.createConversationV2(payload);

    if (!response?.conversation_id) {
      throw new Error('Failed to create conversation');
    }
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

    try {
      const newAttachments = await handleFileUploadsWithMutation(
        files,
        getSignedUrl,
        API_ENDPOINTS.FORMS_SIGNED_UPLOAD_URL_POST,
        wrapPostFormsSignedUploadAck(postFormsSignedUploadAck),
      );

      const tempEntriesMap = new Map<string, number>();

      setAttachments((prev) => {
        prev.forEach((item, index) => {
          if (item.file_id === '' && !tempEntriesMap.has(item.file_name)) {
            tempEntriesMap.set(item.file_name, index);
          }
        });

        const updated = [...prev];

        newAttachments.forEach((newAttachment) => {
          const index = tempEntriesMap.get(newAttachment.file_name);

          if (index !== undefined) {
            updated[index] = newAttachment;
          } else {
            updated.push(newAttachment);
          }
        });

        return updated;
      });
      toast.success('Files uploaded successfully');
    } catch (error) {
      captureException(error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
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
      processId,
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
        if (element?.type === BLOCK_TYPE.BUTTON && element?.action?.type === ActionType.INTERNAL_API) {
          messageId = lastMessage.id || '';
        }
      }
    }

    try {
      if (messageId) {
        postInteractionDisable({
          conversationId: conversationId || '',
          messageId: messageId,
          params: {
            resource_id: processId,
            resource_type: ResourceType.PROCESS,
          },
        });
      }
      await chat.sendMessage(messagePayload, true);
    } catch (error) {
      captureException(error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === KEYBOARD_KEYS.ENTER && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    // Reset height to calculate new height
    textarea.style.height = '20px';

    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(scrollHeight, MAX_TEXTAREA_HEIGHT);

    textarea.style.height = `${newHeight}px`;
  }, [value]);

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
  };
};

export default useChatInput;

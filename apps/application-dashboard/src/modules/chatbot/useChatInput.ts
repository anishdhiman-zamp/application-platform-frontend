import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { captureException } from '@sentry/nextjs';
import { useChat } from '@zamp-platform/chat';
import { toast } from '@zamp-platform/ui';
import {
  createConversationPayload,
  createUserMessagePayload,
  handleFileUploadsWithMutation,
  UploadedFile,
} from 'modules/chatbot/utils';
import { MAX_TEXTAREA_HEIGHT } from 'modules/process/process.constant';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { useGetSignedUrlMutation } from '@/apis/fileUpload';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import { RootState } from '@/store';
import { LocationData } from '@/types/api/feedbacks.types';

interface UseChatInputProps {
  chat: ReturnType<typeof useChat>;
  annotationLocation: LocationData;
  setIsLoading: (isLoading: boolean) => void;
  conversationId?: string;
  setHeader?: (header: string) => void;
}

const useChatInput = ({ chat, annotationLocation, setIsLoading, conversationId, setHeader }: UseChatInputProps) => {
  const currentUserEmail = useSelector((state: RootState) => state?.user?.user?.user_email);
  const params = useParams();
  const processId = params?.processId as string;
  const activityRunId = params?.activityId as string;

  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [firstMessage, setFirstMessage] = useState('');

  const [getSignedUrl] = useGetSignedUrlMutation();

  const init = async () => {
    const payload = createConversationPayload(
      processId,
      activityRunId,
      firstMessage || 'Hello, how are you?',
      annotationLocation,
      currentUserEmail || '',
      attachments.length > 0 ? attachments.map((att) => ({ file_id: att.file_id })) : undefined,
    );

    const response = await chat.createConversationV2(payload);

    setIsLoading(true);

    if (!response?.conversation_id) {
      throw new Error('Failed to create conversation');
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newAttachments = await handleFileUploadsWithMutation(
        files,
        getSignedUrl,
        API_ENDPOINTS.FORMS_SIGNED_UPLOAD_URL_POST,
      );

      setAttachments((prev) => [...prev, ...newAttachments]);
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
    setIsLoading(true);
    if (value.trim()) {
      setValue('');
    }
    if (!firstMessage && !conversationId) {
      setFirstMessage(value);
      setHeader?.('Analysing...');
      setAttachments([]);

      return;
    }
    handleSendMessage(value);
    setAttachments([]);
  };

  const handleSendMessage = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    setTimeout(() => {
      setIsLoading(true);
    }, 500);

    const messagePayload = createUserMessagePayload(
      inputValue,
      processId,
      currentUserEmail || '',
      attachments.length > 0 ? attachments.map((att) => ({ file_id: att.file_id })) : undefined,
    );

    setValue('');

    try {
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

'use client';

import { toast } from '@zamp-platform/ui';
import { useCallback, useRef } from 'react';

import useChatAdapters from '../../../hooks/useChatAdapters';
import { MicrophoneState } from '../../../hooks/useMicrophoneRecorder';
import { useTranscription } from '../../../hooks/useTranscription';
import { SOCKET_STATES } from '../../../types/transcription.types';

interface UseRecordingParams {
  username: string;
  value: string;
  onChange: (value: string) => void;
}

interface UseRecordingReturn {
  isRecording: boolean;
  shouldShowRecorder: boolean;
  isPreparingToRecord: boolean;
  microphone: ReturnType<typeof useTranscription>['microphone'];
  isCommitting: boolean;
  microphoneDisabled: boolean;
  handleStartRecording: () => Promise<void>;
  handleAcceptRecording: () => void;
  handleRejectRecording: () => void;
}

export const useRecording = ({ username, value, onChange }: UseRecordingParams): UseRecordingReturn => {
  const isRejectingRef = useRef(false);
  const transcriptInsertionIndexRef = useRef(-1);
  const valueRef = useRef(value);
  valueRef.current = value;

  const getEmptyString = useCallback(() => '', []);
  const getUsername = useCallback(() => username, [username]);
  const handleAdapterError = useCallback((error: unknown) => {
    toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
  }, []);

  const { transcriptionAdapter } = useChatAdapters({
    getCurrentUserName: getEmptyString,
    getResourceId: getEmptyString,
    getScopeId: getEmptyString,
    getUsername,
    onError: handleAdapterError,
  });

  const handleTranscriptChunk = useCallback(
    (chunk: string) => {
      if (isRejectingRef.current) return;
      const current = valueRef.current;
      if (transcriptInsertionIndexRef.current === -1) {
        transcriptInsertionIndexRef.current = current.length > 0 ? current.length + 1 : 0;
      }
      onChange(current ? `${current} ${chunk}` : chunk);
    },
    [onChange],
  );

  const { isRecording, startRecording, stopRecording, microphoneState, connectionState, microphone, isCommitting } =
    useTranscription({
      adapter: transcriptionAdapter,
      onTranscriptChunk: handleTranscriptChunk,
    });

  const shouldShowRecorder = isRecording && connectionState === SOCKET_STATES.open;
  const isPreparingToRecord = isRecording && connectionState !== SOCKET_STATES.open;

  const handleStartRecording = useCallback(async () => {
    if (microphoneState === MicrophoneState.Error) {
      toast.error('Microphone unavailable. Please check browser permissions and try again.');
      return;
    }
    isRejectingRef.current = false;
    transcriptInsertionIndexRef.current = -1;
    await startRecording();
  }, [microphoneState, startRecording]);

  const handleAcceptRecording = useCallback(() => {
    try {
      stopRecording();
    } catch {
      toast.error('Failed to stop recording. Please try again.');
    }
  }, [stopRecording]);

  const handleRejectRecording = useCallback(() => {
    try {
      isRejectingRef.current = true;
      const insertIdx = transcriptInsertionIndexRef.current;
      if (insertIdx !== -1) {
        onChange(valueRef.current.slice(0, insertIdx).trim());
      }
      transcriptInsertionIndexRef.current = -1;
      stopRecording();
    } catch {
      toast.error('Failed to stop recording. Please try again.');
    }
  }, [stopRecording, onChange]);

  return {
    isRecording,
    shouldShowRecorder,
    isPreparingToRecord,
    microphone,
    isCommitting,
    microphoneDisabled: microphoneState === MicrophoneState.SettingUp,
    handleStartRecording,
    handleAcceptRecording,
    handleRejectRecording,
  };
};

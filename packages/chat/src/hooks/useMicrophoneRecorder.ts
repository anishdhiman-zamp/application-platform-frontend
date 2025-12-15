'use client';

import { useCallback, useRef, useState } from 'react';

export enum MicrophoneEvents {
  DataAvailable = 'dataavailable',
  Error = 'error',
  Pause = 'pause',
  Resume = 'resume',
  Start = 'start',
  Stop = 'stop',
}

export enum MicrophoneState {
  NotSetup = -1,
  SettingUp = 0,
  Ready = 1,
  Opening = 2,
  Open = 3,
  Error = 4,
  Pausing = 5,
  Paused = 6,
}

export interface UseMicrophoneRecorderOptions {
  onError?: (error: unknown) => void;
}

export interface UseMicrophoneRecorderReturn {
  microphone: MediaRecorder | null;
  startMicrophone: () => void;
  stopMicrophone: () => void;
  setupMicrophone: () => Promise<void>;
  microphoneState: MicrophoneState;
}

/**
 * Hook to manage microphone recording using MediaRecorder API
 */
export const useMicrophoneRecorder = (options?: UseMicrophoneRecorderOptions): UseMicrophoneRecorderReturn => {
  const [microphoneState, setMicrophoneState] = useState<MicrophoneState>(MicrophoneState.NotSetup);
  const [microphone, setMicrophone] = useState<MediaRecorder | null>(null);

  // Store onError in a ref to avoid dependency issues
  const onErrorRef = useRef(options?.onError);
  onErrorRef.current = options?.onError;

  // Initialize microphone with user media permissions and audio constraints
  const setupMicrophone = useCallback(async () => {
    if (microphoneState === MicrophoneState.Ready || microphone) return;
    setMicrophoneState(MicrophoneState.SettingUp);
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression: true, echoCancellation: true },
      });
      const mic = new MediaRecorder(userMedia);

      setMicrophone(mic);
      setMicrophoneState(MicrophoneState.Ready);
    } catch (error) {
      onErrorRef.current?.(error);
      setMicrophoneState(MicrophoneState.Error);
      throw error;
    }
  }, [microphone, microphoneState]);

  // Start recording audio in 250ms chunks
  const startMicrophone = useCallback(() => {
    if (!microphone || microphone.state === 'recording') return;
    setMicrophoneState(MicrophoneState.Opening);
    microphone.start(250);
    setMicrophoneState(MicrophoneState.Open);
  }, [microphone]);

  // Stop recording and release microphone resources
  const stopMicrophone = useCallback(() => {
    if (!microphone) return;
    setMicrophoneState(MicrophoneState.Pausing);

    try {
      if (microphone.state === 'recording' || microphone.state === 'paused') {
        microphone.stop();
      }
      // Release all media tracks
      microphone.stream.getTracks().forEach((t) => t.stop());
    } catch (error) {
      onErrorRef.current?.(error);
    } finally {
      setMicrophone(null);
      setMicrophoneState(MicrophoneState.NotSetup);
    }
  }, [microphone]);

  return { microphone, startMicrophone, stopMicrophone, setupMicrophone, microphoneState };
};

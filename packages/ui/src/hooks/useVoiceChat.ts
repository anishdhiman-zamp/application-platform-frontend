'use client';

import { ConnectionQuality, Room, RoomEvent, Track } from 'livekit-client';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  UseVoiceChatOptions,
  UseVoiceChatReturn,
  VoiceChatState,
  VoiceJoinRequest,
  VoiceTranscriptMessage,
} from '../types/voice-chat';
import { VOICE_CHAT_STATE } from '../types/voice-chat';

const BOT_AUDIO_ROOT_ID = 'livekit-bot-audio-root';

const ensureBotAudioRoot = (): HTMLDivElement => {
  let el = document.getElementById(BOT_AUDIO_ROOT_ID) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = BOT_AUDIO_ROOT_ID;
    el.setAttribute('aria-hidden', 'true');
    el.style.position = 'fixed';
    el.style.width = '0';
    el.style.height = '0';
    el.style.overflow = 'hidden';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
  }
  return el;
};

const removeBotAudioRootIfEmpty = (): void => {
  const el = document.getElementById(BOT_AUDIO_ROOT_ID);
  if (el && el.childElementCount === 0) {
    el.remove();
  }
};

const syncMicEnabled = (room: Room): boolean => {
  const pub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
  if (!pub) return false;
  return !pub.isMuted;
};

export const useVoiceChat = (options: UseVoiceChatOptions = {}): UseVoiceChatReturn => {
  const { botIdentity = 'bot', defaultSystemPrompt, fetchJoin } = options;

  // Refs
  const roomRef = useRef<Room | null>(null);
  const intentionalStopRef = useRef(false);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const defaultSystemPromptRef = useRef(defaultSystemPrompt);
  defaultSystemPromptRef.current = defaultSystemPrompt;

  // State
  const [state, setState] = useState<VoiceChatState>(VOICE_CHAT_STATE.Idle);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality | null>(null);
  const [userTranscript, setUserTranscript] = useState('');
  const [botTranscript, setBotTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);

  // Handlers
  const teardownRoom = useCallback(() => {
    const room = roomRef.current;
    roomRef.current = null;

    if (room) {
      room.removeAllListeners();
      room.disconnect();
    }

    audioElementsRef.current.forEach((el) => el.remove());
    audioElementsRef.current.clear();
    removeBotAudioRootIfEmpty();
  }, []);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    setState(VOICE_CHAT_STATE.Idle);
    setIsBotSpeaking(false);
    setConnectionQuality(null);
    teardownRoom();
  }, [teardownRoom]);

  const start = useCallback(
    async (opts?: { systemPrompt?: string }) => {
      if (opts?.systemPrompt !== undefined) {
        defaultSystemPromptRef.current = opts.systemPrompt;
      }

      if (roomRef.current) return;

      if (!fetchJoin) {
        throw new Error('fetchJoin option is required for useVoiceChat');
      }

      setError(null);
      setState(VOICE_CHAT_STATE.Connecting);
      intentionalStopRef.current = false;

      try {
        const systemPrompt = defaultSystemPromptRef.current;
        const body: VoiceJoinRequest = {
          transport_type: 'livekit',
          ...(systemPrompt !== undefined && { voice_config: { system_prompt: systemPrompt } }),
        };
        const { url, token } = await fetchJoin(body);

        const room = new Room({ dynacast: true });
        roomRef.current = room;

        room.on(RoomEvent.Connected, () => {
          setState(VOICE_CHAT_STATE.Ready);
          void room.localParticipant.setMicrophoneEnabled(true).catch((e) => {
            setError(e instanceof Error ? e : new Error(String(e)));
            setState(VOICE_CHAT_STATE.Error);
          });
        });

        room.on(RoomEvent.LocalTrackPublished, (publication) => {
          if (publication.kind !== Track.Kind.Audio) return;
          setIsMicEnabled(syncMicEnabled(room));
          setState(VOICE_CHAT_STATE.Active);
        });

        room.on(RoomEvent.TrackMuted, (pub, participant) => {
          if (participant.isLocal && pub.kind === Track.Kind.Audio) {
            setIsMicEnabled(false);
          }
        });

        room.on(RoomEvent.TrackUnmuted, (pub, participant) => {
          if (participant.isLocal && pub.kind === Track.Kind.Audio) {
            setIsMicEnabled(true);
          }
        });

        room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
          if (track.kind !== Track.Kind.Audio) return;
          const trackKey = track.sid ?? publication.trackSid;
          const root = ensureBotAudioRoot();
          const audioElement = track.attach() as HTMLAudioElement;
          audioElement.id =
            participant.identity === botIdentity ? 'livekit-bot-audio' : `livekit-remote-audio-${trackKey}`;
          audioElement.autoplay = true;
          root.appendChild(audioElement);
          audioElementsRef.current.set(trackKey, audioElement);
        });

        room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
          if (track.kind !== Track.Kind.Audio) return;
          const trackKey = track.sid ?? publication.trackSid;
          const el = audioElementsRef.current.get(trackKey);
          if (el) {
            track.detach().forEach((node) => node.remove());
            el.remove();
            audioElementsRef.current.delete(trackKey);
          }
          removeBotAudioRootIfEmpty();
        });

        room.on(RoomEvent.DataReceived, (payload) => {
          try {
            const message = JSON.parse(new TextDecoder().decode(payload)) as VoiceTranscriptMessage;
            if (message.type === 'user_transcript' && typeof message.text === 'string') {
              setUserTranscript(message.text);
            } else if (message.type === 'bot_transcript' && typeof message.text === 'string') {
              setBotTranscript(message.text);
            }
          } catch {
            /* ignore non-JSON */
          }
        });

        room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          const botSpeaking = speakers.some((p) => !p.isLocal && p.identity === botIdentity);
          setIsBotSpeaking(botSpeaking);
        });

        room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
          if (participant.isLocal) {
            setConnectionQuality(quality);
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          audioElementsRef.current.forEach((el) => el.remove());
          audioElementsRef.current.clear();
          removeBotAudioRootIfEmpty();
          roomRef.current = null;
          if (!intentionalStopRef.current) {
            setError(new Error('Disconnected'));
            setState(VOICE_CHAT_STATE.Error);
          } else {
            setState(VOICE_CHAT_STATE.Idle);
          }
          intentionalStopRef.current = false;
        });

        room.on(RoomEvent.MediaDevicesError, (e) => {
          setError(e);
          setState(VOICE_CHAT_STATE.Error);
        });

        await room.connect(url, token, {
          autoSubscribe: true,
        });
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        setState(VOICE_CHAT_STATE.Error);
        teardownRoom();
      }
    },
    [botIdentity, fetchJoin, teardownRoom],
  );

  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room || state !== VOICE_CHAT_STATE.Active) return;

    const enabled = syncMicEnabled(room);
    try {
      await room.localParticipant.setMicrophoneEnabled(!enabled);
      setIsMicEnabled(!enabled);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, [state]);

  const sendUserText = useCallback((text: string) => {
    const room = roomRef.current;
    if (!room) return;

    room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: 'user_input', text })), {
      reliable: true,
    });
  }, []);

  // Effects
  useEffect(() => {
    return () => {
      intentionalStopRef.current = true;
      teardownRoom();
    };
  }, [teardownRoom]);

  return {
    state,
    start,
    stop,
    toggleMic,
    isMicEnabled,
    isBotSpeaking,
    connectionQuality,
    userTranscript,
    botTranscript,
    error,
    sendUserText,
  };
};

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import type { UseVoiceChatReturn } from '../../types/voice-chat';
import { VOICE_CHAT_STATE } from '../../types/voice-chat';
import { VoiceChatButton } from '../ui/voice-chat-button';

function createVoice(overrides: Partial<UseVoiceChatReturn> = {}): UseVoiceChatReturn {
  return {
    state: VOICE_CHAT_STATE.Idle,
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn(),
    toggleMic: jest.fn().mockResolvedValue(undefined),
    isMicEnabled: true,
    isBotSpeaking: false,
    connectionQuality: null,
    userTranscript: '',
    botTranscript: '',
    error: null,
    sendUserText: jest.fn(),
    ...overrides,
  };
}

describe('VoiceChatButton', () => {
  it('starts voice when idle and primary control is activated', () => {
    const start = jest.fn().mockResolvedValue(undefined);
    const voice = createVoice({ start });
    render(<VoiceChatButton voiceChat={voice} systemPrompt='Hello' />);

    fireEvent.click(screen.getByRole('button', { name: /start voice chat/i }));
    expect(start).toHaveBeenCalledWith({ systemPrompt: 'Hello' });
  });

  it('stops voice when active', () => {
    const stop = jest.fn();
    const voice = createVoice({ state: VOICE_CHAT_STATE.Active, stop });
    render(<VoiceChatButton voiceChat={voice} />);

    fireEvent.click(screen.getByRole('button', { name: /end voice chat/i }));
    expect(stop).toHaveBeenCalled();
  });

  it('toggles microphone when active', () => {
    const toggleMic = jest.fn().mockResolvedValue(undefined);
    const voice = createVoice({ state: VOICE_CHAT_STATE.Active, toggleMic });
    render(<VoiceChatButton voiceChat={voice} />);

    fireEvent.click(screen.getByRole('button', { name: /mute microphone/i }));
    expect(toggleMic).toHaveBeenCalled();
  });
});

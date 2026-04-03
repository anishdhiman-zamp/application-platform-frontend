# Voice-to-Voice Pipeline - Clean Implementation Spec

## Overview

This spec covers only the backend voice contract and LiveKit integration. It excludes STT/TTS provider-specific implementations (Deepgram, ElevenLabs, etc.).

---

## 1. Backend API Contract

### 1.1 Voice Join (LiveKit Room Credentials)

**Endpoint:** `POST /api/voice/join`

**Request:**

```typescript
interface VoiceJoinRequest {
  system_prompt?: string; // Optional context/prompt for the voice agent
}
```

**Response:**

```typescript
interface VoiceJoinResponse {
  url: string; // LiveKit server WebSocket URL
  token: string; // JWT token for room authentication
  room_name: string; // Unique room identifier
}
```

**Error Handling:**

- `401` - Authentication failed
- `403` - User not authorized for voice
- `500` - Server error

---

## 2. LiveKit Integration

### 2.1 Room Connection

```typescript
import { Room, RoomEvent, Track, ConnectionState } from 'livekit-client';

// Connect to room
const room = new Room();
await room.connect(url, token, {
  autoSubscribe: true,
  dynacast: true,
});
```

### 2.2 Connection States

```typescript
enum VoiceChatState {
  Idle = 'idle',
  Connecting = 'connecting',
  Ready = 'ready',
  Active = 'active',
  Error = 'error',
}
```

**State Transitions:**

- `Idle` → `Connecting` (on start)
- `Connecting` → `Ready` (after connected, before mic enabled)
- `Ready` → `Active` (after local track published)
- `Active` → `Idle` (on disconnect)
- Any → `Error` (on failure)

### 2.3 Local Audio (Microphone)

```typescript
// Enable microphone
await room.localParticipant.enableMicrophone();

// Disable microphone
room.localParticipant.disableMicrophone();

// Get local audio tracks
const audioTracks = room.localParticipant.audioTracks;
```

### 2.4 Remote Audio (Bot Playback)

```typescript
// Listen for new remote tracks
room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
  if (track.kind === Track.Kind.Audio) {
    // Attach to DOM for playback
    const audioElement = track.attach();
    audioElement.id = 'livekit-bot-audio';
    document.body.appendChild(audioElement);
  }
});

// Clean up on unsubscribe
room.on(RoomEvent.TrackUnsubscribed, (track) => {
  if (track.kind === Track.Kind.Audio) {
    track.detach().forEach((el) => el.remove());
  }
});
```

### 2.5 Data Messages (Transcript)

Messages are sent via LiveKit's data channel. Parse using `RoomEvent.DataReceived`:

```typescript
room.on(RoomEvent.DataReceived, (payload, participant) => {
  const message = JSON.parse(new TextDecoder().decode(payload));

  switch (message.type) {
    case 'user_transcript':
      // { type: 'user_transcript', text: string, final?: boolean }
      break;
    case 'bot_transcript':
      // { type: 'bot_transcript', text: string }
      break;
  }
});

// Send data to bot (if needed)
room.localParticipant.publishData(
  new TextEncoder().encode(JSON.stringify({ type: 'user_input', text: 'hello' })),
  DataPacket_Kind.RELIABLE,
);
```

### 2.6 Speaking Events

```typescript
// When bot starts speaking
room.on(RoomEvent.ParticipantSpeaking, (participant, { isSpeaking }) => {
  if (isSpeaking && participant.identity === 'bot') {
    // Bot started speaking
  }
});
```

### 2.7 Connection Quality

```typescript
room.on(RoomEvent.ConnectionQualityChanged, (participant, quality) => {
  // quality: 'excellent' | 'good' | 'poor' | 'lost'
});
```

---

## 3. Audio Implementation

### 3.1 Audio Amplitude Visualization

Use Web Audio API for amplitude analysis:

```typescript
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 64;
analyser.smoothingTimeConstant = 0.8;

// Connect microphone stream to analyser
const source = audioContext.createMediaStreamSource(microphoneStream);
source.connect(analyser);

// Get amplitude data
const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(dataArray);

// Calculate average amplitude (0-1 range)
const average = dataArray.reduce((a, b) => a + b) / dataArray.length / 128;
```

**Note:** AudioContext must be created after user interaction (browser autoplay policy).

### 3.2 Microphone Capture

```typescript
// Request microphone access
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
  },
});

// Or use MediaRecorder for chunked capture
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000,
});

mediaRecorder.ondataavailable = (event) => {
  // event.data contains audio chunk
};

mediaRecorder.start(250); // 250ms chunks
```

---

## 4. Cleanup

Always cleanup on disconnect/unmount:

```typescript
const cleanup = () => {
  // Disconnect from room
  room.disconnect();

  // Remove audio elements
  document.getElementById('livekit-bot-audio')?.remove();

  // Stop microphone tracks
  stream.getTracks().forEach((track) => track.stop());

  // Close AudioContext
  audioContext.close();
};
```

---

## 5. Dependencies

```json
{
  "livekit-client": "^latest"
}
```

---

## 6. What to Avoid

1. **Don't create AudioContext before user interaction** - Browser autoplay policies
2. **Don't skip room cleanup** - Memory leaks and zombie connections
3. **Don't ignore connection quality** - Monitor for poor connections
4. **Don't forget to handle reconnection** - LiveKit handles this, but monitor state
5. **Don't hardcode room names or tokens** - Always fetch from backend
6. **Don't assume single participant** - Handle multiple remote participants
7. **Don't skip error handling** - Network issues, mic permissions, etc.

---

## 7. UI Components

### VoiceChatButton

A button component that controls voice chat state.

```typescript
interface VoiceChatButtonProps {
  systemPrompt?: string; // Passed to voice join endpoint
  className?: string; // CSS classes
  voiceChat?: UseVoiceChatReturn; // Optional external voice chat hook
  mini?: boolean; // Compact mode
}
```

**States:**

- **Idle** - Shows headphones icon
- **Connecting** - Shows spinner, blue border
- **Active** - Shows X icon, green border, pulsing animation
- **Error** - Shows headphones icon, red border

**Features:**

- Mic toggle button appears when Active
- Visual feedback with colors and animations

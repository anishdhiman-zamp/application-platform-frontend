# Transcription System Documentation

This document explains how the real-time audio transcription system works in the ChatInput component. The system converts spoken audio into text using either Deepgram or ElevenLabs as the speech-to-text provider.

## Overview

The transcription system is built using a layered architecture of React hooks that work together to:

1. Access the user's microphone
2. Record audio in real-time
3. Stream audio to a transcription service (Deepgram or ElevenLabs)
4. Receive and accumulate transcribed text
5. Display the transcript in the chat input

## Architecture

```
ChatInput Component
    ↓
useTranscription (Main Coordinator)
    ↓
    ├── useMicrophoneRecorder (Handles microphone access)
    ├── useDeepgramConnection (Deepgram provider)
    │   └── useMicrophoneRecorder
    └── useElevenlabsConnection (ElevenLabs provider)
        └── useMicrophoneRecorder
```

## Core Hooks

### 1. `useMicrophoneRecorder`

**Purpose**: Manages browser microphone access and audio recording.

**What it does**:

- Requests microphone permissions from the browser
- Creates a `MediaRecorder` instance to capture audio
- Records audio in 250ms chunks for real-time streaming
- Manages microphone state (NotSetup, SettingUp, Ready, Opening, Open, Error, etc.)

**Key Functions**:

- `setupMicrophone()`: Requests microphone access and creates a MediaRecorder
- `startMicrophone()`: Begins recording audio in 250ms chunks
- `stopMicrophone()`: Stops recording and releases microphone resources

**Microphone States**:

- `NotSetup`: Microphone hasn't been initialized
- `SettingUp`: Requesting microphone permissions
- `Ready`: Microphone is ready to record
- `Opening`: Starting to record
- `Open`: Actively recording
- `Error`: Failed to access microphone
- `Pausing`: Stopping recording

**Example Flow**:

```
User clicks record → setupMicrophone() → Request permissions → Create MediaRecorder → Ready state
→ startMicrophone() → Start recording in 250ms chunks → Open state
```

---

### 2. `useDeepgramConnection`

**Purpose**: Manages the WebSocket connection to Deepgram's speech-to-text service.

**What it does**:

- Establishes a WebSocket connection to Deepgram
- Streams audio chunks from the microphone to Deepgram
- Receives transcription results in real-time
- Maintains connection health with keep-alive pings

**Key Functions**:

- `connectToDeepgram()`: Establishes WebSocket connection with authentication token
- `disconnectFromDeepgram()`: Closes the connection gracefully
- `startRecording()`: Sets up the microphone for recording
- `stopRecording()`: Stops microphone recording

**How it works**:

1. Gets an authentication token using `useDeepgramToken` hook (see [Token Management](#token-management))
2. Creates a Deepgram WebSocket client with the token
3. Sets up event listeners for connection state (Open, Close, Error)
4. When connection is open and recording is active:
   - Starts the microphone recording
   - Listens for audio data chunks (every 250ms)
   - Sends each audio chunk to Deepgram via WebSocket
   - Receives transcription events and forwards them to the callback
5. Sends keep-alive pings every 10 seconds to maintain connection

**Transcription Events**:

- Deepgram sends transcription results with `is_final` and `speech_final` flags
- Only final, speech-final transcripts are accumulated (to avoid duplicates)

---

### 3. `useElevenlabsConnection`

**Purpose**: Manages the connection to ElevenLabs Scribe speech-to-text service.

**What it does**:

- Uses ElevenLabs React SDK (`useScribe`) for transcription
- Handles authentication and connection lifecycle
- Manages committed transcripts (finalized text segments)
- Provides audio visualization support

**Key Functions**:

- `connectToElevenLabs()`: Establishes connection with authentication token
- `disconnectFromElevenLabs()`: Commits any pending transcript and disconnects
- `startRecording()`: Sets up the microphone for recording
- `stopRecording()`: Stops microphone recording

**How it works**:

1. Fetches an authentication token on-demand using RTK Query (see [Token Management](#token-management))
2. Uses ElevenLabs `useScribe` hook with configuration:
   - Model: `scribe_v2_realtime`
   - Language: English (configurable)
   - Audio processing: echo cancellation, noise suppression, auto gain control
3. When connecting:
   - Fetches token via `getSpeechToTextAccessToken` API call
   - Connects to ElevenLabs Scribe with the token
4. When connected and recording:
   - Starts microphone recording for visualization
   - ElevenLabs SDK handles audio streaming internally
   - Receives "committed transcripts" (finalized text segments)
   - Calls the `onCommittedTranscript` callback with each committed segment
5. On disconnect:
   - Commits any pending partial transcript
   - Waits for commit to complete
   - Disconnects from the service

**Key Differences from Deepgram**:

- Uses a React SDK instead of raw WebSocket
- Provides "committed transcripts" instead of interim results
- Handles audio streaming internally
- Has a commit mechanism for finalizing partial transcripts

---

### 4. `useTranscription` (Main Coordinator)

**Purpose**: Orchestrates the entire transcription process by coordinating microphone recording and provider connections.

**What it does**:

- Manages the overall recording state
- Accumulates transcripts from the selected provider
- Provides a unified API regardless of provider
- Handles provider-specific logic

**Key Functions**:

- `startRecording()`: Initiates the entire transcription flow
- `stopRecording()`: Stops recording and cleans up connections
- Returns accumulated transcript text

**How it works**:

1. **Initialization**:
   - Accepts a `provider` parameter (DEEPGRAM or ELEVENLABS, defaults to ELEVENLABS)
   - Initializes both connection hooks (but only uses one based on provider)
   - Sets up callbacks to accumulate transcripts

2. **Starting Recording**:

   ```
   startRecording() called
   → Sets isRecording = true
   → Clears previous transcript
   → If DEEPGRAM:
       → startDeepgramRecording() (sets up microphone)
       → connectToDeepgram() (establishes WebSocket)
   → If ELEVENLABS:
       → startElevenLabsRecording() (sets up microphone)
       → connectToElevenLabs() (establishes connection)
   ```

3. **Accumulating Transcripts**:
   - **Deepgram**: Receives `LiveTranscriptionEvent` objects, filters for final results, accumulates text
   - **ElevenLabs**: Receives committed transcript objects, accumulates text segments

4. **Stopping Recording**:
   ```
   stopRecording() called
   → Sets isRecording = false
   → If DEEPGRAM:
       → stopDeepgramRecording() (stops microphone)
       → disconnectFromDeepgram() (closes WebSocket)
   → If ELEVENLABS:
       → stopElevenLabsRecording() (stops microphone)
       → disconnectFromElevenLabs() (commits pending transcript, disconnects)
   ```

**Returned Values**:

- `transcript`: Accumulated text from all transcription events
- `isRecording`: Whether recording is currently active
- `microphone`: MediaRecorder instance (for audio visualization)
- `microphoneState`: Current state of the microphone
- `connectionState`: WebSocket connection state (for Deepgram)
- `isCommitting`: Whether ElevenLabs is committing a transcript (for UI feedback)

---

## Token Management

Both transcription providers require authentication tokens to establish connections. The token management systems differ between providers to optimize for their specific requirements.

### Deepgram Token Management (`useDeepgramToken`)

**Purpose**: Manages Deepgram access tokens with automatic refresh and caching.

**How it works**:

1. **Token Storage**:
   - Tokens are stored at **module level** (outside React component lifecycle)
   - This allows tokens to persist across component unmounts/remounts
   - Prevents unnecessary token fetches when components re-render

2. **Token Lifecycle**:
   - **TTL**: 3600 seconds (1 hour)
   - **Refresh Buffer**: 300 seconds (5 minutes before expiration)
   - Tokens are automatically refreshed when they're within 5 minutes of expiring

3. **Token Fetching**:
   - Uses RTK Query (`useGetSpeechToTextAccessTokenQuery`) to fetch tokens from backend
   - Skips fetching if a valid token already exists (checks expiration)
   - RTK Query caching provides additional layer of token persistence

4. **Token Validation**:

   ```typescript
   getValidToken() {
     if (token is expired or expiring) {
       refetch token from backend
     }
     return valid token
   }
   ```

5. **Key Features**:
   - **Automatic Refresh**: Checks expiration before each connection attempt
   - **Module-level Persistence**: Token survives component unmounts
   - **RTK Query Integration**: Leverages RTK Query cache for efficiency
   - **Error Handling**: Exposes `tokenError` flag for error states

**Token Flow**:

```
Component mounts → useDeepgramToken hook
  → Check if token exists and is valid
  → If expired/expiring: Fetch new token via RTK Query
  → Store token in module-level variable
  → Return getValidToken() function
  → When connecting: getValidToken() ensures fresh token
```

**Benefits**:

- Reduces API calls by reusing valid tokens
- Automatic refresh prevents connection failures
- Module-level storage improves performance
- Works seamlessly with RTK Query caching

---

### ElevenLabs Token Management

**Purpose**: Fetches ElevenLabs access tokens on-demand when establishing connections.

**How it works**:

1. **Token Fetching**:
   - Uses RTK Query lazy query (`useLazyGetSpeechToTextAccessTokenQuery`)
   - Token is fetched **on-demand** when `connectToElevenLabs()` is called
   - No automatic refresh mechanism - new token fetched for each connection

2. **Token Lifecycle**:
   - **TTL**: 900 seconds (15 minutes) - **Fixed by ElevenLabs API**
   - Tokens are single-use tokens for realtime scribe
   - Backend `ttl_seconds` parameter is **ignored** (ElevenLabs doesn't support custom TTL)

3. **Token Usage**:

   ```typescript
   connectToElevenLabs() {
     // Fetch token on-demand
     const result = await getSpeechToTextAccessToken({}).unwrap();
     const token = result.access_token;

     // Use token immediately to connect
     await scribe.connect({ token });
   }
   ```

4. **Key Features**:
   - **On-Demand Fetching**: Token fetched only when needed
   - **No Caching**: Each connection gets a fresh token
   - **Fixed Expiration**: Always 15 minutes (ElevenLabs limitation)
   - **Simple Implementation**: No expiration tracking needed

**Token Flow**:

```
User starts recording → connectToElevenLabs() called
  → Fetch token via lazy RTK Query
  → Use token immediately to connect
  → Token valid for 15 minutes
  → On next recording session: Fetch new token
```

**Benefits**:

- Simple implementation (no expiration tracking)
- Always uses fresh tokens
- Works well with ElevenLabs single-use token model
- No stale token issues

---

### Comparison: Deepgram vs ElevenLabs Token Management

| Feature              | Deepgram                                | ElevenLabs                           |
| -------------------- | --------------------------------------- | ------------------------------------ |
| **Token Storage**    | Module-level (persists across unmounts) | No storage (fetched on-demand)       |
| **Token TTL**        | 1 hour (3600s)                          | 15 minutes (900s) - fixed            |
| **Refresh Strategy** | Automatic (5 min before expiration)     | On-demand (new token per connection) |
| **Caching**          | Module-level + RTK Query cache          | RTK Query cache only                 |
| **Token Reuse**      | Yes (reuses valid tokens)               | No (new token each time)             |
| **Implementation**   | `useDeepgramToken` hook                 | Direct RTK Query in connection hook  |
| **Complexity**       | Higher (expiration tracking)            | Lower (simple fetch)                 |

### Why Different Approaches?

**Deepgram**:

- Longer token TTL (1 hour) makes caching worthwhile
- WebSocket connections can be long-lived
- Automatic refresh prevents connection interruptions
- Module-level storage improves performance

**ElevenLabs**:

- Shorter token TTL (15 minutes) and fixed expiration
- Single-use token model
- Simpler on-demand fetching is sufficient
- No need for complex expiration tracking

### Token Error Handling

Both providers expose token error states:

- **Deepgram**: `tokenError` flag from `useDeepgramToken`
- **ElevenLabs**: `tokenError` flag from RTK Query lazy query

These can be used to:

- Show loading states while fetching tokens
- Display error messages if token fetch fails
- Retry token fetching on errors
- Prevent connection attempts with invalid tokens

---

## Complete Flow Example

Here's what happens when a user clicks the microphone button:

### Step 1: User Interaction

```typescript
// In ChatInput.tsx
const handleStartRecording = async () => {
  await startRecording(); // Calls useTranscription's startRecording
};
```

### Step 2: Transcription Hook Initializes

```typescript
// useTranscription hook
startRecording() {
  setIsRecording(true);
  setAccumulatedTranscript(''); // Clear previous transcript

  // For ElevenLabs (default):
  await startElevenLabsRecording(); // Sets up microphone
  await connectToElevenLabs(); // Establishes connection
}
```

### Step 3: Microphone Setup

```typescript
// useMicrophoneRecorder hook
setupMicrophone() {
  // Request browser permission
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mic = new MediaRecorder(stream);
  // Microphone is now ready
}
```

### Step 4: Connection Established

```typescript
// useElevenlabsConnection hook
connectToElevenLabs() {
  const token = await getToken();
  await scribe.connect({ token });
  // Connection is now open
}
```

### Step 5: Recording Starts

```typescript
// When connection is ready and isRecording is true:
startMicrophone(); // Begins recording in 250ms chunks
// Audio chunks are automatically streamed to ElevenLabs
```

### Step 6: Receiving Transcripts

```typescript
// ElevenLabs sends committed transcripts
onCommittedTranscript({ text: "Hello world" }) {
  setAccumulatedTranscript(prev => prev + " " + "Hello world");
}

// Transcript is updated in useTranscription
// ChatInput receives updated transcript via hook return value
```

### Step 7: Display in UI

```typescript
// In ChatInput.tsx
useEffect(() => {
  setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
}, [transcript]);
// Text appears in the textarea
```

### Step 8: User Stops Recording

```typescript
// User clicks accept/reject
stopRecording() {
  // Stops microphone
  // Commits any pending transcript (ElevenLabs)
  // Disconnects from service
  // Cleans up resources
}
```

---

## State Management

The system uses React state and refs to manage:

1. **Recording State**: Tracks if recording is active
2. **Connection State**: Tracks WebSocket/connection status
3. **Microphone State**: Tracks microphone lifecycle
4. **Transcript Accumulation**: Builds up the final text
5. **Concurrency Guards**: Prevents multiple simultaneous start/stop operations

---

## Error Handling

- **Microphone Errors**: Caught and displayed to user via toast notifications
- **Connection Errors**: Logged to Sentry, connection state updated
- **Token Errors**: Tracked and exposed via `tokenError` flag
- **Provider Errors**: Handled by each connection hook, with fallback behavior

---

## Key Design Decisions

1. **Provider Abstraction**: `useTranscription` provides a unified API regardless of provider
2. **Microphone Reuse**: Both providers use the same `useMicrophoneRecorder` hook
3. **State Coordination**: Recording state is managed at the top level and passed down
4. **Transcript Accumulation**: Each provider's transcripts are accumulated in the same way
5. **Resource Cleanup**: All hooks properly clean up connections and microphone resources on unmount

---

## Usage in ChatInput

```typescript
const {
  transcript, // Current accumulated transcript text
  isRecording, // Whether recording is active
  startRecording, // Function to start recording
  stopRecording, // Function to stop recording
  microphoneState, // Microphone state (for UI feedback)
  connectionState, // Connection state (for UI feedback)
  microphone, // MediaRecorder instance (for audio visualization)
  isCommitting, // Whether transcript is being committed (ElevenLabs)
} = useTranscription();

// Transcript is automatically added to textarea via useEffect
useEffect(() => {
  setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
}, [transcript]);
```

---

## Troubleshooting

**Microphone not working**:

- Check browser permissions
- Verify `microphoneState` is not `Error`
- Check browser console for permission errors

**No transcripts received**:

- Verify `connectionState` is `open` (for Deepgram) or `isConnected` is `true` (for ElevenLabs)
- Check network connectivity
- Verify authentication token is valid

**Transcripts not appearing in textarea**:

- Check that `transcript` value is being updated
- Verify the `useEffect` in ChatInput is running
- Check for any errors in the transcript accumulation logic

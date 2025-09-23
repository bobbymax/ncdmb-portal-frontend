# Laravel Reverb WebSocket Setup

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# Laravel Reverb WebSocket Configuration (Create React App)
REACT_APP_VITE_REVERB_APP_KEY=your-reverb-app-key-here
REACT_APP_VITE_REVERB_HOST=localhost
REACT_APP_VITE_REVERB_PORT=8080
REACT_APP_VITE_REVERB_SCHEME=http
```

## Backend Requirements

1. **Laravel Reverb Server**: Must be running on your backend
2. **Broadcasting Routes**: Ensure `/broadcasting/auth` endpoint exists
3. **WebSocket Authentication**: Backend must handle token-based authentication
4. **Channel Naming**: Backend should use `private-threads.{threadId}` channel naming convention

## Example Development Values

```bash
REACT_APP_VITE_REVERB_APP_KEY=local-key-123
REACT_APP_VITE_REVERB_HOST=localhost
REACT_APP_VITE_REVERB_PORT=8080
REACT_APP_VITE_REVERB_SCHEME=http
```

## Implementation Details

### Pusher Service

- **File**: `src/lib/pusher.ts`
- **Features**:
  - Dynamic token refresh
  - Connection state management
  - Automatic reconnection
  - Channel subscription management

### WebSocket Hook

- **File**: `src/features/chat/usePusherSocket.ts`
- **Features**:
  - Real-time message handling
  - Thread creation and management
  - Optimistic updates
  - Connection status tracking

### Channel Naming Convention

- **Private Channels**: `private-threads.{threadId}`
- **Events**:
  - `MessageSent` - New message received
  - `ThreadUpdated` - Thread state changed

## Testing WebSocket Connection

1. Set up environment variables
2. Start Laravel Reverb server
3. Check browser console for WebSocket connection logs
4. Open browser console and run: `testPusherConnection()` for manual testing
5. Send a message to test real-time functionality

## Connection States

The Pusher service provides real-time connection state updates:

- **connecting**: Initial connection attempt
- **connected**: Successfully connected to WebSocket
- **disconnected**: Connection lost or closed
- **failed**: Connection failed due to error

## Troubleshooting

- **Missing Environment Variables**: Check that all VITE\_\* variables are set
- **Authentication Errors**: Verify your backend broadcasting auth endpoint
- **Connection Issues**: Check Reverb server status and port configuration
- **Channel Subscription Failed**: Ensure backend supports `private-threads.*` channels
- **Token Issues**: Verify TokenProvider is working correctly

## Migration from Laravel Echo

This implementation replaces Laravel Echo with direct Pusher.js for:

- Better performance
- More control over connection management
- Enhanced debugging capabilities
- Reduced dependencies

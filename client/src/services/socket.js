import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : undefined);

export const socket = io(SOCKET_URL || undefined, {
  withCredentials: true,
  // prefer polling first to avoid noisy WebSocket connection errors when
  // the server doesn't accept websocket upgrades (some hosting setups)
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Add lightweight logging so connect issues are visible but not spammy in the console
if (typeof window !== 'undefined') {
  socket.on('connect_error', (err) => {
    // show a concise message; the full error is available in devtools if needed
    console.warn('Socket connect_error:', err?.message || err);
  });

  socket.on('error', (err) => {
    console.warn('Socket error:', err);
  });
}

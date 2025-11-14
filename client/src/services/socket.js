import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : undefined);

export const socket = io(SOCKET_URL || undefined, {
  withCredentials: true,
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});


if (typeof window !== 'undefined') {
  socket.on('connect_error', (err) => {
    console.warn('Socket connect_error:', err?.message || err);
  });

  socket.on('error', (err) => {
    console.warn('Socket error:', err);
  });
}

import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3001'
    : import.meta.env.VITE_API_BASE_URL.replace('/api', '');

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

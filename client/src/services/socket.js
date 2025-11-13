import { io } from 'socket.io-client';

// Change this URL to your server's URL if different
const URL = 'http://localhost:3001';

export const socket = io(URL, {
  autoConnect: false,
});
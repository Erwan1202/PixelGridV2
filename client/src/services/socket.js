import { io } from 'socket.io-client';

// Use Vite environment variable when available (fallback for local dev)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const socket = io(API_BASE_URL);
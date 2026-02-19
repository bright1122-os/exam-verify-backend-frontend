import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = (role) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (role) {
      socket.emit('join:role', role);
      socket.emit(`${role}:join`);
    }
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onVerificationEvent = (callback) => {
  if (!socket) return;
  socket.on('verification:approved', (data) => callback('approved', data));
  socket.on('verification:denied', (data) => callback('denied', data));
};

export const offVerificationEvent = () => {
  if (!socket) return;
  socket.off('verification:approved');
  socket.off('verification:denied');
};

export const onPaymentEvent = (callback) => {
  if (!socket) return;
  socket.on('payment:completed', (data) => callback(data));
};

export const offPaymentEvent = () => {
  if (!socket) return;
  socket.off('payment:completed');
};

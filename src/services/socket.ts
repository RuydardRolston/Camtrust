import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.MODE === 'production' &&
    import.meta.env?.VITE_SOCKET_URL) ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174');

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
    });
  }
  return socketInstance;
};

export const socket: Socket = getSocket();

export const joinProjectRoom = (projectId: string | number): void => {
  socket.emit('join:project', projectId);
};

export const leaveProjectRoom = (projectId: string | number): void => {
  socket.emit('leave:project', projectId);
};

export const joinUserRoom = (userId: string | number): void => {
  socket.emit('join:user', userId);
};

export const SOCKET_EVENTS = {
  PROJECT_UPDATED: 'project:updated',
  EVIDENCE_NEW: 'evidence:new',
  DOCUMENT_NEW: 'document:new',
  MILESTONE_UPDATED: 'milestone:updated',
  REPORT_NEW: 'report:new',
  VERIFICATION_UPDATED: 'verification:updated',
  NOTIFICATION_NEW: 'notification:new',
} as const;

export type SocketEventType =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

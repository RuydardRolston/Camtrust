import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_SOCKET_URL) ||
  (typeof window !== 'undefined' && window.location.origin);

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
});

export const joinProjectRoom = (projectId: string | number): void => {
  socket.emit('join:project', projectId);
};

export const leaveProjectRoom = (projectId: string | number): void => {
  socket.emit('leave:project', projectId);
};

export const SOCKET_EVENTS = {
  PROJECT_UPDATED: 'project:updated',
  EVIDENCE_NEW: 'evidence:new',
  DOCUMENT_NEW: 'document:new',
  MILESTONE_UPDATED: 'milestone:updated',
  REPORT_NEW: 'report:new',
  VERIFICATION_UPDATED: 'verification:updated',
} as const;

export type SocketEventType =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

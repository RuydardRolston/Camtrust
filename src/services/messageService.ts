/**
 * CamTrust — Direct Messaging service (UC26: Communicate via platform)
 * REST endpoints + real-time Socket.IO delivery.
 */
import api from './api';
import { socket } from './socket';

export interface Contact {
  id: number;
  fullName: string;
  email: string;
  role: string;
  verified: boolean;
  unreadCount?: number;
}

export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  projectId: number | null;
  body: string;
  readAt: string | null;
  createdAt: string;
  sender?: { id: number; fullName: string | null };
}

export const messageService = {
  getContacts: async (): Promise<Contact[]> => {
    const res = await api.get('/messages/contacts');
    return res.data.contacts;
  },

  getConversation: async (partnerId: number): Promise<{ partner: Contact; messages: ChatMessage[] }> => {
    const res = await api.get(`/messages/${partnerId}`);
    return { partner: res.data.partner, messages: res.data.messages };
  },

  sendMessage: async (receiverId: number, body: string, projectId?: number | null): Promise<ChatMessage> => {
    const res = await api.post('/messages', { receiverId, body, projectId });
    return res.data.message;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get('/messages/unread-count');
    return res.data.count;
  },
};

export const MESSAGE_SOCKET_EVENTS = {
  NEW: 'message:new',      // received by the recipient in real time
  SENT: 'message:sent',    // confirmation echoed to the sender
} as const;

export const onNewMessage = (handler: (msg: ChatMessage) => void): void => {
  socket.on(MESSAGE_SOCKET_EVENTS.NEW, handler);
};

export const offNewMessage = (handler: (msg: ChatMessage) => void): void => {
  socket.off(MESSAGE_SOCKET_EVENTS.NEW, handler);
};

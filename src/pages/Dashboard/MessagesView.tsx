/**
 * CamTrust — Messages / Chat View (UC26: Communicate via platform)
 * Real direct messaging between project owners, engineers and admins.
 * Messages are persisted via the API and delivered live over Socket.IO.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, ArrowLeft, BadgeCheck, Search } from 'lucide-react';
import {
  messageService,
  onNewMessage,
  offNewMessage,
  Contact,
  ChatMessage,
} from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';

import { useSearchParams } from 'react-router-dom';

const roleLabel = (role: string): string => {
  switch (role) {
    case 'admin':
    case 'administrator':
      return 'Administrator';
    case 'professional':
    case 'engineer':
      return 'Civil Engineer';
    case 'property_owner':
    case 'owner':
      return 'Project Owner';
    default:
      return role;
  }
};

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDay = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString();
};

export const MessagesView: React.FC = () => {
  const { user } = useAuth();
  const myId = user?.id ?? 0;
  const [searchParams] = useSearchParams();
  const targetPartnerId = searchParams.get('partnerId');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadContacts = useCallback(async () => {
    try {
      const list = await messageService.getContacts();
      setContacts(list);

      if (targetPartnerId) {
        const partner = list.find((c) => String(c.id) === targetPartnerId);
        if (partner) {
          openConversation(partner);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load contacts.');
    } finally {
      setLoading(false);
    }
  }, [targetPartnerId]);

  const openConversation = useCallback(async (contact: Contact) => {
    setSelected(contact);
    setError(null);
    try {
      const { messages: msgs } = await messageService.getConversation(contact.id);
      setMessages(msgs);
      // Reset unread count for this contact
      setContacts((prev) =>
        prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error(err);
      setError('Failed to load conversation.');
    }
  }, []);

  // Initial load + live updates
  useEffect(() => {
    loadContacts();
    const handler = (msg: ChatMessage) => {
      const partnerId =
        msg.senderId === myId ? msg.receiverId : msg.senderId;
      setSelected((current) => {
        if (current && current.id === partnerId) {
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          );
        }
        return current;
      });
      loadContacts();
    };
    onNewMessage(handler);
    return () => offNewMessage(handler);
  }, [loadContacts, myId]);

  // Auto-scroll to the newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selected]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !draft.trim() || sending) return;
    setSending(true);
    const body = draft.trim();
    setDraft('');
    try {
      const sent = await messageService.sendMessage(selected.id, body);
      setMessages((prev) =>
        prev.some((m) => m.id === sent.id) ? prev : [...prev, sent]
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to send message.');
      setDraft(body);
    } finally {
      setSending(false);
    }
  };

  const filtered = contacts.filter(
    (c) =>
      c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-2xl border-gray-100 shadow-sm overflow-hidden flex h-[calc(100vh-14rem)]">
        {/* Contacts list */}
        <div
          className={`${
            selected ? 'hidden sm:flex' : 'flex'
          } w-full sm:w-80 shrink-0 flex-col border-r border-gray-100`}
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="text-orange-500" size={20} />
              <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Messages</h2>
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-gray-400">Loading contacts…</p>
            ) : filtered.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">
                No contacts yet. Contacts appear once a project assignment links you with another user.
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openConversation(c)}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-orange-50/60 transition ${
                    selected?.id === c.id ? 'bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {c.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
                        {c.fullName}
                        {c.verified && <BadgeCheck size={14} className="text-blue-500 shrink-0" />}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{roleLabel(c.role)}</p>
                    </div>
                  </div>
                  {c.unreadCount && c.unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-extrabold text-[10px] shrink-0 shadow-xs">
                      {c.unreadCount}
                    </span>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation pane */}
        <div className={`${selected ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-w-0`}>
          {selected ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100"
                  aria-label="Back to contacts"
                >
                  <ArrowLeft size={18} className="text-gray-500" />
                </button>
                <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  {selected.fullName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    {selected.fullName}
                    {selected.verified && <BadgeCheck size={14} className="text-blue-500" />}
                  </p>
                  <p className="text-xs text-gray-400">{roleLabel(selected.role)} · {selected.email}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/60">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-gray-400 mt-10">
                    No messages yet — say hello 👋
                  </p>
                )}
                {messages.map((m) => {
                  const mine = m.senderId === myId;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          mine
                            ? 'bg-orange-500 text-white rounded-br-md'
                            : 'bg-white text-gray-800 border-gray-100 rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap wrap-break-word">{m.body}</p>
                        <p className={`text-[10px] mt-1 ${mine ? 'text-orange-100' : 'text-gray-400'}`}>
                          {formatDay(m.createdAt)} · {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {error && (
                <p className="px-4 py-2 text-xs text-red-500 bg-red-50 border-t border-red-100">{error}</p>
              )}

              <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2 bg-white">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${selected.fullName}…`}
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  className="px-4 py-2.5 bg-orange-500 text-white rounded-xl shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 transition flex items-center gap-2 text-sm font-bold"
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">{sending ? 'Sending…' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex-col items-center justify-center text-center p-8">
              <MessageSquare size={40} className="text-gray-300 mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Project Messaging</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-1">
                Select a contact to start a conversation with the engineers and owners you work with.
                Messages are delivered in real time and logged on the platform.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesView;

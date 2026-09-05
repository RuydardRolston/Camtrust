/**
 * CamTrust - Gemini AI Construction Assistant View
 * Dedicated AI Chatbot powered by Google Gemini via the Express backend.
 * Provides instant assistance on (A) Construction Terminology and (B) How to Use Camtrust.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  HardHat,
  HelpCircle,
  ShieldAlert,
  Bot,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import aiService from '../../services/aiService';
import useAuth from '../../hooks/useAuth';

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTIONS = {
  terminology: [
    'What is a footing?',
    'What is reinforced concrete?',
    'What is a slab?',
    'What is a lintel?',
    'What is a structural column?',
    'What does foundation curing mean?',
  ],
  platform: [
    'How do I create a project?',
    'How do I monitor my project?',
    'How does Engineer verification work?',
    'How do I upload verification documents?',
    'How do I capture site evidence?',
    'Why does Camtrust need my GPS?',
    'How do I view my Engineer\'s report?',
    'How do I download a progress report?',
  ],
};

export const AIAssistantView: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project') || searchParams.get('projectId');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: `Hello ${user?.fullName || 'there'}! I am your **Camtrust Construction & Platform Assistant**.\n\nI can help you with:\n1. **Construction Technical Terminology** (footings, slabs, rebar, columns, concrete curing, etc.)\n2. **How to Use Camtrust** (project creation, engineer KYC verification, in-app camera & GPS evidence capture, and downloading official progress reports).\n\nFeel free to ask a question or click a topic below to get started!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.askAssistant(projectId || null, textToSend);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer || response.response || 'I could not process that request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${err.message || 'AI service temporarily unavailable. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Camtrust Gemini AI Assistant
              </h1>
              <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded-full border border-orange-500/30">
                Google Gemini API
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ask about technical construction definitions or step-by-step guidance on using Camtrust workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Suggestion Pills */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
            <HardHat size={14} className="text-orange-500" />
            <span>Construction Technical Terminology:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.terminology.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuery(item)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition text-left"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-black text-gray-800 uppercase tracking-wider mb-2">
            <HelpCircle size={14} className="text-blue-500" />
            <span>How to Use Camtrust Platform:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.platform.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendQuery(item)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition text-left"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-130 overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot size={18} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs shadow-md'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{msg.content}</div>
                  <div
                    className={`text-[10px] mt-2 text-right ${
                      isUser ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 mt-1 font-bold text-xs shadow-xs">
                    {(user?.fullName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center shrink-0 shadow-xs">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-slate-500 font-semibold">
                <Loader2 size={14} className="animate-spin text-orange-500" />
                <span>Consulting Gemini AI Construction Model...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
            placeholder="Ask about construction terms (footing, slab, curing) or how to use Camtrust..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <button
            type="button"
            onClick={() => handleSendQuery()}
            disabled={loading || !input.trim()}
            className="p-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl shadow-md transition shrink-0 cursor-pointer"
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Safety Critical Advisory Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert size={18} className="text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-black">Safety Advisory:</span> The Camtrust AI assistant provides educational explanations and platform assistance. For critical structural calculations, load-bearing assessments, soil testing, or safety-critical decisions on active job sites, always consult a licensed and certified civil engineer.
        </div>
      </div>
    </div>
  );
};

export default AIAssistantView;

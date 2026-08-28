/**
 * CamTrust - AI Assistant View
 * Real Gemini API call via backend endpoint.
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import aiService from '../../services/aiService';

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistantView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !projectId) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.askAssistant(projectId, input);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get response'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center space-y-3">
        <Sparkles className="w-12 h-12 text-orange-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">AI Construction Assistant</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Select a project to start asking questions. The assistant uses real project data to provide answers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              AI Construction Assistant
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Ask questions about your project. Powered by Google Gemini.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Ask a question about your project to get started</p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-br-md'
                    : 'bg-gray-50 text-gray-900 border border-gray-100 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl rounded-bl-md">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your project..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantView;

/**
 * CamTrust - AI Construction Assistant (Screen 13)
 * Matches reference poster: AI Chat widget with suggested prompts, smart construction recommendations,
 * and live interactive response engine.
 */

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'What is the next step after roofing on Modern Villa Construction?',
      time: '10:15 AM',
    },
    {
      id: 'm2',
      sender: 'ai',
      text: 'After roofing, the next immediate phase is Electrical & Plumbing rough-in. This includes wall chasing, installing electrical conduit pipes, plumbing drainage stacks, and HVAC ducting before interior plastering commences. Ensure your engineer signs off on waterproofing underlayment tests beforehand.',
      time: '10:15 AM',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'What is the next step after roofing?',
    'How do I verify concrete curing on site?',
    'What is typical budget contingency in Cameroon?',
    'How do I confirm my engineer is licensed?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    // Realistic construction assistant response generator
    setTimeout(() => {
      let aiResponseText = '';
      const lower = query.toLowerCase();

      if (lower.includes('roofing') || lower.includes('next step')) {
        aiResponseText =
          'Following roofing completion, the primary milestones are: 1) Electrical conduit and plumbing rough-in, 2) Door & window frame installation, 3) Wall plastering and screeding. Your site engineer Eng. Mark Tala can upload milestone evidence once conduits are inspected.';
      } else if (lower.includes('curing') || lower.includes('concrete')) {
        aiResponseText =
          'Standard concrete curing requires continuous moist keeping for at least 7 to 14 days. For columns and slabs, burlap wrap or water ponding is recommended. Compression test cube samples should reach at least 70% strength at 7 days and 100% at 28 days.';
      } else if (lower.includes('contingency') || lower.includes('budget')) {
        aiResponseText =
          'In construction project management, a contingency reserve of 10% to 15% is recommended to account for material price fluctuations (e.g. cement, rebar) and unanticipated subsurface conditions.';
      } else if (lower.includes('license') || lower.includes('engineer')) {
        aiResponseText =
          'All CamTrust verified professionals are cross-referenced with national engineering council directories (e.g. ONIGC). You can view their verified credentials under the "Team" or "Professionals" tab.';
      } else {
        aiResponseText = `Based on your project parameters, ${query.trim()} is currently monitored by your project lead. You can review recent photo evidence under the Reports tab or request an on-site milestone verification report.`;
      }

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: aiResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              AI Construction Assistant
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Ask technical construction questions, get schedule estimates, and understand building codes.
          </p>
        </div>
      </div>

      {/* Main Chat Panel (Screen 13) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[580px]">
        {/* Chat Header */}
        <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-sm">
              <Bot size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                CamTrust Construction Intelligence
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-[10px] text-gray-400">Context: Modern Villa Construction • Residential</div>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
            Powered by CamTrust AI
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm text-xs font-bold mt-1">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isAi
                      ? 'bg-gray-100/80 text-gray-900 border border-gray-200/60 rounded-tl-sm'
                      : 'bg-orange-500 text-white rounded-tr-sm'
                  }`}
                >
                  <p>{m.text}</p>
                  <div
                    className={`text-[10px] mt-1.5 text-right font-medium ${
                      isAi ? 'text-gray-400' : 'text-orange-100'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>

                {!isAi && (
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm text-xs font-bold mt-1">
                    <User size={15} />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-gray-400 italic">
              <Bot size={14} className="animate-spin text-orange-500" />
              <span>CamTrust AI is generating response...</span>
            </div>
          )}
        </div>

        {/* Suggested Question Chips (Screen 13) */}
        <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap flex items-center gap-1">
            <Sparkles size={12} className="text-orange-500" /> Suggestions:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-200 rounded-full text-xs font-medium whitespace-nowrap transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything about your project materials, building standards, schedule..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim()}
            className="p-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl shadow-md shadow-orange-500/20 transition flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantView;

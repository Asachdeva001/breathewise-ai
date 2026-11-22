import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldAlert, RefreshCw } from 'lucide-react';
import { AqiTelemetry, ChatMessage } from '../../../shared/types.js';

interface ChatAssistantViewProps {
  messages: ChatMessage[];
  sending: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
  telemetry: AqiTelemetry | null;
}

export const ChatAssistantView: React.FC<ChatAssistantViewProps> = ({
  messages,
  sending,
  error,
  onSendMessage,
  telemetry,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const latestAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const suggestedPills = latestAssistantMessage?.suggestedFollowups || [
    'Should I go for a morning walk today?',
    'How do I build a low-cost DIY air purifier?',
    'How can our apartment society or neighborhood tackle winter smog?',
    'How do I protect my child who has asthma during school hours?',
    'What window hours are safe for home ventilation?',
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md flex flex-col h-[750px] overflow-hidden">
      {/* Grounded Context Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">BreatheWise AI Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Vertex AI Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded in live telemetry & deterministic CPCB thresholds
            </p>
          </div>
        </div>

        {telemetry && (
          <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs flex items-center gap-2">
            <span className="text-slate-300 font-medium">{telemetry.city}:</span>
            <span className="font-bold text-amber-400 font-mono">AQI {telemetry.aqi}</span>
            <span className="text-slate-400">({telemetry.category})</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                msg.role === 'user' ? 'bg-slate-800' : 'bg-brand-600 shadow-sm'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.groundedContext && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-700">Grounded Context:</span>
                  <span>{msg.groundedContext.city}</span>
                  <span>•</span>
                  <span>AQI {msg.groundedContext.aqi}</span>
                  <span>•</span>
                  <span>{msg.groundedContext.dominantPollutant}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 max-w-xl mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 shadow-2xs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
              <span>Analyzing environmental context and generating grounded guidance...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-6 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
          Suggested:
        </span>
        {suggestedPills.map((pill, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(pill)}
            disabled={sending}
            className="text-xs bg-slate-100 hover:bg-brand-50 hover:text-brand-800 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            placeholder="Ask about outdoor walks, DIY air filters, ventilation hours, or commute choices..."
            className="w-full pl-4 pr-12 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-slate-900 placeholder-slate-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="absolute right-2 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl disabled:opacity-40 transition-colors"
            aria-label="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <ShieldAlert className="w-3 h-3 text-slate-400" />
          <span>BreatheWise AI is an environmental decision assistant and does not replace medical advice.</span>
        </div>
      </form>
    </div>
  );
};

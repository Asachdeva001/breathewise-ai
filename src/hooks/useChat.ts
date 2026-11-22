import { useState, useCallback } from 'react';
import { AqiTelemetry, ChatMessage, UserProfile } from '../../shared/types.js';
import { sendChatMessageApi } from '../services/api.js';

export function useChat(telemetry: AqiTelemetry | null, profile: UserProfile | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I am **BreatheWise AI**, your personal environmental and winter smog assistant.

I can help you navigate today's air quality with:
• **Low-emission daily routine planning** (exercise, errands, commute windows)
• **Indoor air hacks & DIY filtration** (Corsi-Rosenthal box fans, cooking protocols)
• **Sustainable transit alternatives** tailored to your daily schedule

Ask me any question below or tap a suggested prompt!`,
      timestamp: new Date().toISOString(),
      suggestedFollowups: [
        'Should I go for a morning walk today?',
        'How do I build a low-cost DIY air purifier?',
        'How can I shield my children during severe smog?',
        'What commute options reduce the most emissions?',
      ],
    },
  ]);
  const [conversationId, setConversationId] = useState<string>(() => `convo-${Date.now()}`);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !telemetry) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setSending(true);
      setError(null);

      try {
        const res = await sendChatMessageApi({
          message: text.trim(),
          conversationId,
          telemetry,
          profile: profile || undefined,
        });

        setConversationId(res.conversationId);
        setMessages((prev) => [...prev, res.message]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to receive response';
        setError(message);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I encountered a connection issue. Please try asking again.',
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [conversationId, telemetry, profile]
  );

  return {
    messages,
    sending,
    error,
    sendMessage,
  };
}

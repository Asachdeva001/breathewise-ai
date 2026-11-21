import { Request, Response, NextFunction } from 'express';
import { generateChatResponse } from '../services/vertexAiService.js';
import { saveConversation, getConversation } from '../services/firestoreService.js';
import { AqiTelemetry, ChatMessage, UserProfile } from '../../shared/types.js';

export async function handleChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, conversationId, telemetry, profile } = req.body as {
      message: string;
      conversationId?: string;
      telemetry: AqiTelemetry;
      profile?: UserProfile;
    };

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: { message: 'Message text is required.' } });
      return;
    }

    if (!telemetry || typeof telemetry.aqi !== 'number') {
      res.status(400).json({ error: { message: 'Grounded AQI telemetry context is required.' } });
      return;
    }

    const cid = conversationId || `convo-${Date.now()}`;
    const existingHistory = await getConversation(cid);

    const result = await generateChatResponse({
      message,
      history: existingHistory,
      telemetry,
      profile,
    });

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant',
      content: result.reply,
      timestamp: new Date().toISOString(),
      groundedContext: {
        city: telemetry.city,
        aqi: telemetry.aqi,
        category: telemetry.category,
        dominantPollutant: telemetry.dominantPollutant,
      },
      suggestedFollowups: result.suggestedFollowups,
    };

    const updatedHistory = [...existingHistory, userMsg, assistantMsg];
    await saveConversation(cid, profile?.userId || 'guest', updatedHistory);

    res.json({
      conversationId: cid,
      message: assistantMsg,
      isAiGenerated: result.isAiGenerated,
    });
  } catch (error) {
    next(error);
  }
}

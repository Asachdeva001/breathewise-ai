/**
 * Google Cloud Firestore & Persistence Service
 * 
 * Supports both production Google Cloud Firestore (Native mode) and an
 * in-memory repository for rapid local execution and test suites.
 */

import { Firestore } from '@google-cloud/firestore';
import { env } from '../config/env.js';
import { ActionLog, ChatMessage, UserProfile } from '../../shared/types.js';

let firestoreClient: Firestore | null = null;

if (env.FIRESTORE_MODE === 'firestore') {
  try {
    firestoreClient = new Firestore({
      projectId: env.GOOGLE_CLOUD_PROJECT,
    });
    console.log(`[Firestore] Connected to Google Cloud Firestore (project: ${env.GOOGLE_CLOUD_PROJECT})`);
  } catch (err) {
    console.warn('[Firestore] Failed to initialize Firestore client, falling back to memory store:', err);
  }
}

// In-Memory Storage Tables (used in local mode or testing)
const memoryUsers = new Map<string, UserProfile>();
const memoryActions = new Map<string, ActionLog[]>();
const memoryConversations = new Map<string, ChatMessage[]>();

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (firestoreClient) {
    try {
      const doc = await firestoreClient.collection('users').doc(userId).get();
      if (doc.exists) {
        return doc.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn(`[Firestore] Failed to read user ${userId}:`, err);
    }
  }

  return memoryUsers.get(userId) || null;
}

export async function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  const updatedProfile: UserProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  if (firestoreClient) {
    try {
      await firestoreClient
        .collection('users')
        .doc(profile.userId)
        .set(updatedProfile, { merge: true });
      return updatedProfile;
    } catch (err) {
      console.warn(`[Firestore] Failed to save user ${profile.userId}:`, err);
    }
  }

  memoryUsers.set(profile.userId, updatedProfile);
  return updatedProfile;
}

export async function logSustainabilityAction(action: ActionLog): Promise<ActionLog> {
  if (firestoreClient) {
    try {
      await firestoreClient.collection('sustainability_actions').doc(action.id).set(action);
      return action;
    } catch (err) {
      console.warn(`[Firestore] Failed to log action ${action.id}:`, err);
    }
  }

  const userActions = memoryActions.get(action.userId) || [];
  userActions.push(action);
  memoryActions.set(action.userId, userActions);
  return action;
}

export async function getUserActions(userId: string): Promise<ActionLog[]> {
  if (firestoreClient) {
    try {
      const snapshot = await firestoreClient
        .collection('sustainability_actions')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      return snapshot.docs.map((d) => d.data() as ActionLog);
    } catch (err) {
      console.warn(`[Firestore] Failed to fetch actions for ${userId}:`, err);
    }
  }

  const list = memoryActions.get(userId) || [];
  return [...list].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function saveConversation(
  conversationId: string,
  userId: string,
  messages: ChatMessage[]
): Promise<void> {
  if (firestoreClient) {
    try {
      await firestoreClient.collection('conversations').doc(conversationId).set({
        conversationId,
        userId,
        messages,
        updatedAt: new Date().toISOString(),
      });
      return;
    } catch (err) {
      console.warn(`[Firestore] Failed to save conversation ${conversationId}:`, err);
    }
  }

  memoryConversations.set(conversationId, messages);
}

export async function getConversation(conversationId: string): Promise<ChatMessage[]> {
  if (firestoreClient) {
    try {
      const doc = await firestoreClient.collection('conversations').doc(conversationId).get();
      if (doc.exists) {
        return (doc.data()?.messages as ChatMessage[]) || [];
      }
      return [];
    } catch (err) {
      console.warn(`[Firestore] Failed to fetch conversation ${conversationId}:`, err);
    }
  }

  return memoryConversations.get(conversationId) || [];
}

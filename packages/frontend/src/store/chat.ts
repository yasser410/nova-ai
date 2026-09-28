import { create } from 'zustand';
import { ChatRequest, ChatResponse } from '@nova/types';

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentId?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  conversations: Map<string, Conversation>;
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;

  // Conversation actions
  createConversation: (title?: string) => Promise<string>;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  getCurrentConversation: () => Conversation | null;

  // Message actions
  sendMessage: (message: string, stream?: boolean) => Promise<void>;
  addMessage: (conversationId: string, message: Message) => void;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: new Map(),
  currentConversationId: null,
  isLoading: false,
  error: null,

  createConversation: async (title?: string) => {
    try {
      set({ isLoading: true });
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const conversationId = data.data.conversationId;
      const newConversation: Conversation = {
        id: conversationId,
        title: title || 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      set((state) => ({
        conversations: new Map(state.conversations).set(conversationId, newConversation),
        currentConversationId: conversationId,
        isLoading: false,
      }));

      return conversationId;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  selectConversation: (id: string) => {
    set({ currentConversationId: id });
  },

  deleteConversation: async (id: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete conversation');

      set((state) => {
        const conversations = new Map(state.conversations);
        conversations.delete(id);
        return {
          conversations,
          currentConversationId:
            state.currentConversationId === id ? null : state.currentConversationId,
        };
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  getCurrentConversation: () => {
    const { conversations, currentConversationId } = get();
    return currentConversationId ? conversations.get(currentConversationId) || null : null;
  },

  sendMessage: async (message: string, stream = false) => {
    const { currentConversationId } = get();
    if (!currentConversationId) {
      set({ error: 'No conversation selected' });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      // Add user message
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        sender: 'user',
        content: message,
        timestamp: new Date(),
      };

      get().addMessage(currentConversationId, userMessage);

      if (stream) {
        // Streaming response
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: currentConversationId,
            message,
            stream: true,
          }),
        });

        if (!response.ok) throw new Error('Failed to send message');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let fullContent = '';
        const assistantMessageId = `msg_${Date.now() + 1}`;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split('\n\n').filter((line) => line.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                fullContent += data.content;
                set((state) => {
                  const conversation = state.conversations.get(currentConversationId);
                  if (!conversation) return state;

                  const existingMessage = conversation.messages.find(
                    (m) => m.id === assistantMessageId
                  );
                  if (existingMessage) {
                    existingMessage.content = fullContent;
                  } else {
                    conversation.messages.push({
                      id: assistantMessageId,
                      sender: 'assistant',
                      content: fullContent,
                      timestamp: new Date(),
                    });
                  }
                  return { conversations: new Map(state.conversations) };
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      } else {
        // Regular response
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: currentConversationId,
            message,
            stream: false,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const assistantMessage: Message = {
          id: data.data.messageId,
          sender: 'assistant',
          content: data.data.content,
          timestamp: new Date(),
          agentId: data.data.agentId,
        };

        get().addMessage(currentConversationId, assistantMessage);
      }

      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addMessage: (conversationId: string, message: Message) => {
    set((state) => {
      const conversation = state.conversations.get(conversationId);
      if (!conversation) return state;

      conversation.messages.push(message);
      conversation.updatedAt = new Date();

      return { conversations: new Map(state.conversations) };
    });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));

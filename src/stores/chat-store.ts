
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatState {
  messages: Message[];
  conversationId: string | null;
  addMessage: (message: Message) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  setConversationId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      conversationId: null,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      deleteMessage: (id) =>
        set((state) => ({ 
          messages: state.messages.filter(message => message.id !== id) 
        })),
      clearMessages: () => set({ messages: [] }),
      setConversationId: (id) => set({ conversationId: id }),
    }),
    {
      name: 'jarvis-chat-storage',
    }
  )
);

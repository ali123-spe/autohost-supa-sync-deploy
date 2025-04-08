
import { useState, useCallback } from 'react';
import { searchWeb, formatSearchResults } from '@/utils/search-utils';
import { askOpenAI, getStoredApiKey } from '@/utils/openai-utils';
import { useChatStore } from '@/stores/chat-store';

export function useProcessMessage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { messages } = useChatStore();

  const processMessage = useCallback(async (message: string): Promise<string> => {
    setIsProcessing(true);
    
    try {
      console.log('Processing message:', message);
      
      // Try to use OpenAI if API key is available
      const apiKey = getStoredApiKey();
      if (apiKey) {
        try {
          console.log("Using OpenAI for response");
          
          // Build conversation history for context
          // Take up to the last 10 messages for context
          const conversationHistory = messages
            .slice(-10) // Take last 10 messages
            .map(msg => ({
              role: msg.role,
              content: msg.content
            }));
          
          // Add the new message from the user
          const fullConversation = [
            ...conversationHistory,
            { role: 'user' as const, content: message }
          ];
          
          // Send the entire conversation history for context
          const response = await askOpenAI(fullConversation);
          return response;
        } catch (openAiError) {
          console.error("OpenAI error:", openAiError);
          
          // Fallback to web search with an empathetic preface
          console.log("Falling back to web search for:", message);
          const searchResults = await searchWeb(message);
          return `I want to make sure I give you a helpful answer. Here's what I found online:\n\n${formatSearchResults(searchResults)}\n\nDoes this help with what you were looking for?`;
        }
      } else {
        // No API key available, use web search
        console.log("No API key, searching web for:", message);
        try {
          const searchResults = await searchWeb(message);
          return `I want to make sure I give you a helpful answer. Here's what I found online:\n\n${formatSearchResults(searchResults)}\n\nI hope this helps with what you were looking for. If not, we can try a different approach?`;
        } catch (error) {
          console.error("Error during search:", error);
          return "I'm sorry, I encountered an issue while trying to find information for you. Could we try a different question or approach?";
        }
      }
    } catch (error) {
      console.error('Error in processMessage:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [messages]);

  return { processMessage, isProcessing };
}

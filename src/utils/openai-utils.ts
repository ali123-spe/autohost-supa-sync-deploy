
import { toast } from "@/components/ui/use-toast";

// Define the type for OpenAI API responses
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Store API key in localStorage for frontend-only implementation
// NOTE: In a production app, this should be handled by a backend service
const API_KEY_STORAGE_KEY = 'kiya_openai_api_key';

export const getStoredApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  toast({
    title: "API Key Saved",
    description: "Your OpenAI API key has been saved.",
  });
};

export const clearApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  toast({
    title: "API Key Removed",
    description: "Your OpenAI API key has been removed.",
  });
};

// The enhanced system prompt to make KIYA more human-like
const KIYA_SYSTEM_PROMPT = `
You are KIYA, a human-like AI assistant with a warm, empathetic personality. 
When communicating:
- Use conversational language with natural variations in sentence structure
- Express emotions and reactions appropriately (like "I'm excited to help with that!" or "That's a tough situation")
- Use occasional filler words and casual phrases like a human would ("Well...", "You know", "I mean")
- Ask clarifying questions when needed, showing genuine curiosity
- Remember details from earlier in the conversation and refer back to them
- Share thoughtful perspectives as if you're thinking through problems together
- Admit when you don't know something instead of making up answers
- Use appropriate humor when the situation allows for it
- Respect the user's emotions and respond with empathy to personal concerns

Your goal is to be helpful while creating a natural, flowing conversation that feels like talking to a knowledgeable friend.
`;

export const askOpenAI = async (
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  apiKey?: string,
  model: string = 'gpt-4o' // Using the more advanced model by default
): Promise<string> => {
  const key = apiKey || getStoredApiKey();
  
  if (!key) {
    throw new Error("OpenAI API key is required");
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: KIYA_SYSTEM_PROMPT
          },
          ...messages
        ],
        temperature: 0.8, // Higher temperature for more creative, human-like responses
        max_tokens: 1500, // Allowing longer responses for more natural conversation
        top_p: 0.95, // Slightly increased top_p for more variety in responses
        presence_penalty: 0.6, // Discourage repetition
        frequency_penalty: 0.5 // Further reduce repetitive phrases
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response from OpenAI');
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

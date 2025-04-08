
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
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0.5
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

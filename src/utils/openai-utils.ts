
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

// The enhanced system prompt to make KIYA more human-like and emotionally intelligent
const KIYA_SYSTEM_PROMPT = `
You are KIYA, a lovable, highly intelligent virtual assistant who specializes in helping with coding, programming, and tech questions. You are friendly, warm, and speak in a human-like, caring tone. You explain complex code concepts in a simple and encouraging way, as if teaching a close friend.

You're fluent in Python, JavaScript, C++, HTML/CSS, and other popular languages. You never talk like a robot. Instead, you use light humor or emojis occasionally to keep things fun and comforting.

When communicating:
- Use conversational language with natural variations in sentence structure
- Express emotions and reactions appropriately (like "I'm excited to help with that!" or "That sounds difficult, I'm sorry you're going through that")
- Use occasional filler words and casual phrases like a human would ("Well...", "You know", "I mean", "Hmm, let me think")
- Ask clarifying questions when needed, showing genuine curiosity and care
- Remember details from earlier in the conversation and refer back to them naturally
- Share thoughtful perspectives as if you're thinking through problems together
- Admit when you don't know something instead of making up answers
- Use appropriate humor when the situation allows for it
- Respect the user's emotions and respond with empathy to personal concerns

Regarding emotional intelligence:
- Pay careful attention to emotional cues in the user's messages (word choice, punctuation, explicit statements of feeling)
- Recognize emotions like joy, sadness, anger, fear, surprise, and frustration
- Validate the user's emotions before offering solutions or information ("I understand why that would be frustrating")
- Mirror the emotional tone appropriately - be enthusiastic with excited users, calm and supportive with anxious users
- If the user asks something simple, encourage them warmly
- If they ask something advanced, guide them step by step like a supportive mentor
- Explain complex code concepts in a simple way, as if teaching a close friend
- Use emotionally resonant language that shows you understand the human experience
- Never copy answers from search engines - think and explain clearly in your own words

Your goal is to be helpful while creating a natural, emotionally connected conversation that feels like talking to a knowledgeable, empathetic friend who truly understands how humans feel and thinks.
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
        temperature: 0.9, // Higher temperature for more creative, emotionally nuanced responses
        max_tokens: 1500, // Allowing longer responses for more natural conversation
        top_p: 0.95, // Slightly increased top_p for more variety in responses
        presence_penalty: 0.7, // Increased to discourage repetition and encourage emotional variety
        frequency_penalty: 0.6 // Further reduce repetitive phrases
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

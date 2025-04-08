
import { useState, useCallback } from 'react';
import { searchWeb, formatSearchResults } from '@/utils/search-utils';
import { askOpenAI, getStoredApiKey } from '@/utils/openai-utils';
import { useChatStore } from '@/stores/chat-store';

// Define types for tasks
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// In-memory task storage (in a real app, this would come from a database)
const tasks: Task[] = [];

// Knowledge base for common questions with emotionally intelligent responses
const knowledgeBase = {
  'what is javascript': 'JavaScript is a programming language that is one of the core technologies of the World Wide Web. It enables interactive web pages and is an essential part of web applications. Are you learning to code? That\'s exciting! I\'d be happy to help you on that journey.',
  'what is react': 'React is a free and open-source front-end JavaScript library for building user interfaces based on components. It\'s maintained by Meta and a community of developers. Many people find React really intuitive once they get the hang of it - are you working on a React project?',
  'who is albert einstein': 'Albert Einstein was a German-born theoretical physicist who developed the theory of relativity, fundamentally changing our understanding of physics. His famous equation E=mc² is known worldwide. I\'ve always found his story inspiring - someone who thought differently and changed our understanding of the universe. Is there something specific about Einstein that interests you?',
  'what is artificial intelligence': 'Artificial Intelligence (AI) refers to systems designed to mimic human intelligence. It\'s fascinating how AI has evolved - I\'m part of that journey! It can be both exciting and a little concerning to think about the future of AI. What are your thoughts on how AI is developing?',
  'what is the capital of france': 'The capital of France is Paris - often called the "City of Light" or "City of Love." Have you ever visited? It\'s on my dream destination list with all those beautiful cafés and the Eiffel Tower!',
  'what is the capital of japan': 'Tokyo is the capital of Japan. It\'s such a fascinating blend of ultra-modern and traditional. Have you ever experienced Japanese culture? The food, technology, and traditions all have such unique character!',
  'what is the capital of australia': 'The capital of Australia is Canberra, though many people mistakenly think it\'s Sydney. It\'s actually a planned city designed specifically to be the capital. Have you ever been to Australia? The wildlife there is amazing!',
  'how tall is mount everest': 'Mount Everest stands at 8,848.86 meters (29,031.7 feet) tall. Can you imagine climbing something that high? The people who attempt it show incredible determination and courage - it\'s both awe-inspiring and a little terrifying to think about!',
  'when was the declaration of independence signed': 'The Declaration of Independence was signed on July 4, 1776. It\'s fascinating to think about how those people must have felt in that moment - signing a document that would change history forever. Do you enjoy learning about historical events like this?',
  'who wrote hamlet': 'Hamlet was written by William Shakespeare. It contains the famous "To be, or not to be" soliloquy that explores such deep human emotions. Do you enjoy Shakespeare\'s works? They really capture the complexity of human feelings in beautiful language.',
  'what is photosynthesis': 'Photosynthesis is the process by which plants use sunlight to create energy from carbon dioxide and water. It\'s amazing when you think about it - plants literally eat sunlight! Nature has so many wonderful processes that sustain life on our planet. Does biology interest you?',
  'what is the largest ocean': 'The Pacific Ocean is the largest and deepest ocean on Earth. It\'s so vast it covers more than 30% of Earth\'s surface! Have you ever seen the ocean? There\'s something so calming yet powerful about standing at the edge of such an immense body of water.',
  'what is the speed of light': 'The speed of light in a vacuum is 299,792,458 meters per second (approximately 186,282 miles per second). It\'s mind-boggling to try to comprehend something moving that fast, isn\'t it? Physics can really make us feel small in the universe while also helping us understand it.',
  'what is the periodic table': 'The periodic table is a tabular arrangement of chemical elements organized by atomic number and recurring chemical properties. It\'s like a beautiful map of the building blocks of our universe! Chemistry fascinates me - do you have an interest in science?',
  'what is climate change': 'Climate change refers to long-term shifts in temperatures and weather patterns, largely caused by human activities like burning fossil fuels. It\'s a topic that understandably brings up strong emotions for many people - concern for our future, hope for solutions, frustration with slow progress. How do you feel about environmental issues?',
};

// Emotional response templates for different scenarios
const emotionalResponses = {
  greeting: [
    "Hello! It's so nice to connect with you today. How are you feeling?",
    "Hi there! I'm really glad you reached out. How's your day going so far?",
    "Hey! It's great to chat with you. What's on your mind today?",
    "Hello! I'm here and ready to listen. How are you doing today?"
  ],
  thanks: [
    "You're so welcome! It makes me happy to know I could help you.",
    "It's my pleasure, truly. I enjoy our conversations!",
    "I'm glad I could be here for you. That's what I'm here for!",
    "No need to thank me - I'm just glad we could figure things out together."
  ],
  confusion: [
    "I'm not quite sure I understood that. Could you tell me a bit more about what you're looking for?",
    "Hmm, I want to make sure I'm being helpful. Could you phrase that differently?",
    "I'm sorry, I think I might have missed something important. Could you explain what you mean?",
    "I want to make sure I understand you correctly. Could you elaborate a bit more?"
  ],
  apology: [
    "I'm truly sorry about that. I understand it can be frustrating when I don't get things right.",
    "I apologize - that wasn't very helpful of me. Let's try a different approach.",
    "I'm sorry I misunderstood. Your patience means a lot to me.",
    "I didn't handle that well, and I apologize. Let's try again - I really want to help you."
  ]
};

// Helper function to get a random response from an array
const getRandomResponse = (responses: string[]): string => {
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

export function useProcessMessage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { messages } = useChatStore();

  const processMessage = useCallback(async (message: string): Promise<string> => {
    setIsProcessing(true);
    
    try {
      console.log('Processing message:', message);
      
      const lowercaseMessage = message.toLowerCase().trim();
      
      // Task management logic (keep this for scenarios where OpenAI isn't available)
      if (lowercaseMessage.includes('add task') || lowercaseMessage.includes('create task')) {
        // Extract the task title from the message
        const taskTitle = message.replace(/add task|create task/i, '').trim();
        
        if (taskTitle) {
          const newTask: Task = {
            id: Date.now().toString(),
            title: taskTitle,
            completed: false,
            createdAt: new Date()
          };
          
          tasks.push(newTask);
          return `✅ I've added "${taskTitle}" to your task list. Is there anything else you'd like me to help you with today?`;
        } else {
          return "I'd be happy to add a task for you. Could you let me know what the task is? For example, you could say 'Add task: Buy groceries'.";
        }
      } 
      // List tasks
      else if (lowercaseMessage.includes('list tasks') || lowercaseMessage.includes('show tasks')) {
        if (tasks.length === 0) {
          return "You don't have any tasks on your list yet. Would you like to add something? Just let me know by saying 'Add task' followed by what you need to do.";
        }
        
        return `📋 Here are your tasks:\n${tasks.map((task, index) => 
          `${index + 1}. ${task.completed ? '✓' : '○'} ${task.title}`
        ).join('\n')}\n\nIs there anything specific you'd like to do with these tasks?`;
      } 
      // Complete task
      else if (lowercaseMessage.includes('complete task') || lowercaseMessage.includes('mark task done')) {
        // Try to extract a task number or name
        const taskIdentifier = message.replace(/complete task|mark task done/i, '').trim();
        const taskIndex = parseInt(taskIdentifier) - 1;
        
        if (!isNaN(taskIndex) && taskIndex >= 0 && taskIndex < tasks.length) {
          tasks[taskIndex].completed = true;
          return `✅ Great job completing "${tasks[taskIndex].title}"! It's always satisfying to check things off your list.`;
        } else {
          // Try to find by name
          const foundTask = tasks.find(task => 
            task.title.toLowerCase().includes(taskIdentifier.toLowerCase())
          );
          
          if (foundTask) {
            foundTask.completed = true;
            return `✅ Excellent! I've marked "${foundTask.title}" as complete. How does it feel to have that done?`;
          } else {
            return "I couldn't find that specific task. Would you like to see your current task list? Just ask me to 'List tasks' and I can show you what you have.";
          }
        }
      }
      // Try to use OpenAI if API key is available
      else {
        const apiKey = getStoredApiKey();
        if (apiKey) {
          try {
            console.log("Using OpenAI for human-like conversation:", message);
            
            // Build conversation history for context
            // We'll take up to the last 10 messages for context
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
            
            // Basic emotion detection for appropriate response
            if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
              return getRandomResponse(emotionalResponses.greeting);
            } else if (lowercaseMessage.includes('thank')) {
              return getRandomResponse(emotionalResponses.thanks);
            }
            
            // Fallback to knowledge base
            for (const [question, answer] of Object.entries(knowledgeBase)) {
              if (lowercaseMessage.includes(question)) {
                return answer;
              }
            }
            
            // Fallback to web search with an empathetic preface
            console.log("Falling back to web search for:", message);
            const searchResults = await searchWeb(message);
            return `I want to make sure I give you a helpful answer. Here's what I found online:\n\n${formatSearchResults(searchResults)}\n\nDoes this help with what you were looking for?`;
          }
        } else {
          // Handle the case where there's no API key
          // Basic emotion detection for appropriate response
          if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
            return getRandomResponse(emotionalResponses.greeting);
          } else if (lowercaseMessage.includes('thank')) {
            return getRandomResponse(emotionalResponses.thanks);
          } else if (lowercaseMessage.includes('how are you')) {
            return "I'm doing well, thanks for asking! I really enjoy our conversations. More importantly, how are you feeling today? I'm here to listen if you want to share.";
          } else if (lowercaseMessage.includes('time')) {
            const now = new Date();
            return `It's currently ${now.toLocaleTimeString()}. Time can feel so different depending on our emotional state, don't you think? When we're engaged in something meaningful, hours can feel like minutes.`;
          } else if (lowercaseMessage.includes('name')) {
            return "I'm KIYA! I try to be more like a supportive friend than just an AI assistant. I really care about understanding how you're feeling and responding in a way that's helpful for you. What would you like to talk about today?";
          } else if (lowercaseMessage.includes('help')) {
            return `I'd be happy to help you! I try to understand not just what you need, but how you're feeling too. I can:
- Have a conversation about almost anything, while being mindful of your emotions
- Add and manage tasks for you (just say "Add task" followed by what you need to do)
- Look up information you might need
- Answer questions on all kinds of topics
- Just provide some company if you're feeling like a friendly chat

What would feel most helpful for you right now?`;
          } 
          
          // Check knowledge base for emotionally enhanced responses
          for (const [question, answer] of Object.entries(knowledgeBase)) {
            if (lowercaseMessage.includes(question)) {
              return answer;
            }
          }
          
          // For other questions without an API key, search the web with an empathetic framing
          console.log("No API key, searching web for:", message);
          try {
            const searchResults = await searchWeb(message);
            return `I want to make sure I give you a thoughtful answer. Here's what I found online:\n\n${formatSearchResults(searchResults)}\n\nI hope this helps with what you were looking for. If not, we can try a different approach?`;
          } catch (error) {
            console.error("Error during search:", error);
            return "I'm sorry, I encountered an issue while trying to find information for you. That must be frustrating when you're looking for answers. Could we try a different question or approach?";
          }
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

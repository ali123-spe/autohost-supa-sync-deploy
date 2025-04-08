
import { useState, useCallback } from 'react';
import { searchWeb, formatSearchResults } from '@/utils/search-utils';
import { askOpenAI, getStoredApiKey } from '@/utils/openai-utils';

// Define types for tasks
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// In-memory task storage (in a real app, this would come from a database)
const tasks: Task[] = [];

// Knowledge base for common questions
const knowledgeBase = {
  'what is javascript': 'JavaScript is a programming language that is one of the core technologies of the World Wide Web. It enables interactive web pages and is an essential part of web applications.',
  'what is react': 'React is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta and a community of individual developers and companies.',
  'who is albert einstein': 'Albert Einstein was a German-born theoretical physicist, widely acknowledged to be one of the greatest and most influential physicists of all time. He is known for developing the theory of relativity and contributing to the development of quantum mechanics.',
  'what is artificial intelligence': 'Artificial Intelligence (AI) refers to systems or machines that mimic human intelligence to perform tasks and can iteratively improve themselves based on the information they collect.',
  'what is the capital of france': 'The capital of France is Paris.',
  'what is the capital of japan': 'The capital of Japan is Tokyo.',
  'what is the capital of australia': 'The capital of Australia is Canberra.',
  'how tall is mount everest': 'Mount Everest is 8,848.86 meters (29,031.7 feet) tall.',
  'when was the declaration of independence signed': 'The Declaration of Independence was signed on July 4, 1776.',
  'who wrote hamlet': 'Hamlet was written by William Shakespeare.',
  'what is photosynthesis': 'Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize nutrients from carbon dioxide and water.',
  'what is the largest ocean': 'The Pacific Ocean is the largest and deepest ocean on Earth.',
  'what is the speed of light': 'The speed of light in a vacuum is 299,792,458 meters per second (approximately 186,282 miles per second).',
  'what is the periodic table': 'The periodic table is a tabular display of chemical elements organized by atomic number, electron configuration, and recurring chemical properties.',
  'what is climate change': 'Climate change refers to long-term shifts in temperatures and weather patterns, mainly caused by human activities, particularly the burning of fossil fuels.',
};

export function useProcessMessage() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processMessage = useCallback(async (message: string): Promise<string> => {
    setIsProcessing(true);
    
    try {
      console.log('Processing message:', message);
      
      const lowercaseMessage = message.toLowerCase().trim();
      
      // Task management logic
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
          return `✅ Task created: "${taskTitle}"`;
        } else {
          return "Please specify a task title. For example: 'Add task Buy groceries'";
        }
      } 
      // List tasks
      else if (lowercaseMessage.includes('list tasks') || lowercaseMessage.includes('show tasks')) {
        if (tasks.length === 0) {
          return "You don't have any tasks yet. Try adding some with 'Add task [task description]'.";
        }
        
        return `📋 Your tasks:\n${tasks.map((task, index) => 
          `${index + 1}. ${task.completed ? '✓' : '○'} ${task.title}`
        ).join('\n')}`;
      } 
      // Complete task
      else if (lowercaseMessage.includes('complete task') || lowercaseMessage.includes('mark task done')) {
        // Try to extract a task number or name
        const taskIdentifier = message.replace(/complete task|mark task done/i, '').trim();
        const taskIndex = parseInt(taskIdentifier) - 1;
        
        if (!isNaN(taskIndex) && taskIndex >= 0 && taskIndex < tasks.length) {
          tasks[taskIndex].completed = true;
          return `✅ Marked task "${tasks[taskIndex].title}" as complete`;
        } else {
          // Try to find by name
          const foundTask = tasks.find(task => 
            task.title.toLowerCase().includes(taskIdentifier.toLowerCase())
          );
          
          if (foundTask) {
            foundTask.completed = true;
            return `✅ Marked task "${foundTask.title}" as complete`;
          } else {
            return "I couldn't find that task. Try 'List tasks' to see all your tasks.";
          }
        }
      }
      // Check if the question matches any knowledge base entry
      else {
        // Check for exact matches in knowledge base
        for (const [question, answer] of Object.entries(knowledgeBase)) {
          if (lowercaseMessage.includes(question)) {
            return answer;
          }
        }
        
        // General conversational responses for common phrases
        if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
          return 'Hello! How can I assist you today? Feel free to ask me any questions or request help with your tasks.';
        } else if (lowercaseMessage.includes('how are you')) {
          return 'I am functioning optimally. Thank you for asking. How can I assist you today?';
        } else if (lowercaseMessage.includes('time')) {
          const now = new Date();
          return `The current time is ${now.toLocaleTimeString()}.`;
        } else if (lowercaseMessage.includes('name')) {
          return 'I am KIYA, your virtual assistant. I can help you with tasks, answer questions, and provide information on various topics.';
        } else if (lowercaseMessage.includes('thank')) {
          return 'You\'re welcome! Is there anything else I can help you with?';
        } else if (lowercaseMessage.includes('help')) {
          return `I can help you with various tasks and answer questions on different topics. Try these commands:
- "Add task [description]" - Create a new task
- "List tasks" - Show all your tasks
- "Complete task [number or name]" - Mark a task as complete
- Ask me any question and I'll search the web for answers or use my built-in knowledge
- Ask me about the time or just chat with me!`;
        } 
        
        // Try to use OpenAI if API key is available
        const apiKey = getStoredApiKey();
        if (apiKey) {
          try {
            console.log("Contacting OpenAI for:", message);
            const response = await askOpenAI([{role: 'user', content: message}]);
            return response;
          } catch (openAiError) {
            console.error("OpenAI error:", openAiError);
            
            // Fallback to web search if OpenAI fails
            console.log("Falling back to web search for:", message);
            const searchResults = await searchWeb(message);
            return formatSearchResults(searchResults);
          }
        } else {
          // For questions without an OpenAI API key, search the web
          console.log("No API key, searching web for:", message);
          try {
            const searchResults = await searchWeb(message);
            return formatSearchResults(searchResults);
          } catch (error) {
            console.error("Error during search:", error);
            return "I encountered an error while searching for information. Please try again with a different query.";
          }
        }
      }
      
    } catch (error) {
      console.error('Error in processMessage:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processMessage, isProcessing };
}

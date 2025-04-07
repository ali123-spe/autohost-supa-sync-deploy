
import { useState, useCallback } from 'react';

// Define types for tasks
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// In-memory task storage (in a real app, this would come from a database)
const tasks: Task[] = [];

export function useProcessMessage() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processMessage = useCallback(async (message: string): Promise<string> => {
    setIsProcessing(true);
    
    try {
      console.log('Processing message:', message);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const lowercaseMessage = message.toLowerCase();
      
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
      // General conversational responses as before
      else if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
        return 'Hello! How can I assist you today?';
      } else if (lowercaseMessage.includes('how are you')) {
        return 'I am functioning optimally. Thank you for asking.';
      } else if (lowercaseMessage.includes('weather')) {
        return 'I currently don\'t have access to real-time weather data, but I can help you with many other requests.';
      } else if (lowercaseMessage.includes('time')) {
        const now = new Date();
        return `The current time is ${now.toLocaleTimeString()}.`;
      } else if (lowercaseMessage.includes('name')) {
        return 'I am JARVIS, your virtual assistant.';
      } else if (lowercaseMessage.includes('help')) {
        return `I can help you with various tasks. Try these commands:
- "Add task [description]" - Create a new task
- "List tasks" - Show all your tasks
- "Complete task [number or name]" - Mark a task as complete
- Ask me about the time, weather, or just chat with me!`;
      } else {
        return "I understand your message. If you'd like to manage tasks, try saying 'Add task', 'List tasks', or 'Complete task'. You can also ask for 'help' to see what I can do.";
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

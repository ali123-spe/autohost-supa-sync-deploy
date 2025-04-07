
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import KiyaAvatar from './KiyaAvatar';
import { useChatStore } from '@/stores/chat-store';
import { useProcessMessage } from '@/hooks/use-process-message';
import { useSpeech } from '@/hooks/use-speech';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ConversationUI: React.FC = () => {
  const { messages, addMessage, deleteMessage, clearMessages } = useChatStore();
  const { processMessage, isProcessing } = useProcessMessage();
  const { speak, stopSpeaking, isSpeaking, toggleMute, isMuted } = useSpeech();
  
  const [input, setInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user' as const,
      timestamp: new Date(),
    };
    
    addMessage(userMessage);
    setInput('');
    
    try {
      const response = await processMessage(input);
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response || "I'm sorry, I couldn't process your request.",
        role: 'assistant' as const,
        timestamp: new Date(),
      };
      
      addMessage(assistantMessage);
      
      // Speak the response
      if (!isMuted) {
        speak(assistantMessage.content);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive",
      });
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      
      // Check if browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          toast({
            title: "Listening",
            description: "Say something...",
          });
        };
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
          
          // Auto-submit after short delay
          setTimeout(() => {
            inputRef.current?.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }, 500);
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast({
            title: "Error",
            description: `Couldn't recognize speech: ${event.error}`,
            variant: "destructive",
          });
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.start();
      } else {
        toast({
          title: "Not supported",
          description: "Speech recognition is not supported in this browser",
          variant: "destructive",
        });
        setIsListening(false);
      }
    }
  };

  const handleClearConversation = () => {
    setIsAlertOpen(true);
  };

  const confirmClearConversation = () => {
    stopSpeaking();  // Stop any ongoing speech
    clearMessages();
    setIsAlertOpen(false);
    toast({
      title: "Conversation cleared",
      description: "All messages have been deleted",
    });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="py-6 text-center">
        <KiyaAvatar 
          isActive={true}
          isListening={isListening}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
        />
        <h1 className="text-2xl font-bold mt-4 text-white">KIYA</h1>
        <p className="text-muted-foreground">Your AI Assistant</p>
      </div>
      
      <Card className="flex-1 overflow-hidden flex flex-col bg-black/20 backdrop-blur-sm border-jarvis-navy relative">
        {messages.length > 0 && (
          <div className="absolute right-4 top-4 flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8"
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex gap-1 items-center h-8"
              onClick={handleClearConversation}
            >
              <Trash2 className="h-3 w-3" /> Clear
            </Button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 pt-12">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Welcome to KIYA</h3>
                <p className="text-muted-foreground mb-4">
                  I can help you manage tasks and answer your questions using Wikipedia and web search.
                </p>
                <div className="space-y-2 text-sm text-left bg-black/20 p-4 rounded-md mx-auto max-w-md">
                  <p className="font-medium">Try asking me:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>"What is the latest news about artificial intelligence?"</li>
                    <li>"Tell me about quantum computing"</li>
                    <li>"Who is Marie Curie?"</li>
                    <li>"What happened during the Apollo 11 mission?"</li>
                    <li>"Add task Buy groceries"</li>
                    <li>"List tasks"</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "message-bubble group relative",
                    message.role === "user" ? "user" : "assistant"
                  )}
                >
                  {message.content}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6"
                    onClick={() => deleteMessage(message.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-jarvis-navy">
          <div className="flex space-x-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={toggleListening}
              className={cn(
                "flex-shrink-0",
                isListening && "bg-jarvis-teal text-white hover:bg-jarvis-teal/90"
              )}
            >
              {isListening ? <Mic /> : <MicOff />}
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything or enter a task command..."
              className="flex-1 bg-jarvis-navy/50 border-jarvis-navy focus-visible:ring-jarvis-teal"
              disabled={isListening || isProcessing}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isProcessing}
              className="flex-shrink-0 bg-jarvis-teal hover:bg-jarvis-teal/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-jarvis-navy border-jarvis-teal">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the entire conversation history?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmClearConversation}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConversationUI;

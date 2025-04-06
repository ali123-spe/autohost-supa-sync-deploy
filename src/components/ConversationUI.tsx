
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import JarvisAvatar from './JarvisAvatar';
import { useChatStore } from '@/stores/chat-store';
import { useProcessMessage } from '@/hooks/use-process-message';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ConversationUI: React.FC = () => {
  const { messages, addMessage } = useChatStore();
  const { processMessage, isProcessing } = useProcessMessage();
  
  const [input, setInput] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
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
    
    // Add user message
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
      
      // Add assistant response
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response || "I'm sorry, I couldn't process your request.",
        role: 'assistant' as const,
        timestamp: new Date(),
      };
      
      addMessage(assistantMessage);
      // Here you would trigger text-to-speech for the response
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
      
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
      // Stop speech recognition here
    } else {
      setIsListening(true);
      toast({
        title: "Listening",
        description: "Voice input is not fully implemented in this version",
      });
      // Start speech recognition here
      setTimeout(() => {
        setIsListening(false);
        inputRef.current?.focus();
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="py-6 text-center">
        <JarvisAvatar 
          isActive={true}
          isListening={isListening}
          isProcessing={isProcessing}
          isSpeaking={isSpeaking}
        />
        <h1 className="text-2xl font-bold mt-4 text-white">JARVIS</h1>
        <p className="text-muted-foreground">Your AI Assistant</p>
      </div>
      
      <Card className="flex-1 overflow-hidden flex flex-col bg-black/20 backdrop-blur-sm border-jarvis-navy">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Welcome to JARVIS</h3>
                <p className="text-muted-foreground">
                  How can I assist you today?
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "message-bubble",
                    message.role === "user" ? "user" : "assistant"
                  )}
                >
                  {message.content}
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
              placeholder="Type your message..."
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
    </div>
  );
};

export default ConversationUI;


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Index = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ type: "user" | "assistant"; content: string }[]>([
    { type: "assistant", content: "Hello! I'm your virtual assistant. How can I help you today?" }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages([...messages, { type: "user", content: input }]);
    
    // Process the query and generate a response
    setTimeout(() => {
      const response = getAssistantResponse(input);
      setMessages(prev => [...prev, { type: "assistant", content: response }]);
      toast.success("New message received!");
    }, 500);
    
    setInput("");
  };

  const getAssistantResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
      return "Hello there! How can I assist you today?";
    } else if (lowerQuery.includes("weather")) {
      return "I'm sorry, I don't have access to real-time weather data yet, but I can help with other questions!";
    } else if (lowerQuery.includes("time")) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    } else if (lowerQuery.includes("date")) {
      return `Today's date is ${new Date().toLocaleDateString()}.`;
    } else if (lowerQuery.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?";
    } else if (lowerQuery.includes("help")) {
      return "I can answer simple questions, tell you the time or date, and have basic conversations. Just type your question and press send!";
    } else {
      return "I'm still learning! Could you ask something else or rephrase your question?";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg h-[600px] flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="text-center">Simple Virtual Assistant</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                message.type === "user" 
                  ? "bg-blue-100 ml-auto max-w-[80%]" 
                  : "bg-gray-100 mr-auto max-w-[80%]"
              }`}
            >
              {message.content}
            </div>
          ))}
        </CardContent>
        
        <CardFooter className="border-t p-4">
          <div className="flex w-full space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here..."
              className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleSend} className="bg-blue-500 hover:bg-blue-600">
              Send
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;

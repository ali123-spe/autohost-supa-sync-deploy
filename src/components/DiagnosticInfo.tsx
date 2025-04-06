
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useChatStore } from '@/stores/chat-store';
import { useLocation } from 'react-router-dom';

const DiagnosticInfo: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { messages } = useChatStore();
  const location = useLocation();
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    console.log("DiagnosticInfo component mounted");
    setMounted(true);
    
    // Test store access
    console.log("Chat store messages count:", messages.length);
    
    // Check for global errors
    const originalError = console.error;
    console.error = (...args) => {
      console.log("Captured error:", ...args);
      originalError(...args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, [messages]);
  
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, []);
  
  return (
    <Card className="mt-4 border-red-500">
      <CardHeader>
        <CardTitle className="text-red-500">Diagnostic Information</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="space-y-2">
          <p>✅ Component rendered successfully</p>
          <p>📍 Current route: {location.pathname}</p>
          <p>🔄 Render count: {renderCount}</p>
          <p>💾 Store messages: {messages.length}</p>
          <p>⚙️ React version: {React.version}</p>
          <p>🕒 Current time: {new Date().toISOString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticInfo;

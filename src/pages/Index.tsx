
import React from 'react';
import ConversationUI from '@/components/ConversationUI';
import SettingsForm from '@/components/SettingsForm';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DiagnosticInfo from '@/components/DiagnosticInfo';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-jarvis-teal">JARVIS</h1>
          <p className="text-xs text-muted-foreground">Virtual Assistant</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Github className="mr-1 h-3 w-3" /> Connect GitHub
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Connect Supabase
          </Button>
        </div>
      </header>
      
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex">
          <ConversationUI />
        </TabsContent>
        
        <TabsContent value="settings" className="flex-1">
          <SettingsForm />
        </TabsContent>
      </Tabs>
      
      {/* Add diagnostic information */}
      <DiagnosticInfo />
      
      <footer className="mt-6 text-center text-xs text-muted-foreground">
        <p>JARVIS Virtual Assistant - Prototype v0.2</p>
      </footer>
    </div>
  );
};

export default Index;

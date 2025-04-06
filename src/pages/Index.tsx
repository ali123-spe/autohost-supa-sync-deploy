
import React from 'react';
import ConversationUI from '@/components/ConversationUI';
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
            <GitHubLogoIcon className="mr-1 h-3 w-3" /> Connect GitHub
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
          <div className="max-w-4xl mx-auto w-full space-y-6">
            <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-jarvis-navy">
              <h2 className="text-xl font-bold mb-4">System Configuration</h2>
              <p className="text-muted-foreground mb-4">
                JARVIS is currently running in prototype mode with limited functionality.
                Connect to Supabase and GitHub to enable full capabilities.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 border border-dashed border-jarvis-navy rounded-md">
                  <h3 className="font-medium mb-2">Voice Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Voice input/output requires API keys and is not fully implemented in this prototype.
                  </p>
                </div>
                
                <div className="p-4 border border-dashed border-jarvis-navy rounded-md">
                  <h3 className="font-medium mb-2">NLP Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced natural language processing capabilities will be enabled after connecting to backend services.
                  </p>
                </div>
                
                <div className="p-4 border border-dashed border-jarvis-navy rounded-md">
                  <h3 className="font-medium mb-2">Memory System</h3>
                  <p className="text-sm text-muted-foreground">
                    Long-term memory and context management requires Supabase integration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <footer className="mt-6 text-center text-xs text-muted-foreground">
        <p>JARVIS Virtual Assistant - Prototype v0.1</p>
      </footer>
    </div>
  );
};

export default Index;

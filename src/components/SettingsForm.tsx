
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SettingsForm: React.FC = () => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceModel, setVoiceModel] = useState("default");
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [apiKey, setApiKey] = useState("");
  
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, these would be saved to a settings store or backend
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-jarvis-navy">
        <h2 className="text-xl font-bold mb-4">System Configuration</h2>
        <p className="text-muted-foreground mb-6">
          Configure JARVIS settings. Some features require external API connections.
          Connect to Supabase and GitHub to enable full capabilities.
        </p>
        
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border border-dashed border-jarvis-navy rounded-md">
              <h3 className="font-medium mb-4">Voice Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voice-enabled" className="flex flex-col gap-1">
                    <span>Enable Voice</span>
                    <span className="text-xs text-muted-foreground">
                      Turn on text-to-speech output
                    </span>
                  </Label>
                  <Switch 
                    id="voice-enabled" 
                    checked={voiceEnabled}
                    onCheckedChange={setVoiceEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="voice-model">Voice Model</Label>
                  <Select
                    disabled={!voiceEnabled}
                    value={voiceModel}
                    onValueChange={setVoiceModel}
                  >
                    <SelectTrigger id="voice-model">
                      <SelectValue placeholder="Select voice model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="natural">Natural</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="voice-speed">Voice Speed</Label>
                    <span className="text-sm">{voiceSpeed[0]}x</span>
                  </div>
                  <Slider
                    id="voice-speed"
                    disabled={!voiceEnabled}
                    value={voiceSpeed}
                    min={0.5}
                    max={2}
                    step={0.1}
                    onValueChange={setVoiceSpeed}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your voice API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for voice functionality
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-dashed border-jarvis-navy rounded-md">
              <h3 className="font-medium mb-4">NLP Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced natural language processing capabilities will be enabled after connecting to backend services.
              </p>
              
              <Button variant="outline" disabled className="w-full">
                Configure NLP (Coming Soon)
              </Button>
            </div>
            
            <div className="p-4 border border-dashed border-jarvis-navy rounded-md">
              <h3 className="font-medium mb-4">Memory System</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Long-term memory and context management requires Supabase integration.
              </p>
              
              <Button variant="outline" disabled className="w-full">
                Configure Memory (Coming Soon)
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-jarvis-teal hover:bg-jarvis-teal/90">
            Save Settings
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SettingsForm;

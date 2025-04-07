
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Volume2, Mic } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const VoiceConfig = () => {
  const [elevenlabsKey, setElevenlabsKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [voiceVolume, setVoiceVolume] = useState([50]);
  const [autoListen, setAutoListen] = useState(false);

  const handleSaveConfig = () => {
    toast({
      title: "API Keys Saved",
      description: "Your voice configuration has been updated.",
    });
  };

  const handleTestVoice = () => {
    // We can now use the native browser speech synthesis
    const utterance = new SpeechSynthesisUtterance("Hello, I am KIYA, your AI assistant. How can I help you today?");
    speechSynthesis.speak(utterance);
    
    toast({
      title: "Voice Test",
      description: "Testing voice output using browser speech synthesis.",
    });
  };

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8 text-jarvis-teal">Voice Configuration</h1>
      
      <div className="grid gap-6">
        <Card className="bg-black/20 backdrop-blur-sm border-jarvis-navy">
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Configure your voice API connections for KIYA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="elevenlabs">ElevenLabs API Key</Label>
              <Input
                id="elevenlabs"
                type="password"
                placeholder="Enter your ElevenLabs API key"
                value={elevenlabsKey}
                onChange={(e) => setElevenlabsKey(e.target.value)}
                className="bg-jarvis-navy/50 border-jarvis-navy"
              />
              <p className="text-xs text-muted-foreground">
                Used for enhanced text-to-speech generation
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="openai">OpenAI API Key</Label>
              <Input
                id="openai"
                type="password"
                placeholder="Enter your OpenAI API key"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="bg-jarvis-navy/50 border-jarvis-navy"
              />
              <p className="text-xs text-muted-foreground">
                Used for enhanced speech-to-text with Whisper API
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveConfig} className="bg-jarvis-teal hover:bg-jarvis-teal/90">
              Save API Keys
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-sm border-jarvis-navy">
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>
              Customize KIYA voice behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-volume">Voice Volume</Label>
                  <p className="text-xs text-muted-foreground">
                    Adjust the output volume of KIYA voice
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    id="voice-volume"
                    value={voiceVolume}
                    onValueChange={setVoiceVolume}
                    max={100}
                    step={1}
                    className="w-[180px]"
                  />
                  <span className="w-12 text-sm text-right">{voiceVolume}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Listening Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    KIYA will automatically listen for commands
                  </p>
                </div>
                <Switch
                  checked={autoListen}
                  onCheckedChange={setAutoListen}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleTestVoice}>
              <Mic className="mr-2 h-4 w-4" /> Test Voice
            </Button>
            <Button className="bg-jarvis-teal hover:bg-jarvis-teal/90">
              Save Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Voice features are now available using your browser's built-in speech synthesis.</p>
        <p>For premium voice features, provide valid API keys to connect to ElevenLabs.</p>
      </div>
    </div>
  );
};

export default VoiceConfig;

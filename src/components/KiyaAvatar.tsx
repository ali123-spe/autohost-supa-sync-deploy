
import React, { useState, useEffect } from 'react';
import { CircleUser } from "lucide-react";

interface KiyaAvatarProps {
  isActive: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
}

const KiyaAvatar: React.FC<KiyaAvatarProps> = ({ 
  isActive, 
  isListening, 
  isProcessing, 
  isSpeaking 
}) => {
  const [animation, setAnimation] = useState<string>('');
  
  useEffect(() => {
    if (!isActive) {
      setAnimation('opacity-50');
    } else if (isListening) {
      setAnimation('animate-pulse-slow border-jarvis-teal');
    } else if (isProcessing) {
      setAnimation('animate-spin-slow opacity-80');
    } else if (isSpeaking) {
      setAnimation('border-jarvis-teal');
    } else {
      setAnimation('');
    }
  }, [isActive, isListening, isProcessing, isSpeaking]);

  return (
    <div className="flex items-center justify-center">
      <div className={`p-1 rounded-full border-2 ${animation} transition-all duration-300`}>
        <div className="relative w-24 h-24 rounded-full bg-jarvis-navy flex items-center justify-center overflow-hidden">
          {isActive && (
            <div className="absolute inset-0 bg-gradient-radial from-jarvis-teal/20 to-transparent opacity-60"></div>
          )}
          {isSpeaking && <VoiceWave />}
          <CircleUser className="w-16 h-16 text-jarvis-teal" />
        </div>
      </div>
    </div>
  );
};

const VoiceWave: React.FC = () => {
  return (
    <div className="voice-wave absolute inset-0 flex items-center justify-center">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="voice-wave-bar animate-wave"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
};

export default KiyaAvatar;


import { useState, useCallback, useRef, useEffect } from 'react';

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize preferred voice
  useEffect(() => {
    // Wait for voices to be loaded
    if (window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Try to find a female voice first (for KIYA)
        const femaleVoice = voices.find(voice => 
          voice.name.includes('female') || 
          voice.name.includes('woman') || 
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('lisa') ||
          voice.name.toLowerCase().includes('google us english female')
        );
        
        // If no specific female voice found, try to get any English voice
        const englishVoice = voices.find(voice => 
          voice.lang.includes('en-') || 
          voice.lang.includes('en_')
        );
        
        // Set the preferred voice
        voiceRef.current = femaleVoice || englishVoice || voices[0];
      };

      // Load voices right away if they're already available
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      }

      // Also set up the event for when voices are loaded asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis || isMuted) return;
    
    // Cancel any ongoing speech
    stopSpeaking();
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set the voice if we have a preferred one
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    
    // Set utterance properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Store the utterance for potential cancellation
    speechSynthRef.current = utterance;
    
    // Set up event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isSpeaking && !isMuted) {
      stopSpeaking();
    }
    setIsMuted(prev => !prev);
  }, [isMuted, isSpeaking, stopSpeaking]);

  return { speak, stopSpeaking, isSpeaking, isMuted, toggleMute };
}

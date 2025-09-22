// src/hooks/useTextToSpeech.ts
import { useCallback, useRef, useState } from "react";

export function useTextToSpeech() {
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string, lang: string = "es-ES") => {
    if (!text) return;
    if (synthRef.current.speaking) {
      synthRef.current.cancel(); // detener lo anterior
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}

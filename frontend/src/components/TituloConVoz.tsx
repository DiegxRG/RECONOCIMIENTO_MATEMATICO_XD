// src/components/TituloConVoz.tsx
import React, { useEffect } from "react";
import { useTextToSpeech } from "../hooks/useTextToSpeech";

type Props = {
  texto: string;
  autoHablar?: boolean; // opcional: que hable solo al montar
};

export default function TituloConVoz({ texto, autoHablar = false }: Props) {
  const { speak, stop, isSpeaking } = useTextToSpeech();

  useEffect(() => {
    if (autoHablar) speak(texto);
  }, [autoHablar, texto, speak]);

  return (
    <div className="flex flex-col items-center gap-2">
      <h1 className="text-2xl font-bold">{texto}</h1>
      <div className="flex gap-2">
        <button
          onClick={() => speak(texto)}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          🔊 Hablar
        </button>
        {isSpeaking && (
          <button
            onClick={stop}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            ⏹ Detener
          </button>
        )}
      </div>
    </div>
  );
}

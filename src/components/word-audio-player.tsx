
"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { generateSpeech } from "@/ai/flows/text-to-speech-flow";
import { useToast } from "@/hooks/use-toast";

interface WordAudioPlayerProps {
  word: string;
}

export function WordAudioPlayer({ word }: WordAudioPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePlayAudio = async () => {
    setIsLoading(true);
    try {
      const result = await generateSpeech({ text: word });
      if (result?.audioDataUri) {
        const audio = new Audio(result.audioDataUri);
        audio.play();
      } else {
        throw new Error("Audio data URI was not returned from the AI.");
      }
    } catch (error) {
      console.error("Failed to generate or play audio:", error);
      toast({
        title: "Error",
        description: "Could not play audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handlePlayAudio}
      disabled={isLoading}
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
      aria-label={`Listen to the word: ${word}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
}

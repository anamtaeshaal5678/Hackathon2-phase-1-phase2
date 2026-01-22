"use client";

import { useState, useEffect } from "react";

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    disabled?: boolean;
    language?: string;
}

export default function VoiceInput({ onTranscript, disabled, language = "en-US" }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = language;

        recognitionInstance.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
            setIsListening(false);
        };

        recognitionInstance.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognitionInstance.onend = () => {
            setIsListening(false);
        };

        setRecognition(recognitionInstance);

        return () => {
            recognitionInstance.stop();
        };
    }, [onTranscript, language]);

    const toggleListening = () => {
        if (isListening) {
            recognition?.stop();
        } else {
            setIsListening(true);
            recognition?.start();
        }
    };

    if (!recognition) return null;

    return (
        <button
            onClick={toggleListening}
            disabled={disabled}
            className={`p-3 rounded-xl transition-all duration-300 relative ${isListening
                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
            title={isListening ? "Listening..." : "Voice Input"}
        >
            {isListening && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            )}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        </button>
    );
}

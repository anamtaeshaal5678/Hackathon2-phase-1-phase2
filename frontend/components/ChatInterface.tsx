"use client";

import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";
import VoiceInput from "./VoiceInput";

interface Message {
    role: "user" | "assistant";
    content: string;
    created_at: string;
}

export default function ChatInterface() {
    const session = authClient.useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [urduMode, setUrduMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (session.data?.user.id) {
            fetchHistory();
        }
    }, [session.data?.user.id]);

    const fetchHistory = async () => {
        try {
            const convs = await apiFetch(`/chat/${session.data?.user.id}/conversations`);
            if (convs && convs.length > 0) {
                setConversationId(convs[0].id);
                const history = await apiFetch(`/chat/${session.data?.user.id}/conversations/${convs[0].id}/messages`);
                setMessages(history);
            }
        } catch (err) {
            console.error("Failed to fetch chat history:", err);
        }
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim() || !session.data?.user.id) return;

        const userMsg: Message = {
            role: "user",
            content: text,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await apiFetch(`/chat/${session.data.user.id}`, {
                method: "POST",
                body: JSON.stringify({
                    conversation_id: conversationId,
                    message: text,
                }),
            });

            if (response) {
                setConversationId(response.conversation_id);
                const aiMsg: Message = {
                    role: "assistant",
                    content: response.response,
                    created_at: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, aiMsg]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            const errorMsg: Message = {
                role: "assistant",
                content: urduMode ? "معذرت، کچھ غلط ہو گیا" : "Sorry, something went wrong.",
                created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-white font-bold tracking-tight">Todo AI Assistant</h2>
                        <p className="text-white/60 text-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Agent Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setUrduMode(!urduMode)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${urduMode ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                >
                    {urduMode ? "اردو" : "English"}
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                        <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <p className="text-sm">
                            {urduMode ? "نیا کام شروع کرنے کے لیے کچھ لکھیں" : "How can I help you today?"}
                        </p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${msg.role === "user"
                                ? "bg-black text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                                }`}
                        >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <p className={`text-[10px] mt-1 opacity-50 ${msg.role === "user" ? "text-white" : "text-gray-500"}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 shadow-sm border border-gray-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" />
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Smart Suggestions */}
            {!loading && (
                <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar bg-white border-t border-gray-50">
                    {[
                        { en: "Show high priority", ur: "ضروری کام دکھاؤ" },
                        { en: "What's due today?", ur: "آج کیا کام ہے؟" },
                        { en: "Show pending tasks", ur: "نامکمل کام دکھاؤ" },
                    ].map((s, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(urduMode ? s.ur : s.en)}
                            className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-bold text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all"
                            dir={urduMode ? "rtl" : "ltr"}
                        >
                            {urduMode ? s.ur : s.en}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">

                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder={urduMode ? "یہاں لکھیں..." : "Type a message..."}
                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black transition-all"
                        dir={urduMode ? "rtl" : "ltr"}
                    />
                    <VoiceInput onTranscript={(t: string) => handleSend(t)} disabled={loading} language={urduMode ? "ur-PK" : "en-US"} />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-black/20 active:scale-95"
                    >
                        <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

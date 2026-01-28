"use client";

import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (session.data?.user.id) {
            fetchHistory().then(history => {
                if (!history || history.length === 0) {
                    setMessages([{
                        role: "assistant",
                        content: "🛡️ Cluster Connection Established. System status is READY. I am your Phase IV Agentic assistant. How can I help with your specifications today?",
                        created_at: new Date().toISOString()
                    }]);
                }
            });
        }
    }, [session.data?.user.id]);

    const fetchHistory = async () => {
        try {
            const convs = await apiFetch(`/chat/${session.data?.user.id}/conversations`);
            if (convs && convs.length > 0) {
                setConversationId(convs[0].id);
                const history = await apiFetch(`/chat/${session.data?.user.id}/conversations/${convs[0].id}/messages`);
                setMessages(history);
                return history;
            }
            return [];
        } catch (err) {
            console.error("Failed to fetch chat history:", err);
            return [];
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-30">
                        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-xs font-bold uppercase tracking-widest">Awaiting connection...</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center shadow-inner border border-white/50">
                                    <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05l-3.293 3.293a1 1 0 01-1.414 0l-3.293-3.293a1 1 0 01-.285-1.05l1.738-5.42-1.233-.616a1 1 0 01.894-1.79l1.599.8L11 4.323V3a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                </div>
                            )}
                            <div className={`relative p-3 rounded-xl text-xs font-medium shadow-sm border ${msg.role === "user"
                                ? "bg-slate-800 text-white border-slate-700"
                                : "bg-white/80 text-slate-700 border-white/60"
                                }`}>
                                <p className="leading-relaxed">{msg.content}</p>
                                <span className="absolute -bottom-4 right-0 text-[9px] text-slate-400 font-bold uppercase">
                                    {msg.role === "user" ? "User" : "Agent"} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/60 rounded-xl px-4 py-3 flex gap-1 border border-white/40 shadow-sm animate-pulse">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/40 bg-slate-50/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 bg-white/70 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-400 font-medium"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50 shadow-sm"
                    >
                        <svg className="w-4 h-4 rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import Link from "next/link";

export default function ChatPage() {
    const router = useRouter();
    const session = authClient.useSession();

    useEffect(() => {
        if (session.isPending) return;
        if (session.data === null) {
            router.push("/signin");
        }
    }, [session.isPending, session.data, router]);

    if (session.isPending) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!session.data) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-600"
                            title="Back to Dashboard"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Chatbot</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-gray-500 text-sm">
                            Logged in as <span className="font-semibold text-gray-900">{session.data.user.name || session.data.user.email}</span>
                        </span>
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
                            {(session.data.user.name || "U")[0].toUpperCase()}
                        </div>
                    </div>
                </div>

                <div className="h-[700px]">
                    <ChatInterface />
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 italic">
                        "Add task: Buy groceries for tonight's dinner"
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 italic" dir="rtl">
                        "نیا کام: دودھ اور انڈے خریدنا"
                    </div>
                </div>
            </div>
        </div>
    );
}

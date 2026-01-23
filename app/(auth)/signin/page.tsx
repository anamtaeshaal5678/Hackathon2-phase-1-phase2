"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Check if we are on Vercel but missing database setup
        const isVercel = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

        try {
            const { data, error } = await authClient.signIn.email({
                email,
                password,
            }, {
                onSuccess: () => {
                    router.push("/");
                },
                onError: (ctx) => {
                    console.error("Sign in error:", ctx.error);
                    let message = ctx.error.message || "An unknown error occurred.";

                    // Better error parsing for common Vercel issues
                    if (isVercel) {
                        if (message.includes("Database") || message.includes("relation") || message.includes("table")) {
                            message = "Database Error: Please ensure you have set DATABASE_URL in Vercel and run migrations.";
                        } else if (message.includes("secret") || message.includes("BETTER_AUTH_SECRET")) {
                            message = "Missing BETTER_AUTH_SECRET in Vercel environment variables.";
                        } else if (message.includes("fetch") || message.includes("Failed to fetch")) {
                            message = "API Connection Error: Ensure BETTER_AUTH_URL is set correctly in Vercel.";
                        }
                    }

                    setError(message);
                }
            });
        } catch (err) {
            console.error("Catch error during sign-in:", err);
            let message = "Sign-in failed. Check browser console for details.";
            if (isVercel) {
                message = "Vercel Configuration Error: Check DATABASE_URL and BETTER_AUTH_SECRET in Vercel Settings.";
            }
            setError(message);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSignIn}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-600 text-sm">{error}</div>}

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center text-sm">
                            <Link href="/signup" className="font-medium text-black hover:text-gray-500">
                                Don't have an account? Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

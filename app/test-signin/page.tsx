"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function TestSignin() {
    const [status, setStatus] = useState("Testing signin...");
    const [details, setDetails] = useState("");

    useEffect(() => {
        const testSignin = async () => {
            try {
                setStatus("Attempting to sign in...");

                const result = await authClient.signIn.email({
                    email: "mahwish@example.com",
                    password: "password123",
                });

                if (result.error) {
                    setStatus("❌ SIGNIN FAILED");
                    setDetails(JSON.stringify(result.error, null, 2));
                } else {
                    setStatus("✅ SIGNIN SUCCESSFUL!");
                    setDetails(JSON.stringify(result.data, null, 2));

                    // Redirect after 2 seconds
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                }
            } catch (err) {
                setStatus("❌ ERROR");
                setDetails(err instanceof Error ? err.message : String(err));
            }
        };

        testSignin();
    }, []);

    return (
        <div style={{ padding: "40px", fontFamily: "monospace" }}>
            <h1>{status}</h1>
            <pre style={{
                background: "#f5f5f5",
                padding: "20px",
                borderRadius: "8px",
                overflow: "auto"
            }}>
                {details}
            </pre>
        </div>
    );
}

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const GET = async (req: Request) => {
    console.log("Auth GET request:", req.url);
    return toNextJsHandler(auth).GET(req);
};

export const POST = async (req: Request) => {
    console.log("Auth POST request:", req.url);
    try {
        const clone = req.clone();
        const body = await clone.text();
        console.log("DEBUG: Auth POST Body:", body);
    } catch (e) {
        console.error("DEBUG: Failed to read body", e);
    }
    return toNextJsHandler(auth).POST(req);
};

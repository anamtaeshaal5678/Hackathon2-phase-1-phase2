import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const GET = async (req: Request) => {
    try {
        return await toNextJsHandler(auth).GET(req);
    } catch (e: any) {
        console.error("Auth GET Crash:", e);
        return new Response(JSON.stringify({ error: "Auth GET Crash", details: e.message, stack: e.stack }), { status: 500 });
    }
};

export const POST = async (req: Request) => {
    try {
        return await toNextJsHandler(auth).POST(req);
    } catch (e: any) {
        console.error("Auth POST Crash:", e);
        return new Response(JSON.stringify({ error: "Auth POST Crash", details: e.message, stack: e.stack }), { status: 500 });
    }
};

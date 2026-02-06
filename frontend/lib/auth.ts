import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "path";

// Absolute path to the database in the project root
// In Next.js, process.cwd() is the project root (frontend) during dev
// We use path.join to go up one level to find todo.db
const localDbPath = path.join(process.cwd(), "..", "todo.db");

const getDatabase = () => {
    const dbUrl = process.env.DATABASE_URL;
    console.log("DEBUG: Initializing Better Auth Database...");

    // 1. Check for PostgreSQL (Production)
    if (dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
        console.log("DEBUG: Using Remote PostgreSQL Database. Connection string prefix:", dbUrl.substring(0, 15));
        return {
            dialect: "postgres",
            connectionString: dbUrl
        };
    }

    // 2. Handle Vercel SQLite (Emergency/Development Mode on Vercel)
    // IMPORTANT: This is ephemeral and data will be lost on scale-down/redeploys.
    if (process.env.VERCEL) {
        console.warn("WARNING: DATABASE_URL not found on Vercel. Falling back to EPHEMERAL SQLite in /tmp.");
        console.warn("CRITICAL: Accounts created here will be LOST frequently.");
        const tmpDbPath = "/tmp/todo.db";
        return new Database(tmpDbPath);
    }

    // 3. Local Development (SQLite)
    console.log("DEBUG: Using Local SQLite at:", localDbPath);
    return new Database(localDbPath);
};

export const auth = betterAuth({
    database: getDatabase(),
    // In production, BETTER_AUTH_SECRET must be set in Vercel.
    // If missing, we use a fallback but log a warning.
    secret: process.env.BETTER_AUTH_SECRET || (() => {
        if (process.env.NODE_ENV === "production") {
            console.error("CRITICAL: BETTER_AUTH_SECRET is MISSING in production!");
        }
        return "hackathon-emergency-secret-key-2026-secure";
    })(),
    baseURL: process.env.BETTER_AUTH_URL || (() => {
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        }
        if (process.env.VERCEL_URL) {
            return `https://${process.env.VERCEL_URL}`;
        }
        return "http://localhost:3000";
    })(),
    emailAndPassword: {
        enabled: true,
    },
});

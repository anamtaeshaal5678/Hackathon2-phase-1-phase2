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
    console.log("DEBUG: DATABASE_URL exists:", !!dbUrl);

    if (dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
        console.log("DEBUG: Using Remote PostgreSQL Database (Production Mode)");
        return {
            dialect: "postgres",
            connectionString: dbUrl
        };
    }

    // Default to SQLite for local development
    console.log("DEBUG: Falling back to Local SQLite (Development Mode or Missing DATABASE_URL)");
    console.log("DEBUG: Attempting to use path:", localDbPath);

    // (Optional) Check cache/existence if needed, but better-sqlite3 handles creation.

    // SQLite Handling
    // On Vercel, the file system is Read-Only except for /tmp
    let dbToUse = localDbPath;

    if (process.env.VERCEL_URL) {
        console.log("DEBUG: Detected Vercel Environment. Using /tmp for SQLite to avoid Read-Only error.");
        const tmpDbPath = "/tmp/todo.db";
        // We start with an empty DB in /tmp because we can't easily copy the gitignored one
        // This means data is ephemeral (resets on deploy/cold start)
        dbToUse = tmpDbPath;
    }

    console.log("DEBUG: Using SQLite Database at:", dbToUse);
    return new Database(dbToUse);
};

export const auth = betterAuth({
    database: getDatabase(),
    // Fallback secret for Vercel "Zero Config" deployment
    // In a real app, ALWAYS set BETTER_AUTH_SECRET in Vercel Dashboard
    secret: process.env.BETTER_AUTH_SECRET || "hackathon-emergency-secret-key-2026-secure",
    baseURL: process.env.BETTER_AUTH_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` :
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")),
    emailAndPassword: {
        enabled: true,
    },
});

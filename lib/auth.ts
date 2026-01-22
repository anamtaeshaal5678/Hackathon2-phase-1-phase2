import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "path";

// Absolute path to the database in the project root
// In Next.js, process.cwd() is the project root (frontend) during dev
const dbPath = path.resolve(process.cwd(), "..", "todo.db");
console.log("DEBUG: Better Auth DB Path:", dbPath);
console.log("DEBUG: Process CWD:", process.cwd());

// Direct initialization for Better Auth
// Note: SQLite (better-sqlite3) does NOT work on Vercel persistent storage.
// For Vercel, you should set DATABASE_URL (Postgres) in environment variables.

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
    // Since we are now in the root, todo.db is in process.cwd()
    const dbPath = path.resolve(process.cwd(), "todo.db");
    console.log("DEBUG: Falling back to Local SQLite (Development Mode or Missing DATABASE_URL)");
    console.log("DEBUG: Attempting to use path:", dbPath);

    try {
        return new Database(dbPath);
    } catch (e) {
        console.error("CRITICAL: Failed to initialize SQLite. This is expected on Vercel if DATABASE_URL is not set.", e);
        // Returning a placeholder to allow build to continue
        return {
            dialect: "sqlite",
            dbPath: dbPath
        } as any;
    }
};

export const auth = betterAuth({
    database: getDatabase(),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
    },
});

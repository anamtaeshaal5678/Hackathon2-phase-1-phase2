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

    // Check if file exists to provide better error
    try {
        const fs = require('fs');
        if (!fs.existsSync(localDbPath)) {
            console.warn(`WARNING: SQLite database not found at ${localDbPath}. This is expected on Vercel if not using Postgres.`);
        }
    } catch (e) {
        // ignore fs errors
    }

    return new Database(localDbPath);
};

export const auth = betterAuth({
    database: getDatabase(),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
    emailAndPassword: {
        enabled: true,
    },
});

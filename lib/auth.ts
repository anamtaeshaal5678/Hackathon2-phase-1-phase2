import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "path";

// Function to determine which database to use
const getDatabase = () => {
    const dbUrl = process.env.DATABASE_URL;
    console.log("DEBUG: Initializing Better Auth Database...");
    console.log("DEBUG: DATABASE_URL exists:", !!dbUrl);

    if (dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
        console.log("DEBUG: Using Remote PostgreSQL Database (Production)");
        return {
            dialect: "postgres",
            connectionString: dbUrl
        };
    }

    // Default to SQLite for local development
    // Since we are in the root, the db is in the current folder
    const dbPath = path.resolve(process.cwd(), "todo.db");
    console.log("DEBUG: Falling back to Local SQLite (Development)");
    console.log("DEBUG: SQLite Path:", dbPath);

    try {
        return new Database(dbPath);
    } catch (e) {
        console.error("CRITICAL: Failed to initialize SQLite database. This is expected on Vercel if DATABASE_URL is not set.", e);
        // Return a dummy object to prevent the whole app from crashing during build
        return {} as any;
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

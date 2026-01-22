import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "path";

// Absolute path to the database in the project root
// In Next.js, process.cwd() is the project root (frontend) during dev
const dbPath = path.resolve(process.cwd(), "..", "todo.db");
console.log("DEBUG: Better Auth DB Path:", dbPath);
console.log("DEBUG: Process CWD:", process.cwd());

// Simple, direct initialization for Better Auth
export const auth = betterAuth({
    database: new Database(dbPath),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
    },
});

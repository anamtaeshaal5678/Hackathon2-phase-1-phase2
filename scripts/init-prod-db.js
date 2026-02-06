const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("Error: DATABASE_URL environment variable is not set.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
        rejectUnauthorized: false // Required for many cloud providers like Neon/Supabase
    }
});

const initDb = async () => {
    console.log("Connecting to PostgreSQL...");
    const client = await pool.connect();
    try {
        console.log("Creating tables for Better Auth...");
        // This is a simplified version of the tables needed.
        // Better Auth normally handles this, but manual creation can help debug permissions.
        await client.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                "emailVerified" BOOLEAN NOT NULL,
                image TEXT,
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "session" (
                id TEXT PRIMARY KEY,
                "expiresAt" TIMESTAMP NOT NULL,
                token TEXT NOT NULL UNIQUE,
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL,
                "ipAddress" TEXT,
                "userAgent" TEXT,
                "userId" TEXT NOT NULL REFERENCES "user"(id)
            );

            CREATE TABLE IF NOT EXISTS "account" (
                id TEXT PRIMARY KEY,
                "accountId" TEXT NOT NULL,
                "providerId" TEXT NOT NULL,
                "userId" TEXT NOT NULL REFERENCES "user"(id),
                "accessToken" TEXT,
                "refreshToken" TEXT,
                "idToken" TEXT,
                "accessTokenExpiresAt" TIMESTAMP,
                "refreshTokenExpiresAt" TIMESTAMP,
                scope TEXT,
                password TEXT,
                "createdAt" TIMESTAMP NOT NULL,
                "updatedAt" TIMESTAMP NOT NULL
            );

            CREATE TABLE IF NOT EXISTS "verification" (
                id TEXT PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP,
                "updatedAt" TIMESTAMP
            );
        `);
        console.log("✓ Tables created successfully (or already existed).");
    } catch (err) {
        console.error("✗ Error creating tables:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
};

initDb();

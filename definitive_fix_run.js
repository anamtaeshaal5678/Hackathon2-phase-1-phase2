const Database = require('better-sqlite3');
const path = require('path');

// Adjusted path for running from frontend directory
const dbPath = path.resolve(process.cwd(), "..", "todo.db");
console.log("Database path:", dbPath);
const db = new Database(dbPath);

const email = "mahwishkhan56789@gmail.com";
const password = "password123";
const name = "Mahwish Khan";

async function performCleanFix() {
    try {
        console.log("Step 1: Cleaning up database for", email);

        // Find user IDs correctly
        const users = db.prepare("SELECT id FROM user WHERE email = ?").all(email);
        for (const user of users) {
            db.prepare("DELETE FROM account WHERE userId = ?").run(user.id);
            db.prepare("DELETE FROM session WHERE userId = ?").run(user.id);
            db.prepare("DELETE FROM user WHERE id = ?").run(user.id);
            console.log("Deleted user ID:", user.id);
        }

        // Also delete by accountId just in case
        db.prepare("DELETE FROM account WHERE accountId = ?").run(email);
        console.log("Cleaned all account records.");

        console.log("\nStep 2: Calling Signup API for fresh creation...");
        const url = "http://localhost:3000/api/auth/sign-up/email";
        const payload = {
            email: email,
            password: password,
            name: name
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000",
                "Referer": "http://localhost:3000/signup"
            },
            body: JSON.stringify(payload)
        });

        console.log("Signup API Status:", response.status);
        const data = await response.json();

        if (response.ok) {
            console.log("\n✓✓✓ SUCCESS: Account recreated via official API! ✓✓✓");
            console.log("Email:", email);
            console.log("Password:", password);

            // Final Verification: Try to sign in
            console.log("\nStep 3: Verifying with Sign-in API...");
            const loginUrl = "http://localhost:3000/api/auth/sign-in/email";
            const loginPayload = {
                email: email,
                password: password
            };

            const loginResponse = await fetch(loginUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Origin": "http://localhost:3000",
                    "Referer": "http://localhost:3000/signin"
                },
                body: JSON.stringify(loginPayload)
            });

            console.log("Sign-in API Status:", loginResponse.status);
            if (loginResponse.ok) {
                console.log("\n✓✓✓ VERIFIED: Sign-in works perfectly! ✓✓✓");
            } else {
                console.log("\n✗ ERROR: Sign-in still failing after clean signup.");
            }
        } else {
            console.log("Signup FAILED:", data);
        }

    } catch (err) {
        console.error("Critical Error:", err);
    } finally {
        db.close();
    }
}

performCleanFix();

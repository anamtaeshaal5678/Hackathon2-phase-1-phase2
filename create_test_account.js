// Create a fresh test account
const createTestAccount = async () => {
    const url = "http://localhost:3000/api/auth/sign-up/email";

    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = "TestPassword123!";

    const payload = {
        email: testEmail,
        password: testPassword,
        name: "Test User"
    };

    console.log("Creating test account...");
    console.log("Email:", testEmail);
    console.log("Password:", testPassword);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000",
                "Referer": "http://localhost:3000/signup"
            },
            body: JSON.stringify(payload)
        });

        console.log("\nSignup Response status:", response.status);
        const data = await response.json();

        if (response.ok) {
            console.log("\n✓✓✓ ACCOUNT CREATED SUCCESSFULLY! ✓✓✓");
            console.log("\n=== TEST ACCOUNT CREDENTIALS ===");
            console.log("Email:", testEmail);
            console.log("Password:", testPassword);
            console.log("\nNow testing sign-in...");

            // Test sign-in immediately
            const loginUrl = "http://localhost:3000/api/auth/sign-in/email";
            const loginResponse = await fetch(loginUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Origin": "http://localhost:3000",
                    "Referer": "http://localhost:3000/signin"
                },
                body: JSON.stringify({
                    email: testEmail,
                    password: testPassword
                })
            });

            console.log("Sign-in Response status:", loginResponse.status);
            if (loginResponse.ok) {
                console.log("\n✓✓✓ SIGN-IN WORKS! Authentication is functioning correctly! ✓✓✓");
            } else {
                const loginData = await loginResponse.json();
                console.log("\n✗ Sign-in failed:", loginData);
            }
        } else {
            console.log("\n✗ Signup failed");
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
};

createTestAccount();

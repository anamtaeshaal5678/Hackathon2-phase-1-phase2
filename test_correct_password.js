// Test sign-in with the CORRECT password
const testSignIn = async () => {
    const url = "http://localhost:3000/api/auth/sign-in/email";

    const payload = {
        email: "mahwishkhan56789@gmail.com",
        password: "password123" // The actual password that was set
    };

    console.log("Testing Sign-in for:", payload.email);
    console.log("Using password:", payload.password);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000",
                "Referer": "http://localhost:3000/signin"
            },
            body: JSON.stringify(payload)
        });

        console.log("\nResponse status:", response.status);
        const data = await response.json();

        if (response.ok) {
            console.log("\n✓✓✓ SIGN-IN SUCCESSFUL! ✓✓✓");
            console.log("User:", data.user ? data.user.name : "Unknown");
            console.log("\n=== WORKING CREDENTIALS ===");
            console.log("Email:", payload.email);
            console.log("Password:", payload.password);
        } else {
            console.log("\n✗ Sign-in failed");
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
};

testSignIn();

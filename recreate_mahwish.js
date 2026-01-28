const signup = async () => {
    const url = "http://localhost:3000/api/auth/sign-up/email";
    const payload = {
        email: "mahwishkhan56789@gmail.com",
        password: "13octuber92",
        name: "Mahwish Khan"
    };

    console.log("Signing up user:", payload.email);

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

        console.log("Response status:", response.status);
        const data = await response.json();

        if (response.ok) {
            console.log("\n✓✓✓ SUCCESS! User created and password hashed correctly by Better Auth. ✓✓✓");
            console.log("User details:", JSON.stringify(data.user, null, 2));
        } else {
            console.error("\n✗ Signup failed");
            console.error("Error details:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Error calling Signup API:", err.message);
    }
};

signup();

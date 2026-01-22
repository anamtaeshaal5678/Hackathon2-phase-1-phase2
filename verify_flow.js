
async function setupUser() {
    const email = "mahwishkhan56789@gmail.com";
    const password = "password123";
    const name = "Mahwish Khan";

    // 1. Signup
    console.log(`Signing up ${email}...`);
    const signupUrl = "http://localhost:3000/api/auth/sign-up/email";
    const signupRes = await fetch(signupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
        body: JSON.stringify({ email, password, name })
    });
    console.log("Signup Status:", signupRes.status);
    const signupData = await signupRes.text();
    console.log("Signup Response:", signupData);

    if (signupRes.ok) {
        // 2. Signin
        console.log(`Signing in ${email}...`);
        const signinUrl = "http://localhost:3000/api/auth/sign-in/email";
        const signinRes = await fetch(signinUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Origin": "http://localhost:3000" },
            body: JSON.stringify({ email, password })
        });
        console.log("Signin Status:", signinRes.status);
        const signinData = await signinRes.text();
        console.log("Signin Response:", signinData);
    }
}

setupUser();

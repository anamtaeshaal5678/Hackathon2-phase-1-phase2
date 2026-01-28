const email = "mahwishkhan56789@gmail.com";
const password = "13octuber92";

async function simulateDashboard() {
    console.log("--- Simulating Dashboard for:", email, "---");

    // 1. Sign In
    const loginUrl = "http://localhost:3000/api/auth/sign-in/email";
    const loginResp = await fetch(loginUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000",
            "Referer": "http://localhost:3000/signin"
        },
        body: JSON.stringify({ email, password })
    });

    if (!loginResp.ok) {
        console.error("Login failed:", await loginResp.text());
        return;
    }

    const setCookie = loginResp.headers.get('set-cookie');
    console.log("Login successful. Cookie received.");

    // 2. Fetch Todos (via proxy)
    // In our test script, we need to pass the cookie manually if we're calling the proxy
    // OR just call the backend directly with the cookie.
    // Let's call the proxy as the browser would.
    const todoUrl = "http://localhost:3000/api/backend/todos";
    const todoResp = await fetch(todoUrl, {
        headers: {
            "Cookie": setCookie
        }
    });

    console.log("Fetch Todos Status:", todoResp.status);
    if (todoResp.ok) {
        const todos = await todoResp.json();
        console.log("Successfully fetched", todos.length, "todos.");
    } else {
        const errorText = await todoResp.text();
        console.error("Failed to fetch todos:", errorText);
    }

    // 3. Fetch Stats
    const statsUrl = "http://localhost:3000/api/backend/todos/stats";
    const statsResp = await fetch(statsUrl, {
        headers: {
            "Cookie": setCookie
        }
    });

    console.log("Fetch Stats Status:", statsResp.status);
    if (statsResp.ok) {
        const stats = await statsResp.json();
        console.log("Successfully fetched stats:", JSON.stringify(stats));
    } else {
        console.error("Failed to fetch stats");
    }

    // 4. Chat Test
    const chatUrl = `http://localhost:3000/api/backend/chat/${"kwZ2P1FWYqFs4jgZ1r15b4B2zwKGeDyV"}`; // Use the ID we got earlier
    const chatResp = await fetch(chatUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": setCookie
        },
        body: JSON.stringify({
            message: "Add task: Buy milk tomorrow",
            conversation_id: null
        })
    });

    console.log("Chat Response Status:", chatResp.status);
    if (chatResp.ok) {
        const chatData = await chatResp.json();
        console.log("Chat Response:", chatData.response);
    } else {
        console.error("Chat Failed:", await chatResp.text());
    }
}

simulateDashboard();

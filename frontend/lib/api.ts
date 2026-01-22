const API_URL = "/api/backend";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_URL}${endpoint}`;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Essential for sending auth cookies
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

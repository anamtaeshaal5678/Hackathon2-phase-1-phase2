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
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            // Try to parse error body for more details
            const errorBody = await response.text();
            if (errorBody) {
                // Truncate if too long to avoid huge logs
                const truncatedBody = errorBody.length > 200 ? errorBody.substring(0, 200) + "..." : errorBody;
                errorMessage += ` | Details: ${truncatedBody}`;
            }
        } catch (e) {
            // Ignore failed body parsing
        }
        throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function apiFetch(path, options = {}) {
    const token =
        options.token ?? localStorage.getItem("token") ?? null;

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    let body = options.body;
    if (body && typeof body === "object" && !(body instanceof FormData)) {
        body = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        body,
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

    if (!res.ok) {
        const msg =
            typeof data === "string"
                ? data
                : (data.error || data.message || "Request failed");
        throw new Error(msg);
    }

    return data;
}


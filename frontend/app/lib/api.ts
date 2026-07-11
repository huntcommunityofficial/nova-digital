import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
    withXSRFToken: true,
});

export default api;

// ─── Order submission ─────────────────────────────────────────────────────────

export interface OrderPayload {
    service: "web_design" | "ai_automation" | "brand_identity" | "seo";
    client_name: string;
    email: string;
    phone?: string;
    details: Record<string, unknown>;
}

export interface OrderResponse {
    message: string;
    order_number: string;
    price: number | null;
    status: string;
}

export async function submitOrder(payload: OrderPayload): Promise<OrderResponse> {
    // CSRF cookie first (required for Sanctum SPA)
    await api.get("/sanctum/csrf-cookie");
    const { data } = await api.post<OrderResponse>("/api/orders", payload);
    return data;
}
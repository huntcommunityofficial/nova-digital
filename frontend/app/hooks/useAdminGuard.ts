"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

type GuardState = "loading" | "authorized" | "unauthorized";

/**
 * Protects admin-only pages.
 * - While checking: returns "loading"
 * - If not logged in or not admin: returns "unauthorized" (caller should render notFound())
 * - If admin: returns "authorized"
 *
 * Uses 404 instead of redirect so the existence of /admin routes isn't leaked
 * to non-admin users.
 */
export function useAdminGuard() {
    const [state, setState] = useState<GuardState>("loading");
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        async function check() {
            try {
                const { data } = await api.get<User>("/api/user");
                if (cancelled) return;

                if (data?.role === "admin") {
                    setState("authorized");
                } else {
                    setState("unauthorized");
                }
            } catch {
                if (!cancelled) setState("unauthorized");
            }
        }

        check();
        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
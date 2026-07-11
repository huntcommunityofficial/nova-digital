"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCode, faRobot, faPalette, faMagnifyingGlassChart,
    faSpinner, faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";
import api from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderListItem {
    id: number;
    order_number: string;
    service: string;
    client_name: string;
    email: string;
    price: number | null;
    status: string;
    created_at: string;
}

// ─── Static config ────────────────────────────────────────────────────────────

const SERVICE_CONFIG: Record<string, { label: string; icon: typeof faCode; color: string }> = {
    web_design: { label: "Web Design", icon: faCode, color: "#3A8CFF" },
    ai_automation: { label: "AI Automation", icon: faRobot, color: "#8E4BFF" },
    brand_identity: { label: "Brand Identity", icon: faPalette, color: "#FF2EC4" },
    seo: { label: "SEO", icon: faMagnifyingGlassChart, color: "#2EEBFF" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "#9CA3AF" },
    awaiting_payment: { label: "Awaiting Payment", color: "#F59E0B" },
    paid: { label: "Paid", color: "#10B981" },
    in_progress: { label: "In Progress", color: "#3A8CFF" },
    completed: { label: "Completed", color: "#10B981" },
    cancelled: { label: "Cancelled", color: "#EF4444" },
    quote_requested: { label: "Quote Requested", color: "#8E4BFF" },
    quoted: { label: "Quoted", color: "#2EEBFF" },
    confirmed: { label: "Confirmed", color: "#10B981" },
    rejected: { label: "Rejected", color: "#EF4444" },
};

const STATUS_FILTERS = ["all", ...Object.keys(STATUS_CONFIG)];

function fmtPrice(price: number | null): string {
    if (price === null) return "—";
    return "$" + price.toLocaleString();
}

function fmtDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
    const guard = useAdminGuard();

    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (guard !== "authorized") return;

        async function fetchOrders() {
            try {
                const { data } = await api.get<OrderListItem[]>("/api/admin/orders");
                setOrders(data);
            } catch {
                setError("Failed to load orders.");
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, [guard]);

    if (guard === "loading") {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }

    if (guard === "unauthorized") {
        notFound();
    }

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter((o) => o.status === filter);

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 15% 20%, #3A8CFF10 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #8E4BFF0D 0%, transparent 50%)
        ` }} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Orders</h1>
                    <p className="text-white/40 mt-2 text-sm">Manage and review all service orders.</p>
                </div>

                {/* Status filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {STATUS_FILTERS.map((s) => {
                        const active = filter === s;
                        const cfg = s === "all" ? { label: "All", color: "#9CA3AF" } : STATUS_CONFIG[s];
                        return (
                            <button key={s} onClick={() => setFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${active
                                        ? "border-white/30 text-white"
                                        : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"
                                    }`}
                                style={active ? { background: `${cfg.color}1a`, boxShadow: `0 0 10px ${cfg.color}33` } : {}}>
                                {cfg.label}
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 mb-6 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 text-white/30 text-sm">No orders found.</div>
                ) : (
                    <div className="rounded-2xl border border-white/[0.07] bg-[#111520] overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.07] text-left">
                                    <th className="px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Order</th>
                                    <th className="px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Service</th>
                                    <th className="px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Client</th>
                                    <th className="px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Price</th>
                                    <th className="px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Date</th>
                                    <th className="px-5 py-3 text-white/40 font-medium text-xs uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => {
                                    const svc = SERVICE_CONFIG[order.service] ?? { label: order.service, icon: faCode, color: "#9CA3AF" };
                                    const st = STATUS_CONFIG[order.status] ?? { label: order.status, color: "#9CA3AF" };
                                    return (
                                        <tr key={order.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-4 font-mono text-white/70 text-xs">{order.order_number}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={svc.icon} className="text-xs" style={{ color: svc.color }} />
                                                    <span className="text-white/80">{svc.label}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-white/80">{order.client_name}</div>
                                                <div className="text-white/30 text-xs">{order.email}</div>
                                            </td>
                                            <td className="px-5 py-4 text-white/70">{fmtPrice(order.price)}</td>
                                            <td className="px-5 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                                                    style={{ background: `${st.color}1a`, color: st.color }}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-white/40 text-xs">{fmtDate(order.created_at)}</td>
                                            <td className="px-5 py-4 text-right">
                                                <Link href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
                                                    <FontAwesomeIcon icon={faEye} className="text-xs" />
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
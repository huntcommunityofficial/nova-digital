"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBoxOpen, faClock, faDollarSign, faSpinner,
    faArrowRight, faCode, faRobot, faPalette, faMagnifyingGlassChart,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";

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

const PENDING_STATUSES = ["quote_requested", "pending", "awaiting_payment"];

const SERVICE_CONFIG: Record<string, { label: string; icon: typeof faCode; color: string }> = {
    web_design: { label: "Web Design", icon: faCode, color: "#3A8CFF" },
    ai_automation: { label: "AI Automation", icon: faRobot, color: "#8E4BFF" },
    brand_identity: { label: "Brand Identity", icon: faPalette, color: "#FF2EC4" },
    seo: { label: "SEO", icon: faMagnifyingGlassChart, color: "#2EEBFF" },
};

function fmtDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminDashboardPage() {
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<OrderListItem[]>("/api/admin/orders")
            .then(({ data }) => setOrders(data))
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = orders
        .filter((o) => o.price !== null && ["paid", "completed", "in_progress"].includes(o.status))
        .reduce((sum, o) => sum + Number(o.price ?? 0), 0);

    const needsAttention = orders.filter((o) => PENDING_STATUSES.includes(o.status));
    const recentOrders = [...orders].slice(0, 5);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Overview</h1>
            <p className="text-white/40 text-sm mb-8">Here's what's happening across all services.</p>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                <div className="rounded-2xl border border-white/[0.07] bg-[#111520] p-5">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider mb-3">
                        <FontAwesomeIcon icon={faBoxOpen} className="text-xs" /> Total Orders
                    </div>
                    <p className="text-3xl font-bold text-white">{orders.length}</p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-[#111520] p-5">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider mb-3">
                        <FontAwesomeIcon icon={faClock} className="text-xs" /> Needs Attention
                    </div>
                    <p className="text-3xl font-bold" style={{ color: needsAttention.length > 0 ? "#F59E0B" : "white" }}>
                        {needsAttention.length}
                    </p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-[#111520] p-5">
                    <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider mb-3">
                        <FontAwesomeIcon icon={faDollarSign} className="text-xs" /> Active Revenue
                    </div>
                    <p className="text-3xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Needs attention list */}
            {needsAttention.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                        Needs attention ({needsAttention.length})
                    </h2>
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] divide-y divide-white/[0.04]">
                        {needsAttention.slice(0, 6).map((order) => {
                            const svc = SERVICE_CONFIG[order.service] ?? { label: order.service, icon: faBoxOpen, color: "#9CA3AF" };
                            return (
                                <Link key={order.id} href={`/admin/orders/${order.id}`}
                                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={svc.icon} className="text-xs" style={{ color: svc.color }} />
                                        <div>
                                            <p className="text-white/80 text-sm">{order.client_name}</p>
                                            <p className="text-white/30 text-xs">{svc.label} · {order.order_number}</p>
                                        </div>
                                    </div>
                                    <FontAwesomeIcon icon={faArrowRight} className="text-white/20 text-xs" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Recent orders */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Recent orders</h2>
                    <Link href="/admin/orders" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                        View all
                    </Link>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-[#111520] divide-y divide-white/[0.04]">
                    {recentOrders.length === 0 ? (
                        <p className="px-5 py-6 text-white/30 text-sm text-center">No orders yet.</p>
                    ) : (
                        recentOrders.map((order) => {
                            const svc = SERVICE_CONFIG[order.service] ?? { label: order.service, icon: faBoxOpen, color: "#9CA3AF" };
                            return (
                                <Link key={order.id} href={`/admin/orders/${order.id}`}
                                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={svc.icon} className="text-xs" style={{ color: svc.color }} />
                                        <div>
                                            <p className="text-white/80 text-sm">{order.client_name}</p>
                                            <p className="text-white/30 text-xs">{svc.label} · {fmtDate(order.created_at)}</p>
                                        </div>
                                    </div>
                                    <span className="text-white/40 text-xs">
                                        {order.price !== null ? `$${order.price.toLocaleString()}` : "—"}
                                    </span>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faSpinner, faTrash, faCheck,
    faCode, faRobot, faPalette, faMagnifyingGlassChart, faBoxOpen,
    faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";
import api from "@/app/lib/api";
import OrderChat from "@/app/components/ui/orderChat";
import ReceiptReview from "@/app/components/ui/ReceiptReview";
import DeliverableUpload from "@/app/components/ui/DeliverableUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderDetail {
    id: number;
    order_number: string;
    service: string;
    client_name: string;
    email: string;
    phone: string | null;
    price: number | null;
    status: string;
    details: Record<string, unknown>;
    created_at: string;
    receipt_path: string | null;
    receipt_status: "pending" | "approved" | "rejected" | null;
    receipt_note: string | null;
    deliverable_path: string | null;
}

const SERVICE_CONFIG: Record<string, { label: string; color: string }> = {
    web_design: { label: "Web Design", color: "#3A8CFF" },
    ai_automation: { label: "AI Automation", color: "#8E4BFF" },
    brand_identity: { label: "Brand Identity", color: "#FF2EC4" },
    seo: { label: "SEO", color: "#2EEBFF" },
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

function fmtDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

// Renders the details JSON as readable key/value rows
function DetailsView({ details }: { details: Record<string, unknown> }) {
    const entries = Object.entries(details).filter(
        ([key, val]) => val !== "" && val !== null && key !== "kind"
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entries.map(([key, val]) => (
                <div key={key} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-white/80 text-sm break-words">
                        {Array.isArray(val) ? (val.length ? val.join(", ") : "—") : String(val)}
                    </p>
                </div>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrderDetailPage() {
    const guard = useAdminGuard();
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [priceInput, setPriceInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        if (guard !== "authorized" || !orderId) return;

        async function fetchOrder() {
            try {
                const { data } = await api.get<OrderDetail>(`/api/orders/${orderId}`);
                setOrder(data);
                if (data.price !== null) setPriceInput(String(data.price));
            } catch {
                setError("Failed to load order.");
            } finally {
                setLoading(false);
            }
        }

        fetchOrder();
    }, [guard, orderId]);

    async function handleSetPrice() {
        if (!order) return;
        const price = parseFloat(priceInput);
        if (isNaN(price) || price <= 0) {
            setActionError("Please enter a valid price.");
            return;
        }

        setSaving(true);
        setActionError(null);
        try {
            const { data } = await api.patch(`/api/admin/orders/${order.id}`, { price });
            setOrder((prev) => prev ? { ...prev, price: data.order.price, status: data.order.status } : prev);
        } catch {
            setActionError("Failed to update price.");
        } finally {
            setSaving(false);
        }
    }

    async function handleStatusChange(newStatus: string) {
        if (!order) return;
        setSaving(true);
        setActionError(null);
        try {
            const { data } = await api.patch(`/api/admin/orders/${order.id}`, { status: newStatus });
            setOrder((prev) => prev ? { ...prev, status: data.order.status } : prev);
        } catch {
            setActionError("Failed to update status.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!order) return;
        if (!confirm(`Delete order ${order.order_number}? This cannot be undone.`)) return;

        setSaving(true);
        try {
            await api.delete(`/api/admin/orders/${order.id}`);
            router.push("/admin/orders");
        } catch {
            setActionError("Failed to delete order.");
            setSaving(false);
        }
    }

    if (guard === "loading" || (guard === "authorized" && loading)) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }

    if (guard === "unauthorized") {
        notFound();
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center text-white/40 text-sm">
                {error ?? "Order not found."}
            </div>
        );
    }

    const st = STATUS_CONFIG[order.status] ?? { label: order.status, color: "#9CA3AF" };
    const svc = SERVICE_CONFIG[order.service] ?? { label: order.service, color: "#9CA3AF" };
    const isCustomOrder = order.details?.kind === "custom";

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 15% 20%, #3A8CFF10 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #8E4BFF0D 0%, transparent 50%)
        ` }} />

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12">

                <button onClick={() => router.push("/admin/orders")}
                    className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-8">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back to orders
                </button>

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
                    <div>
                        <p className="text-white/30 text-xs font-mono mb-1">{order.order_number}</p>
                        <h1 className="text-3xl font-bold text-white">{order.client_name}</h1>
                        <p className="text-white/40 text-sm mt-1">{order.email}{order.phone ? ` · ${order.phone}` : ""}</p>
                    </div>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ background: `${st.color}1a`, color: st.color }}>
                        {st.label}
                    </span>
                </div>

                {actionError && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 mb-6">
                        <FontAwesomeIcon icon={faCircleExclamation} className="text-red-400 text-base flex-shrink-0" />
                        <p className="text-red-400 text-sm">{actionError}</p>
                    </div>
                )}

                {/* Quote action (custom orders awaiting a price) */}
                {isCustomOrder && order.status === "quote_requested" && (
                    <div className="rounded-2xl border border-[#8E4BFF]/20 bg-[#8E4BFF]/[0.04] p-6 mb-6">
                        <p className="text-sm font-semibold text-white mb-3">Set a quote for this project</p>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-xs">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
                                <input type="number" value={priceInput} onChange={(e) => setPriceInput(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl pl-7 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#8E4BFF]/50 focus:ring-1 focus:ring-[#8E4BFF]/30 transition-all" />
                            </div>
                            <button onClick={handleSetPrice} disabled={saving}
                                className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-50"
                                style={{ background: "#8E4BFF", boxShadow: "0 0 20px #8E4BFF44" }}>
                                {saving ? "Saving..." : "Send Quote"}
                            </button>
                        </div>
                    </div>
                )}

                <OrderChat orderId={order.id} isAdmin={true} accentColor={svc.color} />

                {/* Price + service summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Service</p>
                        <p className="text-white/80 text-sm">{order.service.replace("_", " ")}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Price</p>
                        <p className="text-white/80 text-sm">{order.price !== null ? `$${order.price.toLocaleString()}` : "Not set"}</p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Submitted</p>
                        <p className="text-white/80 text-sm">{fmtDate(order.created_at)}</p>
                    </div>
                </div>

                {/* Receipt review */}
                {order.receipt_path && order.receipt_status === "pending" && (
                    <ReceiptReview
                        orderId={order.id}
                        receiptPath={order.receipt_path}
                        onReviewed={(newStatus, newOrderStatus) =>
                            setOrder((prev) => prev ? { ...prev, receipt_status: newStatus, status: newOrderStatus } : prev)
                        }
                    />
                )}

                {/* Deliverable upload */}
                {["paid", "in_progress", "confirmed", "completed"].includes(order.status) && (
                    <DeliverableUpload
                        orderId={order.id}
                        currentPath={order.deliverable_path}
                        accentColor={svc.color}
                        onUploaded={(path) => setOrder((prev) => prev
                            ? { ...prev, deliverable_path: path, status: "completed" }
                            : prev)}
                        onDeleted={async () => {
                            const { data } = await api.get<OrderDetail>(`/api/orders/${orderId}`);
                            setOrder(data);
                        }}
                    />
                )}

                {/* Full details */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Project Details</h2>
                    <DetailsView details={order.details} />
                </div>

                {/* Manual status controls */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Update Status</h2>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <button key={key} onClick={() => handleStatusChange(key)} disabled={saving || order.status === key}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 disabled:opacity-100 ${order.status === key
                                    ? "border-white/30"
                                    : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"
                                    }`}
                                style={order.status === key ? { background: `${cfg.color}1a`, color: cfg.color } : {}}>
                                {order.status === key && <FontAwesomeIcon icon={faCheck} className="mr-1.5 text-[10px]" />}
                                {cfg.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Delete */}
                <div className="pt-6 border-t border-white/[0.06]">
                    <button onClick={handleDelete} disabled={saving}
                        className="flex items-center gap-2 text-red-400/70 hover:text-red-400 transition-colors text-sm disabled:opacity-50">
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        Delete order
                    </button>
                </div>
            </div>
        </div>
    );
}
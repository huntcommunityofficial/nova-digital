"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faSpinner, faCheck, faXmark,
    faCode, faRobot, faPalette, faMagnifyingGlassChart, faBoxOpen,
    faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";
import OrderChat from "@/app/components/ui/orderChat";
import ReceiptUpload from "@/app/components/ui/ReceiptUpload";
import DeliverableDownload from "@/app/components/ui/DeliverableDownload";

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

const STATUS_TIMELINE_FIXED = ["awaiting_payment", "paid", "in_progress", "completed"];
const STATUS_TIMELINE_CUSTOM = ["quote_requested", "quoted", "confirmed", "awaiting_payment", "paid", "in_progress", "completed"];

function fmtDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

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

export default function DashboardOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acting, setActing] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) return;

        api.get<OrderDetail>(`/api/orders/${orderId}`)
            .then(({ data }) => setOrder(data))
            .catch(() => setError("Order not found or you don't have access to it."))
            .finally(() => setLoading(false));
    }, [orderId]);

    async function handleConfirm() {
        if (!order) return;
        setActing(true);
        setActionError(null);
        try {
            const { data } = await api.patch(`/api/orders/${order.id}/confirm`);
            setOrder((prev) => prev ? { ...prev, status: data.order.status } : prev);
        } catch {
            setActionError("Failed to confirm the quote. Please try again.");
        } finally {
            setActing(false);
        }
    }

    async function handleReject() {
        if (!order) return;
        if (!confirm("Are you sure you want to reject this quote?")) return;

        setActing(true);
        setActionError(null);
        try {
            const { data } = await api.patch(`/api/orders/${order.id}/reject`);
            setOrder((prev) => prev ? { ...prev, status: data.order.status } : prev);
        } catch {
            setActionError("Failed to reject the quote. Please try again.");
        } finally {
            setActing(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center text-white/40 text-sm gap-4">
                <p>{error ?? "Order not found."}</p>
                <button onClick={() => router.push("/dashboard")}
                    className="text-[#3A8CFF] hover:underline text-sm">
                    Back to dashboard
                </button>
            </div>
        );
    }

    const svc = SERVICE_CONFIG[order.service] ?? { label: order.service, icon: faBoxOpen, color: "#9CA3AF" };
    const st = STATUS_CONFIG[order.status] ?? { label: order.status, color: "#9CA3AF" };
    const isCustomOrder = order.details?.kind === "custom";
    const timeline = isCustomOrder ? STATUS_TIMELINE_CUSTOM : STATUS_TIMELINE_FIXED;
    const isTerminal = ["cancelled", "rejected"].includes(order.status);
    const currentStepIndex = timeline.indexOf(order.status);

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 15% 20%, ${svc.color}15 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, ${svc.color}0D 0%, transparent 50%)
        ` }} />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">

                <button onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-8">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back to dashboard
                </button>

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${svc.color}22`, boxShadow: `0 0 20px ${svc.color}33` }}>
                            <FontAwesomeIcon icon={svc.icon} className="text-lg" style={{ color: svc.color }} />
                        </div>
                        <div>
                            <p className="text-white/30 text-xs font-mono mb-0.5">{order.order_number}</p>
                            <h1 className="text-2xl font-bold text-white">{svc.label}</h1>
                        </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ background: `${st.color}1a`, color: st.color }}>
                        {st.label}
                    </span>
                </div>

                {/* Progress timeline */}
                {!isTerminal && (
                    <div className="mb-10">
                        <div className="flex items-center gap-1.5">
                            {timeline.map((step, i) => (
                                <div key={step} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                                    style={{ background: i <= currentStepIndex ? svc.color : "rgba(255,255,255,0.08)" }} />
                            ))}
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-white/30 text-xs">{timeline[0]?.replace("_", " ")}</span>
                            <span className="text-white/30 text-xs">{timeline[timeline.length - 1]?.replace("_", " ")}</span>
                        </div>
                    </div>
                )}

                {actionError && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 mb-6">
                        <FontAwesomeIcon icon={faCircleExclamation} className="text-red-400 text-base flex-shrink-0" />
                        <p className="text-red-400 text-sm">{actionError}</p>
                    </div>
                )}

                {/* Quote action — only when a quote is waiting for the user's decision */}
                {order.status === "quoted" && (
                    <div className="rounded-2xl border p-6 mb-8"
                        style={{ borderColor: `${svc.color}33`, background: `${svc.color}0a` }}>
                        <p className="text-sm font-semibold text-white mb-1">Your quote is ready</p>
                        <p className="text-white/40 text-sm mb-5">
                            We've reviewed your project and prepared a price. Review the details below and confirm to proceed to payment.
                        </p>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Quoted price</p>
                                <p className="text-3xl font-bold" style={{ color: svc.color }}>
                                    ${order.price?.toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={handleReject} disabled={acting}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white/60 border border-white/[0.1] hover:bg-white/[0.04] transition-all disabled:opacity-50">
                                    <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                    Decline
                                </button>
                                <button onClick={handleConfirm} disabled={acting}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                                    style={{ background: svc.color, boxShadow: `0 0 20px ${svc.color}55` }}>
                                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                    {acting ? "Confirming..." : "Confirm & Proceed"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Awaiting payment notice */}

                {/* Receipt upload */}
                {order.status === "awaiting_payment" && (
                    <ReceiptUpload
                        orderId={order.id}
                        receiptPath={order.receipt_path}
                        receiptStatus={order.receipt_status}
                        receiptNote={order.receipt_note}
                        accentColor={svc.color}
                        onUploaded={(path) => setOrder((prev) => prev
                            ? { ...prev, receipt_status: "pending", receipt_path: path }
                            : prev)}
                        onDeleted={() => setOrder((prev) => prev
                            ? { ...prev, receipt_path: null, receipt_status: null, receipt_note: null }
                            : prev)}
                    />
                )}

                {/* Quote requested notice */}
                {order.status === "quote_requested" && (
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-8">
                        <p className="text-sm font-semibold text-white mb-1">Your request is being reviewed</p>
                        <p className="text-white/40 text-sm">
                            Our team is preparing a personalised quote. You'll be notified by email once it's ready, usually within 1–2 business days.
                        </p>
                    </div>
                )}

                <OrderChat orderId={order.id} isAdmin={false} accentColor={svc.color} />

                {order.deliverable_path && (
                    <DeliverableDownload path={order.deliverable_path} accentColor={svc.color} />
                )}

                {/* Price + summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Price</p>
                        <p className="text-white/80 text-sm">
                            {order.price !== null ? `$${order.price.toLocaleString()}` : "Pending quote"}
                        </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Submitted</p>
                        <p className="text-white/80 text-sm">{fmtDate(order.created_at)}</p>
                    </div>
                </div>

                {/* Full details */}
                <div>
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Project Details</h2>
                    <DetailsView details={order.details} />
                </div>
            </div>
        </div>
    );
}
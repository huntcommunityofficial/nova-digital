"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCode, faRobot, faPalette, faMagnifyingGlassChart,
    faSpinner, faArrowRight, faBoxOpen, faPlus,
    faUser, faPen, faTrash, faCheck, faXmark,
    faLock,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import PasswordChangeModal from "@/app/components/ui/PasswordChangeModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderListItem {
    id: number;
    order_number: string;
    service: string;
    price: number | null;
    status: string;
    created_at: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
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

const NEEDS_ACTION_STATUSES = ["quoted", "awaiting_payment"];
const STATUS_FILTERS = ["all", ...Object.keys(STATUS_CONFIG)];

function fmtDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [orders, setOrders] = useState<OrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    // ── Profile editing state ───────────────────────────────────────────────
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        api.get<UserData>("/api/user")
            .then(({ data }) => {
                setUser(data);
                setEditName(data.name);
                setEditEmail(data.email);
                setAuthChecked(true);
            })
            .catch(() => {
                router.push("/login");
            });
    }, [router]);

    useEffect(() => {
        if (!authChecked || !user) return;

        api.get<OrderListItem[]>("/api/orders/mine")
            .then(({ data }) => setOrders(data))
            .catch(() => setError("Failed to load your orders."))
            .finally(() => setLoading(false));
    }, [authChecked, user]);

    function startEditing() {
        if (!user) return;
        setEditName(user.name);
        setEditEmail(user.email);
        setEditPassword("");
        setProfileError(null);
        setProfileSuccess(null);
        setEditing(true);
    }

    function cancelEditing() {
        setEditing(false);
        setProfileError(null);
    }

    async function handleSaveProfile() {
        if (!editName.trim() || !editEmail.trim()) {
            setProfileError("Name and email are required.");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (editEmail.trim() && !emailRegex.test(editEmail.trim())) {
            setProfileError("Please enter a valid email address.");
            return;
        }

        setSavingProfile(true);
        setProfileError(null);
        setProfileSuccess(null);

        try {
            const payload: Record<string, string> = { name: editName, email: editEmail };
            if (editPassword.trim() !== "") {
                payload.password = editPassword;
            }

            const { data } = await api.patch<UserData>("/api/user", payload);
            setUser(data);
            setEditing(false);
            setProfileSuccess("Profile updated successfully.");
        } catch {
            setProfileError("Failed to update profile. Please check your details and try again.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleDeleteAccount() {
        setDeleting(true);
        try {
            await api.delete("/api/user");
            window.location.href = "/";
        } catch {
            setProfileError("Failed to delete account. Please try again.");
            setDeleting(false);
            setShowDeleteModal(false);
        }
    }

    if (!authChecked) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }

    const needsAction = orders.filter((o) => NEEDS_ACTION_STATUSES.includes(o.status));
    const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

    return (
        <>
            <section className="">
                <div className="min-h-screen bg-[#0d0f14] text-white relative overflow-hidden py-16 px-0">
                    <div className="fixed inset-0 pointer-events-none z-0" style={{
                        background: `
          radial-gradient(circle at 15% 20%, #3A8CFF15 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #8E4BFF0D 0%, transparent 50%)
        ` }} />
                    <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

                    {showDeleteModal && (
                        <ConfirmModal
                            title="Delete account"
                            message="This will permanently delete your account and you'll lose access to your order history. This action cannot be undone."
                            onConfirm={handleDeleteAccount}
                            onConfirmMessage={deleting ? "Deleting..." : "Delete account"}
                            onCancel={() => setShowDeleteModal(false)}
                            onCancelMessage="Cancel"
                        />
                    )}
                    {
                        showPasswordModal && (
                            <PasswordChangeModal
                                onClose={() => setShowPasswordModal(false)}
                                onSuccess={() => setShowPasswordModal(false)}
                            />
                        )
                    }

                    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">

                        {/* Welcome header */}
                        <div className="mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Welcome back{user?.name ? `, ${user.name}` : ""}
                            </h1>
                            <p className="text-white/40 mt-2 text-sm">Track your orders and manage your account.</p>
                        </div>

                        {/* ── Account section ─────────────────────────────────────────────── */}
                        <div className="mb-10">
                            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Account</h2>

                            <div className="rounded-2xl border border-white/[0.07] bg-[#111520] p-6">
                                {!editing ? (
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ background: "#3A8CFF22", boxShadow: "0 0 16px #3A8CFF33" }}>
                                                <FontAwesomeIcon icon={faUser} className="text-base" style={{ color: "#3A8CFF" }} />
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold">{user?.name}</p>
                                                <p className="text-white/40 text-sm">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 flex-wrap">
                                            <button
                                                onClick={() => setShowPasswordModal(true)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 border border-white/[0.1] hover:bg-white/[0.04] transition-all">
                                                <FontAwesomeIcon icon={faLock} className="text-xs" />
                                                Change Password
                                            </button>
                                            <button onClick={startEditing}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/70 border border-white/[0.1] hover:bg-white/[0.04] transition-all">
                                                <FontAwesomeIcon icon={faPen} className="text-xs" />
                                                Edit
                                            </button>
                                            <button onClick={() => setShowDeleteModal(true)}
                                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400/80 border border-red-500/20 hover:bg-red-500/10 transition-all">
                                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                Delete account
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {profileError && (
                                            <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 mb-4 text-sm text-red-400">
                                                {profileError}
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Name</label>
                                                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/50 focus:ring-1 focus:ring-[#3A8CFF]/30 transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Email</label>
                                                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                                                    className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/50 focus:ring-1 focus:ring-[#3A8CFF]/30 transition-all" />
                                            </div>
                                            <div className="sm:col-span-2">
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <button onClick={handleSaveProfile} disabled={savingProfile}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                                                style={{ background: "#3A8CFF", boxShadow: "0 0 20px #3A8CFF55" }}>
                                                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                                {savingProfile ? "Saving..." : "Save changes"}
                                            </button>
                                            <button onClick={cancelEditing} disabled={savingProfile}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white/50 border border-white/[0.1] hover:bg-white/[0.04] transition-all disabled:opacity-50">
                                                <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {profileSuccess && !editing && (
                                    <p className="text-emerald-400/80 text-xs mt-4">{profileSuccess}</p>
                                )}
                            </div>
                        </div>

                        {/* Needs action */}
                        {needsAction.length > 0 && (
                            <div className="mb-10">
                                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
                                    Needs your attention ({needsAction.length})
                                </h2>
                                <div className="space-y-3">
                                    {needsAction.map((order) => {
                                        const svc = SERVICE_CONFIG[order.service] ?? { label: order.service, icon: faBoxOpen, color: "#9CA3AF" };
                                        const st = STATUS_CONFIG[order.status];
                                        return (
                                            <Link key={order.id} href={`/dashboard/orders/${order.id}`}
                                                className="flex items-center justify-between rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.005]"
                                                style={{ borderColor: `${st.color}33`, background: `${st.color}0a` }}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                        style={{ background: `${svc.color}22`, boxShadow: `0 0 16px ${svc.color}33` }}>
                                                        <FontAwesomeIcon icon={svc.icon} className="text-sm" style={{ color: svc.color }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{svc.label}</p>
                                                        <p className="text-white/30 text-xs font-mono">{order.order_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                                                        style={{ background: `${st.color}1a`, color: st.color }}>
                                                        {st.label}
                                                    </span>
                                                    <FontAwesomeIcon icon={faArrowRight} className="text-white/20 text-xs" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* All orders */}
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Your orders</h2>
                            <div className="flex flex-wrap gap-2">
                                {STATUS_FILTERS.map((s) => {
                                    const active = filter === s;
                                    const cfg = s === "all" ? { label: "All", color: "#9CA3AF" } : STATUS_CONFIG[s];
                                    return (
                                        <button key={s} onClick={() => setFilter(s)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${active ? "border-white/30 text-white" : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"
                                                }`}
                                            style={active ? { background: `${cfg.color}1a`, boxShadow: `0 0 10px ${cfg.color}33` } : {}}>
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
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
                            <div className="rounded-2xl border border-white/[0.07] bg-[#111520] py-16 text-center">
                                <FontAwesomeIcon icon={faBoxOpen} className="text-white/15 text-3xl mb-4" />
                                <p className="text-white/40 text-sm mb-6">
                                    {filter === "all" ? "You haven't placed any orders yet." : "No orders match this filter."}
                                </p>
                                {filter === "all" && (
                                    <Link href="/services"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                                        style={{ background: "#3A8CFF", boxShadow: "0 0 24px #3A8CFF55" }}>
                                        <FontAwesomeIcon icon={faPlus} className="text-xs" />
                                        Browse services
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-white/[0.07] bg-[#111520] divide-y divide-white/[0.04]">
                                {filteredOrders.map((order) => {
                                    const svc = SERVICE_CONFIG[order.service] ?? { label: order.service, icon: faBoxOpen, color: "#9CA3AF" };
                                    const st = STATUS_CONFIG[order.status] ?? { label: order.status, color: "#9CA3AF" };
                                    return (
                                        <Link key={order.id} href={`/dashboard/orders/${order.id}`}
                                            className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <FontAwesomeIcon icon={svc.icon} className="text-sm" style={{ color: svc.color }} />
                                                <div>
                                                    <p className="text-white/80 text-sm">{svc.label}</p>
                                                    <p className="text-white/30 text-xs font-mono">{order.order_number} · {fmtDate(order.created_at)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-white/50 text-sm hidden sm:inline">
                                                    {order.price !== null ? `$${order.price.toLocaleString()}` : "—"}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-full text-center text-xs font-medium"
                                                    style={{ background: `${st.color}1a`, color: st.color }}>
                                                    {st.label}
                                                </span>
                                                <FontAwesomeIcon icon={faArrowRight} className="text-white/15 text-xs hidden sm:block" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
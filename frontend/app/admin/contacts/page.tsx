"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope, faSpinner, faCheck, faClock, faXmark, faArrowLeft, faInbox,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";
import api from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    status: "unread" | "read" | "replied";
    created_at: string;
}

const STATUS_CONFIG = {
    unread: { label: "Unread", color: "#F59E0B" },
    read: { label: "Read", color: "#9CA3AF" },
    replied: { label: "Replied", color: "#10B981" },
};

const FILTERS = ["all", "unread", "read", "replied"] as const;
type Filter = typeof FILTERS[number];

function fmtDate(d: string) {
    return new Date(d).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminContactsPage() {
    const guard = useAdminGuard();
    const router = useRouter();

    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>("all");
    const [selected, setSelected] = useState<ContactMessage | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (guard !== "authorized") return;
        api.get<ContactMessage[]>("/api/admin/contacts")
            .then(({ data }) => setMessages(data))
            .finally(() => setLoading(false));
    }, [guard]);

    async function handleStatus(msg: ContactMessage, status: ContactMessage["status"]) {
        setUpdating(true);
        try {
            await api.patch(`/api/admin/contacts/${msg.id}`, { status });
            setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status } : m));
            if (selected?.id === msg.id) setSelected((s) => s ? { ...s, status } : s);
        } finally {
            setUpdating(false);
        }
    }

    if (guard === "loading" || (guard === "authorized" && loading)) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }
    if (guard === "unauthorized") notFound();

    const filtered = filter === "all" ? messages : messages.filter((m) => m.status === filter);
    const unreadCount = messages.filter((m) => m.status === "unread").length;

    // ── Detail view ──────────────────────────────────────────────────────────
    if (selected) {
        const st = STATUS_CONFIG[selected.status];
        return (
            <div className="min-h-screen bg-[#0d0f14] text-white">
                <div className="fixed inset-0 pointer-events-none z-0" style={{
                    background: "radial-gradient(circle at 15% 20%, #3A8CFF10 0%, transparent 50%)"
                }} />
                <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">
                    <button onClick={() => setSelected(null)}
                        className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-8">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back to messages
                    </button>

                    {/* Header */}
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">{selected.name}</h1>
                            <p className="text-white/40 text-sm">{selected.email}</p>
                            <p className="text-white/25 text-xs mt-1">{fmtDate(selected.created_at)}</p>
                        </div>
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium"
                            style={{ background: `${st.color}1a`, color: st.color }}>
                            {st.label}
                        </span>
                    </div>

                    {/* Subject */}
                    {selected.subject && (
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-6">
                            <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Subject</p>
                            <p className="text-white/80 text-sm">{selected.subject}</p>
                        </div>
                    )}

                    {/* Message */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-8">
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Message</p>
                        <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                    </div>

                    {/* Status actions */}
                    <div>
                        <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                            {(Object.entries(STATUS_CONFIG) as [ContactMessage["status"], typeof STATUS_CONFIG[keyof typeof STATUS_CONFIG]][]).map(([key, cfg]) => (
                                <button key={key}
                                    onClick={() => handleStatus(selected, key)}
                                    disabled={updating || selected.status === key}
                                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all disabled:opacity-100 ${selected.status === key
                                            ? "border-white/20"
                                            : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"
                                        }`}
                                    style={selected.status === key ? { background: `${cfg.color}1a`, color: cfg.color } : {}}>
                                    {selected.status === key && <FontAwesomeIcon icon={faCheck} className="mr-1.5 text-[10px]" />}
                                    {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── List view ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: "radial-gradient(circle at 15% 20%, #3A8CFF10 0%, transparent 50%)"
            }} />
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Contact Messages</h1>
                        {unreadCount > 0 && (
                            <p className="text-white/40 text-sm mt-1">
                                <span className="text-amber-400 font-medium">{unreadCount}</span> unread
                            </p>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    {FILTERS.map((f) => {
                        const count = f === "all" ? messages.length : messages.filter((m) => m.status === f).length;
                        return (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-xl text-xs font-medium border transition-all ${filter === f
                                        ? "border-[#3A8CFF]/40 bg-[#3A8CFF]/10 text-[#3A8CFF]"
                                        : "border-white/[0.07] text-white/40 hover:text-white/60 hover:border-white/15"
                                    }`}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                <span className="ml-1.5 opacity-60">{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <FontAwesomeIcon icon={faInbox} className="text-white/10 text-4xl mb-4" />
                        <p className="text-white/30 text-sm">No messages in this category</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((msg) => {
                            const st = STATUS_CONFIG[msg.status];
                            return (
                                <div key={msg.id}
                                    onClick={() => { setSelected(msg); if (msg.status === "unread") handleStatus(msg, "read"); }}
                                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer px-5 py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 min-w-0">
                                            {/* Unread dot */}
                                            <div className="flex-shrink-0 mt-1.5">
                                                {msg.status === "unread"
                                                    ? <div className="w-2 h-2 rounded-full bg-amber-400" />
                                                    : <div className="w-2 h-2 rounded-full bg-white/10" />}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                    <p className="text-white/90 text-sm font-medium">{msg.name}</p>
                                                    <p className="text-white/30 text-xs">{msg.email}</p>
                                                </div>
                                                {msg.subject && (
                                                    <p className="text-white/50 text-xs mb-1">{msg.subject}</p>
                                                )}
                                                <p className="text-white/30 text-xs truncate max-w-md">{msg.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                                                style={{ background: `${st.color}1a`, color: st.color }}>
                                                {st.label}
                                            </span>
                                            <p className="text-white/25 text-[10px]">{fmtDate(msg.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
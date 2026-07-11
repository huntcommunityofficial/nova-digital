"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComment, faSpinner, faCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";
import api from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatSessionItem {
    id: number;
    status: "open" | "closed";
    unread_count: number;
    last_message: string | null;
    updated_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

function fmtTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminChatSessionsPage() {
    const guard = useAdminGuard();

    const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "open" | "closed">("open");

    // Poll for updated session list every 5s
    useEffect(() => {
        if (guard !== "authorized") return;

        function fetchSessions() {
            api.get<ChatSessionItem[]>("/api/admin/chat/sessions")
                .then(({ data }) => setSessions(data))
                .catch(() => { })
                .finally(() => setLoading(false));
        }

        fetchSessions();
        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, [guard]);

    if (guard === "loading") {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }

    if (guard === "unauthorized") notFound();

    const filtered = sessions.filter((s) =>
        filter === "all" ? true : s.status === filter
    );

    const totalUnread = sessions.reduce((sum, s) => sum + s.unread_count, 0);

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 15% 20%, #3A8CFF10 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #8E4BFF0D 0%, transparent 50%)
        ` }} />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Support Chat
                            {totalUnread > 0 && (
                                <span className="ml-3 text-sm font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                    {totalUnread} unread
                                </span>
                            )}
                        </h1>
                        <p className="text-white/40 text-sm mt-1">Manage and reply to user conversations.</p>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-6">
                    {(["open", "closed", "all"] as const).map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 capitalize ${filter === f
                                    ? "border-[#3A8CFF]/40 text-white bg-[#3A8CFF]/10"
                                    : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/70"
                                }`}>
                            {f}
                            <span className="ml-1.5 text-white/25">
                                ({f === "all" ? sessions.length : sessions.filter((s) => s.status === f).length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Session list */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-xl animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.07] bg-[#111520] py-14 text-center">
                        <FontAwesomeIcon icon={faComment} className="text-white/15 text-2xl mb-3" />
                        <p className="text-white/30 text-sm">No {filter !== "all" ? filter : ""} conversations.</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/[0.07] bg-[#111520] divide-y divide-white/[0.04] overflow-hidden">
                        {filtered.map((session) => (
                            <Link key={session.id} href={`/admin/chat/${session.id}`}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors relative">

                                {/* Unread dot */}
                                {session.unread_count > 0 && (
                                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#3A8CFF]" />
                                )}

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                                    style={{ background: "linear-gradient(135deg, #3A8CFF33, #8E4BFF33)" }}>
                                    {session.user.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-white/90 text-sm font-medium truncate">{session.user.name}</p>
                                        <FontAwesomeIcon icon={faCircle} className="text-[5px] flex-shrink-0"
                                            style={{ color: session.status === "open" ? "#10B981" : "#6B7280" }} />
                                        <span className="text-xs flex-shrink-0"
                                            style={{ color: session.status === "open" ? "#10B981" : "#6B7280" }}>
                                            {session.status}
                                        </span>
                                    </div>
                                    <p className="text-white/35 text-xs truncate">
                                        {session.last_message ?? "No messages yet"}
                                    </p>
                                </div>

                                {/* Right side */}
                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                    <p className="text-white/25 text-[11px]">{fmtTime(session.updated_at)}</p>
                                    {session.unread_count > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#3A8CFF]">
                                            {session.unread_count}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
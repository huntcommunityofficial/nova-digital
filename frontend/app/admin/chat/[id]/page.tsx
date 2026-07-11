"use client";

import { useEffect, useRef, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faSpinner, faPaperPlane, faLockOpen, faLock,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";
import api from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: number;
    sender: "user" | "admin";
    message: string;
    created_at: string;
}

interface SessionInfo {
    id: number;
    status: "open" | "closed";
    user: { id: number; name: string; email: string };
}

const POLL_INTERVAL = 3000;

function fmtTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminChatDetailPage() {
    const guard = useAdminGuard();
    const params = useParams();
    const router = useRouter();
    const sessionId = params?.id as string;

    const [session, setSession] = useState<SessionInfo | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [closing, setClosing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const lastIdRef = useRef<number>(0);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Initial load ──────────────────────────────────────────────────────────

    useEffect(() => {
        if (guard !== "authorized" || !sessionId) return;

        // Load full message history first
        api.get<{ messages: Message[] }>(`/api/admin/chat/sessions/${sessionId}/messages`)
            .then(({ data }) => {
                setMessages(data.messages);
                if (data.messages.length > 0) {
                    lastIdRef.current = data.messages[data.messages.length - 1].id;
                }
            })
            .catch(() => setError("Failed to load messages."))
            .finally(() => setLoading(false));

        // Load session info from sessions list
        api.get<SessionInfo[]>("/api/admin/chat/sessions")
            .then(({ data }) => {
                const found = data.find((s: any) => s.id === parseInt(sessionId));
                if (found) setSession(found);
            })
            .catch(() => { });
    }, [guard, sessionId]);

    // ── Polling ───────────────────────────────────────────────────────────────

    useEffect(() => {
        if (guard !== "authorized" || !sessionId || loading) return;

        async function poll() {
            try {
                const { data } = await api.get<{ messages: Message[] }>(
                    `/api/admin/chat/sessions/${sessionId}/messages?last_id=${lastIdRef.current}`
                );
                if (data.messages.length > 0) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const fresh = data.messages.filter((m) => !existingIds.has(m.id));
                        return fresh.length > 0 ? [...prev, ...fresh] : prev;
                    });
                    lastIdRef.current = data.messages[data.messages.length - 1].id;
                }
            } catch { }
        }

        pollRef.current = setInterval(poll, POLL_INTERVAL);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [guard, sessionId, loading]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages, open]);

    // ── Send reply ────────────────────────────────────────────────────────────

    async function handleSend() {
        const text = input.trim();
        if (!text || sending) return;

        setSending(true);
        setInput("");

        try {
            const { data } = await api.post<{ message: Message }>(
                `/api/admin/chat/sessions/${sessionId}/reply`,
                { message: text }
            );
            setMessages((prev) => [...prev, data.message]);
            lastIdRef.current = data.message.id;
        } catch {
            setInput(text);
        } finally {
            setSending(false);
        }
    }

    function handleKey(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    }

    // ── Close/reopen session ──────────────────────────────────────────────────

    async function handleToggleStatus() {
        if (!session) return;
        setClosing(true);
        try {
            if (session.status === "open") {
                await api.patch(`/api/admin/chat/sessions/${sessionId}/close`);
                setSession((s) => s ? { ...s, status: "closed" } : s);
            } else {
                await api.patch(`/api/admin/chat/sessions/${sessionId}/reopen`);
                setSession((s) => s ? { ...s, status: "open" } : s);
            }
        } catch { } finally {
            setClosing(false);
        }
    }

    // ── Guard ─────────────────────────────────────────────────────────────────

    if (guard === "loading") {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }

    if (guard === "unauthorized") notFound();

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white flex flex-col">
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 15% 20%, #3A8CFF10 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #8E4BFF0D 0%, transparent 50%)
        ` }} />

            <div className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex flex-col flex-1">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/chat"
                            className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                            All chats
                        </Link>
                        {session && (
                            <div>
                                <p className="text-white font-semibold text-sm">{session.user.name}</p>
                                <p className="text-white/30 text-xs">{session.user.email}</p>
                            </div>
                        )}
                    </div>

                    {/* Status badge + toggle */}
                    {session && (
                        <button onClick={handleToggleStatus} disabled={closing}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${session.status === "open"
                                ? "border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                                : "border-white/[0.1] text-white/40 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                                }`}>
                            <FontAwesomeIcon icon={session.status === "open" ? faLockOpen : faLock} className="text-[10px]" />
                            {session.status === "open" ? "Close chat" : "Reopen chat"}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 mb-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* Chat window */}
                <div className="flex-1 rounded-2xl border border-white/[0.07] bg-[#111520] flex flex-col overflow-hidden"
                    style={{ minHeight: "500px" }} ref={containerRef}>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-xl animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <p className="text-white/30 text-sm">No messages in this session yet.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.sender === "admin"
                                        ? "text-white rounded-br-sm"
                                        : "text-white/80 border border-white/[0.08] rounded-bl-sm"
                                        }`}
                                        style={msg.sender === "admin"
                                            ? { background: "#3A8CFF", boxShadow: "0 0 14px #3A8CFF44" }
                                            : { background: "rgba(255,255,255,0.04)" }}>
                                        <p className={`text-[10px] mb-1 font-medium ${msg.sender === "admin" ? "text-white/60" : "text-white/40"
                                            }`}>
                                            {msg.sender === "admin" ? "You (Admin)" : session?.user.name ?? "User"}
                                        </p>
                                        {msg.message}
                                        <p className={`text-[10px] mt-1 ${msg.sender === "admin" ? "text-white/50" : "text-white/25"}`}>
                                            {fmtTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/[0.07] px-4 py-3 flex-shrink-0">
                        {session?.status === "closed" ? (
                            <p className="text-center text-white/25 text-xs py-1">
                                This chat is closed. Reopen to send messages.
                            </p>
                        ) : (
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="Reply to user..."
                                    rows={1}
                                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/40 transition-all resize-none"
                                    style={{ maxHeight: "120px" }}
                                />
                                <button onClick={handleSend} disabled={!input.trim() || sending}
                                    className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl transition-all disabled:opacity-40"
                                    style={{ background: "#3A8CFF", boxShadow: "0 0 14px #3A8CFF44" }}>
                                    <FontAwesomeIcon
                                        icon={sending ? faSpinner : faPaperPlane}
                                        className={`text-white text-sm ${sending ? "animate-spin" : ""}`}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
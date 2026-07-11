"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComment, faXmark, faPaperPlane, faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: number;
    sender: "user" | "admin";
    message: string;
    created_at: string;
}

const POLL_INTERVAL = 3000; // ms

function fmtTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const lastIdRef = useRef<number>(0);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // ── Check if user is logged in ────────────────────────────────────────────
    useEffect(() => {
        api.get("/api/user")
            .then(() => setLoggedIn(true))
            .catch(() => setLoggedIn(false))
            .finally(() => setAuthChecked(true));
    }, []);

    // ── Polling ───────────────────────────────────────────────────────────────
    async function fetchMessages() {
        try {
            const { data } = await api.get<{ messages: Message[] }>(
                `/api/chat/messages?last_id=${lastIdRef.current}`
            );
            if (data.messages.length > 0) {
                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    const fresh = data.messages.filter((m) => !existingIds.has(m.id));
                    return fresh.length > 0 ? [...prev, ...fresh] : prev;
                });
                const newLastId = data.messages[data.messages.length - 1].id;
                lastIdRef.current = newLastId;

                // Count unread admin messages (when chat is closed)
                if (!open) {
                    const adminNew = data.messages.filter((m) => m.sender === "admin").length;
                    setUnreadCount((c) => c + adminNew);
                }
            }
        } catch {
            // Silently fail — user might not have a session yet
        }
    }

    // Start/stop polling based on login state
    useEffect(() => {
        if (!loggedIn) return;

        // Initial fetch
        fetchMessages();

        // Start polling
        pollRef.current = setInterval(fetchMessages, POLL_INTERVAL);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [loggedIn]);

    // Clear unread when opening
    useEffect(() => {
        if (open) setUnreadCount(0);
    }, [open]);

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── Send ──────────────────────────────────────────────────────────────────
    async function handleSend() {
        const text = input.trim();
        if (!text || sending) return;

        setSending(true);
        setInput("");

        try {
            const { data } = await api.post<{ message: Message }>("/api/chat/send", { message: text });
            setMessages((prev) => [...prev, data.message]);
            lastIdRef.current = data.message.id;
        } catch {
            setInput(text); // restore on failure
        } finally {
            setSending(false);
        }
    }

    function handleKey(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    // Not logged in — don't render anything
    if (!authChecked || !loggedIn) return null;

    return (
        <>
            {/* ── Chat window ─────────────────────────────────────────────────── */}
            <div className={`fixed bottom-22 end-6 z-50 w-85 sm:w-95 transition-all duration-300 origin-bottom-right ${open ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
                }`}>
                <div className="rounded-2xl border border-white/10 bg-[#111520]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(58,140,255,0.2)] overflow-hidden flex flex-col"
                    style={{ height: "480px" }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #3A8CFF15, transparent)" }}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: "#3A8CFF22", boxShadow: "0 0 12px #3A8CFF55" }}>
                                <FontAwesomeIcon icon={faComment} className="text-sm" style={{ color: "#3A8CFF" }} />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold">Support Chat</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <p className="text-white/40 text-xs">We typically reply within minutes</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)}
                            className="text-white/30 hover:text-white/70 transition-colors">
                            <FontAwesomeIcon icon={faXmark} className="text-base" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 chat-scroll">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                                    style={{ background: "#3A8CFF15" }}>
                                    <FontAwesomeIcon icon={faComment} className="text-lg" style={{ color: "#3A8CFF" }} />
                                </div>
                                <p className="text-white/50 text-sm font-medium">How can we help?</p>
                                <p className="text-white/25 text-xs mt-1">Send a message to start the conversation.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.sender === "user"
                                        ? "text-white rounded-br-sm"
                                        : "text-white/80 border border-white/8 rounded-bl-sm"
                                        }`}
                                        style={msg.sender === "user"
                                            ? { background: "#3A8CFF", boxShadow: "0 0 16px #3A8CFF44" }
                                            : { background: "rgba(255,255,255,0.04)" }}>
                                        {msg.message}
                                        <p className={`text-[10px] mt-1 ${msg.sender === "user" ? "text-white/50" : "text-white/25"}`}>
                                            {fmtTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-white/[0.07] flex-shrink-0">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Type a message..."
                                rows={1}
                                className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/40 transition-all resize-none"
                                style={{ maxHeight: "100px" }}
                            />
                            <button onClick={handleSend} disabled={!input.trim() || sending}
                                className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-40"
                                style={{ background: "#3A8CFF", boxShadow: "0 0 14px #3A8CFF44" }}>
                                <FontAwesomeIcon
                                    icon={sending ? faSpinner : faPaperPlane}
                                    className={`text-white text-sm ${sending ? "animate-spin" : ""}`}
                                />
                            </button>
                        </div>
                        <p className="text-white/20 text-[10px] mt-1.5 text-center">Press Enter to send · Shift+Enter for new line</p>
                    </div>
                </div>
            </div>

            {/* ── Floating button ──────────────────────────────────────────────── */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
                style={{ background: "linear-gradient(135deg, #3A8CFF, #6C3FFF)", boxShadow: "0 0 28px #3A8CFF66" }}
            >
                <FontAwesomeIcon
                    icon={open ? faXmark : faComment}
                    className="text-white text-xl transition-all duration-200"
                />
                {/* Unread badge */}
                {!open && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>
        </>
    );
}
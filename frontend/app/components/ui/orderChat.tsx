"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faComment, faPaperPlane, faSpinner, faChevronDown, faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: number;
    sender: "user" | "admin";
    message: string;
    created_at: string;
}

interface Props {
    orderId: number;
    isAdmin?: boolean;
    accentColor?: string;
}

const POLL_INTERVAL = 3000;

function fmtTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderChat({ orderId, isAdmin = false, accentColor = "#3A8CFF" }: Props) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [unread, setUnread] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const lastIdRef = useRef<number>(0);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    const endpoint = isAdmin
        ? `/api/admin/orders/${orderId}/chat`
        : `/api/orders/${orderId}/chat`;

    // ── Load messages when opened ─────────────────────────────────────────────
    useEffect(() => {
        if (!open || loaded) return;

        api.get<{ messages: Message[] }>(endpoint)
            .then(({ data }) => {
                setMessages(data.messages);
                if (data.messages.length > 0) {
                    lastIdRef.current = data.messages[data.messages.length - 1].id;
                }
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, [open, loaded, endpoint]);

    // ── Polling ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!loaded) return;

        async function poll() {
            try {
                const { data } = await api.get<{ messages: Message[] }>(
                    `${endpoint}?last_id=${lastIdRef.current}`
                );
                if (data.messages.length > 0) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id));
                        const fresh = data.messages.filter((m) => !existingIds.has(m.id));
                        return fresh.length > 0 ? [...prev, ...fresh] : prev;
                    });
                    lastIdRef.current = data.messages[data.messages.length - 1].id;
                    if (!open) setUnread((c) => c + data.messages.length);
                }
            } catch { }
        }

        pollRef.current = setInterval(poll, POLL_INTERVAL);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [loaded, open, endpoint]);

    // Clear unread when opened
    useEffect(() => { if (open) setUnread(0); }, [open]);

    // Scroll to bottom
    useEffect(() => {
        if (open && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages, open]);

    // ── Send ──────────────────────────────────────────────────────────────────
    async function handleSend() {
        const text = input.trim();
        if (!text || sending) return;

        setSending(true);
        setInput("");

        try {
            const { data } = await api.post<{ message: Message }>(endpoint, { message: text });
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

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="my-8">

            {/* Toggle header */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-white/[0.07] bg-[#111520] hover:bg-white/[0.02] transition-colors"
                style={{
                    borderColor: `${accentColor}22`,
                    background: `radial-gradient(ellipse at top left, ${accentColor}0f 0%, #111520 100%)`,
                }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${accentColor}18`, boxShadow: `0 0 12px ${accentColor}33` }}>
                        <FontAwesomeIcon icon={faComment} className="text-xs" style={{ color: accentColor }} />
                    </div>
                    <div className="text-left">
                        <p className="text-white/90 text-sm font-medium">Order Chat</p>
                        <p className="text-white/35 text-xs">
                            {isAdmin ? "Message the client about this order" : "Message us about this order"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {unread > 0 && !open && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-500">
                            {unread}
                        </span>
                    )}
                    <FontAwesomeIcon
                        icon={open ? faChevronUp : faChevronDown}
                        className="text-white/30 text-xs"
                    />
                </div>
            </button>

            {/* Chat body */}
            {open && (
                <div className="mt-2 rounded-2xl border overflow-hidden"
                    style={{
                        borderColor: `${accentColor}22`,
                        background: `radial-gradient(ellipse at top left, ${accentColor}0f 0%, #111520 60%)`,
                    }}>

                    {/* Messages */}
                    <div className="h-72 overflow-y-auto px-4 py-4 space-y-3 chat-scroll" ref={containerRef}>
                        {!loaded ? (
                            <div className="flex items-center justify-center h-full">
                                <FontAwesomeIcon icon={faSpinner} className="text-white/30 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <FontAwesomeIcon icon={faComment} className="text-white/10 text-2xl mb-2" />
                                <p className="text-white/30 text-xs">
                                    {isAdmin
                                        ? "No messages yet. Start the conversation."
                                        : "No messages yet. Ask us anything about your order."}
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                // From the viewer's perspective: "my" messages are on the right
                                const isMine = isAdmin ? msg.sender === "admin" : msg.sender === "user";
                                return (
                                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMine ? "text-white rounded-br-sm" : "text-white/80 border border-white/[0.08] rounded-bl-sm"
                                            }`}
                                            style={isMine
                                                ? { background: accentColor, boxShadow: `0 0 14px ${accentColor}44` }
                                                : { background: "rgba(255,255,255,0.04)" }}>
                                            <p className={`text-[10px] mb-1 font-medium ${isMine ? "text-white/60" : "text-white/40"}`}>
                                                {isMine ? "You" : isAdmin ? "Client" : "Support"}
                                            </p>
                                            {msg.message}
                                            <p className={`text-[10px] mt-1 ${isMine ? "text-white/50" : "text-white/25"}`}>
                                                {fmtTime(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/[0.07] px-4 py-3">
                        <div className="flex items-end gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder={isAdmin ? "Reply to client..." : "Ask about your order..."}
                                rows={1}
                                className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none transition-all resize-none"
                                style={{
                                    maxHeight: "100px",
                                    // @ts-ignore
                                    "--tw-ring-color": accentColor,
                                    focusBorderColor: `${accentColor}80`,
                                }}
                                onFocus={(e) => e.target.style.borderColor = `${accentColor}50`}
                                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                            />
                            <button onClick={handleSend} disabled={!input.trim() || sending}
                                className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl transition-all disabled:opacity-40"
                                style={{ background: accentColor, boxShadow: `0 0 14px ${accentColor}44` }}>
                                <FontAwesomeIcon
                                    icon={sending ? faSpinner : faPaperPlane}
                                    className={`text-white text-sm ${sending ? "animate-spin" : ""}`}
                                />
                            </button>
                        </div>
                        <p className="text-white/20 text-[10px] mt-1.5">
                            Enter to send · Shift+Enter for new line
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
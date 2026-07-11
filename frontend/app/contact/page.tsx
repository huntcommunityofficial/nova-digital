"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope, faPaperPlane, faSpinner, faCheck,
    faLocationDot, faClock, faComment,
} from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faLinkedin, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import api from "@/app/lib/api";

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const [form, setForm] = useState<FormData>({ name: "", email: "", subject: "", message: "" });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            setError("Please fill in all required fields.");
            return;
        }
        setSending(true);
        setError(null);
        try {
            await api.post("/api/contact", form);
            setSent(true);
        } catch {
            setError("Something went wrong. Please try again or email us directly.");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
                    radial-gradient(circle at 20% 20%, #3A8CFF12 0%, transparent 55%),
                    radial-gradient(circle at 80% 80%, #8E4BFF0e 0%, transparent 55%)
                `
            }} />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-24 pt-32">

                {/* Header */}
                <div className="text-center mb-20">
                    <p className="text-[#3A8CFF] text-sm font-semibold uppercase tracking-widest mb-4">Get in Touch</p>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
                        Let's Build Something<br className="hidden sm:block" /> Together
                    </h1>
                    <p className="text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
                        Have a project in mind? We'd love to hear about it. Send us a message and we'll get back to you within one business day.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                    {/* Left: info */}
                    <div className="lg:col-span-2 space-y-4">
                        {[
                            { icon: faEnvelope, label: "Email", value: "hello@youragency.com", sub: "We reply within 24 hours", color: "#3A8CFF" },
                            { icon: faLocationDot, label: "Location", value: "Remote & Worldwide", sub: "We work with clients globally", color: "#8E4BFF" },
                            { icon: faClock, label: "Business Hours", value: "Mon–Fri, 9am–6pm", sub: "UTC+3:30 (Tehran)", color: "#FF2EC4" },
                            { icon: faComment, label: "Live Chat", value: "Available on site", sub: "Use the chat bubble below", color: "#2EEBFF" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{ background: `${item.color}18`, boxShadow: `0 0 14px ${item.color}28` }}>
                                    <FontAwesomeIcon icon={item.icon} className="text-sm" style={{ color: item.color }} />
                                </div>
                                <div>
                                    <p className="text-white/30 text-xs uppercase tracking-wider mb-0.5">{item.label}</p>
                                    <p className="text-white/90 text-sm font-medium">{item.value}</p>
                                    <p className="text-white/35 text-xs mt-0.5">{item.sub}</p>
                                </div>
                            </div>
                        ))}

                        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                            <p className="text-white/30 text-xs uppercase tracking-wider mb-3">Follow Us</p>
                            <div className="flex items-center gap-3">
                                {[
                                    { icon: faInstagram, href: "#", color: "#FF2EC4" },
                                    { icon: faLinkedin, href: "#", color: "#3A8CFF" },
                                    { icon: faXTwitter, href: "#", color: "#ffffff" },
                                ].map((s, i) => (
                                    <a key={i} href={s.href} target="_blank" rel="noreferrer"
                                        className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.08] hover:border-white/20 transition-all"
                                        style={{ background: `${s.color}10` }}>
                                        <FontAwesomeIcon icon={s.icon} className="text-sm" style={{ color: s.color }} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: form */}
                    <div className="lg:col-span-3">
                        <div className="rounded-2xl border border-white/[0.07] p-8"
                            style={{ background: "radial-gradient(ellipse at top left, #3A8CFF0a 0%, transparent 60%), rgba(255,255,255,0.015)" }}>

                            {sent ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                                        style={{ background: "#10B98120", boxShadow: "0 0 24px #10B98140" }}>
                                        <FontAwesomeIcon icon={faCheck} className="text-xl text-emerald-400" />
                                    </div>
                                    <h3 className="text-white text-xl font-semibold mb-2">Message sent!</h3>
                                    <p className="text-white/40 text-sm max-w-xs">
                                        Thanks for reaching out. We'll get back to you within one business day.
                                    </p>
                                    <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                                        className="mt-6 text-[#3A8CFF] text-sm hover:underline">
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Field label="Full name *" name="name" value={form.name} onChange={handleChange} placeholder="John Smith" />
                                        <Field label="Email address *" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" type="email" />
                                    </div>

                                    <div>
                                        <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Subject</label>
                                        <select name="subject" value={form.subject} onChange={handleChange}
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3A8CFF]/40 transition-all appearance-none">
                                            <option value="" className="bg-[#13161d]">Select a topic</option>
                                            <option value="Web Design" className="bg-[#13161d]">Web Design</option>
                                            <option value="AI Automation" className="bg-[#13161d]">AI Automation</option>
                                            <option value="Brand Identity" className="bg-[#13161d]">Brand Identity</option>
                                            <option value="SEO" className="bg-[#13161d]">SEO</option>
                                            <option value="General" className="bg-[#13161d]">General Inquiry</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Message *</label>
                                        <textarea name="message" value={form.message} onChange={handleChange}
                                            rows={5} placeholder="Tell us about your project..."
                                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#3A8CFF]/40 transition-all resize-none" />
                                    </div>

                                    {error && <p className="text-red-400/80 text-xs">{error}</p>}

                                    <button type="submit" disabled={sending}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                                        style={{ background: "#3A8CFF", boxShadow: "0 0 20px #3A8CFF44" }}>
                                        {sending
                                            ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Sending…</>
                                            : <><FontAwesomeIcon icon={faPaperPlane} className="text-xs" /> Send Message</>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, name, value, onChange, placeholder, type = "text" }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; type?: string;
}) {
    return (
        <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">{label}</label>
            <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#3A8CFF]/40 transition-all" />
        </div>
    );
}
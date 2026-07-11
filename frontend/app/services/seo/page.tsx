"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlassChart, faArrowRight, faServer, faLink,
    faFileAlt, faGlobe, faChartLine, faMobileAlt,
    faCheck, faPenRuler,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const ACCENT = "#2EEBFF";

const features = [
    {
        icon: faServer,
        title: "Technical SEO audit",
        desc: "A deep-dive into your site's architecture, crawlability, indexing, and Core Web Vitals — fixing what holds you back.",
    },
    {
        icon: faMagnifyingGlassChart,
        title: "Keyword strategy",
        desc: "Research-driven keyword targeting that finds the terms your customers actually search for, then maps them to your pages.",
    },
    {
        icon: faFileAlt,
        title: "On-page optimisation",
        desc: "Every title tag, meta description, heading, and content block optimised to rank — and to convert when traffic arrives.",
    },
    {
        icon: faLink,
        title: "Link building",
        desc: "High-quality backlinks from authoritative, relevant sources that build domain authority the right way.",
    },
    {
        icon: faGlobe,
        title: "Local SEO",
        desc: "Dominate local search results with optimised Google Business profiles, local citations, and geo-targeted content.",
    },
    {
        icon: faMobileAlt,
        title: "Core Web Vitals",
        desc: "Speed, layout stability, and interactivity improvements that satisfy both users and Google's ranking signals.",
    },
];

const process = [
    { step: "01", title: "Audit & analysis", desc: "We analyse your site, competitors, and current rankings to build a clear picture of where you stand and where the opportunity lies." },
    { step: "02", title: "Strategy", desc: "A prioritised roadmap — technical fixes first, then on-page work, then content and links — built around your specific goals." },
    { step: "03", title: "Execution", desc: "Our team implements every change, from technical fixes to content optimisation and outreach, with full transparency at every step." },
    { step: "04", title: "Report & refine", desc: "Monthly ranking and traffic reports, with strategy adjustments based on what the data tells us." },
];

const included = [
    "Dedicated SEO strategist",
    "Monthly performance reports",
    "Competitor monitoring",
    "Keyword rank tracking",
    "Google Search Console setup",
    "Technical fix implementation",
];

export default function SeoServicePage() {
    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">

            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 20% 30%, #2EEBFF18 0%, transparent 55%),
          radial-gradient(circle at 80% 70%, #2EEBFF0D 0%, transparent 55%)
        ` }} />
            <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section className="relative z-10 pt-36 pb-24 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
                            style={{ background: "#2EEBFF1a", boxShadow: "0 0 40px #2EEBFF44" }}>
                            <FontAwesomeIcon icon={faMagnifyingGlassChart} className="text-3xl" style={{ color: ACCENT }} />
                        </div>
                        <p className="text-xs font-semibold tracking-widest text-[#2EEBFF]/60 uppercase mb-4">Service</p>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                            SEO Optimization
                        </h1>
                        <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                            Data-driven SEO strategies that move you from invisible to unmissable — more organic traffic, better rankings, and real business growth.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                            <Link href="/services/seo/order"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                                style={{ background: "linear-gradient(135deg, #2EEBFF, #3A8CFF)", boxShadow: "0 0 32px #2EEBFF55" }}>
                                Start your project
                                <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                            </Link>
                            <a href="#process"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white/60 text-base border border-white/[0.1] hover:text-white hover:border-white/25 transition-all duration-300">
                                How it works
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────────────────────── */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What we optimise</h2>
                        <p className="text-white/40 max-w-xl mx-auto">Every lever that moves the needle — technical, on-page, off-page, and everything in between.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="rounded-2xl border border-white/[0.07] bg-[#111520] p-6 hover:border-[#2EEBFF]/20 transition-all duration-300">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: "#2EEBFF15", boxShadow: "0 0 16px #2EEBFF22" }}>
                                    <FontAwesomeIcon icon={f.icon} className="text-sm" style={{ color: ACCENT }} />
                                </div>
                                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Stats strip ───────────────────────────────────────────────────── */}
            <section className="relative z-10 py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { value: "3×", label: "Average traffic increase in 6 months" },
                            { value: "Top 3", label: "Target ranking position for core keywords" },
                            { value: "100%", label: "Transparent monthly reporting" },
                        ].map((stat, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="rounded-2xl border border-white/[0.07] bg-[#111520] p-6 text-center">
                                <p className="text-4xl font-bold mb-2" style={{ color: ACCENT }}>{stat.value}</p>
                                <p className="text-white/40 text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Process ───────────────────────────────────────────────────────── */}
            <section id="process" className="relative z-10 py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
                        <p className="text-white/40 max-w-xl mx-auto">SEO that compounds — every month builds on the last.</p>
                    </div>
                    <div className="space-y-4">
                        {process.map((p, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-start gap-6 rounded-2xl border border-white/[0.07] bg-[#111520] p-6">
                                <span className="text-3xl font-bold flex-shrink-0" style={{ color: "#2EEBFF22" }}>{p.step}</span>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">{p.title}</h3>
                                    <p className="text-white/45 text-sm leading-relaxed">{p.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Always included ───────────────────────────────────────────────── */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="rounded-2xl p-[1.5px]" style={{ background: "linear-gradient(135deg, #2EEBFF33, transparent 60%)" }}>
                        <div className="rounded-2xl bg-[#111520] p-8 sm:p-10">
                            <h2 className="text-2xl font-bold text-white mb-6">Always included</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {included.map((item) => (
                                    <div key={item} className="flex items-center gap-3">
                                        <FontAwesomeIcon icon={faCheck} className="text-xs flex-shrink-0" style={{ color: ACCENT }} />
                                        <span className="text-white/70 text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────────────────── */}
            <section className="relative z-10 py-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to rank higher?</h2>
                    <p className="text-white/40 mb-10 max-w-xl mx-auto">
                        Pick a plan and start building organic growth today — or request a custom strategy for complex or enterprise-scale campaigns.
                    </p>
                    <Link href="/services/seo/order"
                        className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                        style={{ background: "linear-gradient(135deg, #2EEBFF, #3A8CFF)", boxShadow: "0 0 40px #2EEBFF55" }}>
                        <FontAwesomeIcon icon={faPenRuler} className="text-base" />
                        Order SEO
                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </Link>
                </div>
            </section>

        </div>
    );
}
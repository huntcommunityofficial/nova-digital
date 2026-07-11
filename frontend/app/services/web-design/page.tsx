"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCode, faArrowRight, faPalette, faMobileAlt,
    faGaugeHigh, faSearchPlus, faCheck, faLayerGroup,
    faPenRuler, faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const ACCENT = "#3A8CFF";

const features = [
    {
        icon: faPalette,
        title: "Award-winning UI/UX",
        desc: "Interfaces built around your users — intuitive, elegant, and designed to convert.",
    },
    {
        icon: faMobileAlt,
        title: "Fully responsive",
        desc: "Pixel-perfect on every device, from widescreen monitors to the smallest phones.",
    },
    {
        icon: faGaugeHigh,
        title: "Performance-first",
        desc: "Optimised load times, clean code, and Core Web Vitals scores that search engines love.",
    },
    {
        icon: faSearchPlus,
        title: "SEO-ready structure",
        desc: "Semantic markup, metadata, and architecture built to rank from day one.",
    },
    {
        icon: faLayerGroup,
        title: "CMS integration",
        desc: "Take control of your content with a headless or traditional CMS tailored to your workflow.",
    },
    {
        icon: faRocket,
        title: "Launch-ready delivery",
        desc: "From design handoff to live site — we handle deployment, testing, and post-launch support.",
    },
];

const process = [
    { step: "01", title: "Discovery", desc: "We learn your business, goals, and audience to align every design decision with your vision." },
    { step: "02", title: "Design", desc: "High-fidelity mockups, interactive prototypes, and design systems crafted for your brand." },
    { step: "03", title: "Development", desc: "Clean, scalable code built on modern tech — fast, secure, and easy to maintain." },
    { step: "04", title: "Launch", desc: "Testing, deployment, and a smooth go-live — plus ongoing support to keep things running perfectly." },
];

const included = [
    "Dedicated project manager",
    "Mobile-first responsive design",
    "Cross-browser testing",
    "Performance optimisation",
    "Post-launch support",
    "Source files included",
];

export default function WebDesignServicePage() {
    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">

            {/* Aurora */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 20% 30%, #3A8CFF18 0%, transparent 55%),
          radial-gradient(circle at 80% 70%, #3A8CFF0D 0%, transparent 55%)
        ` }} />
            <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section className="relative z-10 pt-36 pb-24 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
                            style={{ background: "#3A8CFF1a", boxShadow: "0 0 40px #3A8CFF44" }}>
                            <FontAwesomeIcon icon={faCode} className="text-3xl" style={{ color: ACCENT }} />
                        </div>

                        <p className="text-xs font-semibold tracking-widest text-[#3A8CFF]/60 uppercase mb-4">
                            Service
                        </p>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                            Web Design
                        </h1>

                        <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                            Award‑winning, modern websites that convert visitors into customers — built with precision, strategy, and world-class craft.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                            <Link href="/services/web-design/order"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                                style={{ background: `linear-gradient(135deg, ${ACCENT}, #6C3FFF)`, boxShadow: `0 0 32px ${ACCENT}55` }}>
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
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What you get</h2>
                        <p className="text-white/40 max-w-xl mx-auto">Every project is built to a standard most agencies reserve for their flagship clients.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="rounded-2xl border border-white/[0.07] bg-[#111520] p-6 hover:border-[#3A8CFF]/20 transition-all duration-300">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: "#3A8CFF15", boxShadow: "0 0 16px #3A8CFF22" }}>
                                    <FontAwesomeIcon icon={f.icon} className="text-sm" style={{ color: ACCENT }} />
                                </div>
                                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
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
                        <p className="text-white/40 max-w-xl mx-auto">A clear, collaborative process from kickoff to launch.</p>
                    </div>

                    <div className="space-y-4">
                        {process.map((p, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-start gap-6 rounded-2xl border border-white/[0.07] bg-[#111520] p-6">
                                <span className="text-3xl font-bold flex-shrink-0" style={{ color: "#3A8CFF22" }}>{p.step}</span>
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
                    <div className="rounded-2xl p-[1.5px]" style={{ background: "linear-gradient(135deg, #3A8CFF33, transparent 60%)" }}>
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
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to build something great?</h2>
                    <p className="text-white/40 mb-10 max-w-xl mx-auto">Choose a package and configure your order — or go custom for a fully tailored quote.</p>
                    <Link href="/services/web-design/order"
                        className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                        style={{ background: `linear-gradient(135deg, ${ACCENT}, #6C3FFF)`, boxShadow: `0 0 40px ${ACCENT}55` }}>
                        <FontAwesomeIcon icon={faPenRuler} className="text-base" />
                        Order Web Design
                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </Link>
                </div>
            </section>

        </div>
    );
}
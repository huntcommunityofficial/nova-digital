"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRobot, faArrowRight, faBrain, faCogs, faChartLine,
    faPlug, faNetworkWired, faShieldAlt, faCheck, faPenRuler,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const ACCENT = "#8E4BFF";

const features = [
    {
        icon: faRobot,
        title: "AI Chatbots",
        desc: "Intelligent, conversational bots that handle customer queries 24/7 — powered by LLMs, not scripts.",
    },
    {
        icon: faCogs,
        title: "Workflow automation",
        desc: "Eliminate repetitive tasks with smart pipelines that connect your tools and trigger actions automatically.",
    },
    {
        icon: faNetworkWired,
        title: "CRM & platform integration",
        desc: "Connect Salesforce, HubSpot, Zapier, Slack, and more into one seamless, intelligent ecosystem.",
    },
    {
        icon: faChartLine,
        title: "Analytics & reporting",
        desc: "Real-time dashboards that turn raw data into decisions — surfacing insights before you even ask.",
    },
    {
        icon: faBrain,
        title: "Custom AI models",
        desc: "Fine-tuned models trained on your proprietary data, your domain, your language.",
    },
    {
        icon: faPlug,
        title: "API integrations",
        desc: "Connect any system with secure, well-documented APIs and webhooks built to enterprise standards.",
    },
];

const process = [
    { step: "01", title: "Audit", desc: "We map your current workflows, tools, and bottlenecks to identify exactly where AI delivers the most value." },
    { step: "02", title: "Design", desc: "We architect the automation stack — selecting models, APIs, and pipelines that fit your infrastructure." },
    { step: "03", title: "Build", desc: "Custom development, integration, and testing with your team to ensure everything runs correctly in your environment." },
    { step: "04", title: "Deploy & optimise", desc: "Live deployment with monitoring, performance tuning, and support to keep your AI systems running at peak." },
];

const included = [
    "Dedicated automation engineer",
    "Full source code handover",
    "Integration testing & QA",
    "Documentation & training",
    "Post-launch monitoring",
    "Scalable architecture",
];

export default function AiAutomationServicePage() {
    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">

            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 20% 30%, #8E4BFF18 0%, transparent 55%),
          radial-gradient(circle at 80% 70%, #8E4BFF0D 0%, transparent 55%)
        ` }} />
            <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section className="relative z-10 pt-36 pb-24 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
                            style={{ background: "#8E4BFF1a", boxShadow: "0 0 40px #8E4BFF44" }}>
                            <FontAwesomeIcon icon={faRobot} className="text-3xl" style={{ color: ACCENT }} />
                        </div>
                        <p className="text-xs font-semibold tracking-widest text-[#8E4BFF]/60 uppercase mb-4">Service</p>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                            AI Automation
                        </h1>
                        <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                            AI-powered workflows, intelligent chatbots, and smart integrations that eliminate repetitive work and scale your business without scaling your headcount.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                            <Link href="/services/ai-automation/order"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                                style={{ background: "linear-gradient(135deg, #8E4BFF, #3A8CFF)", boxShadow: "0 0 32px #8E4BFF55" }}>
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
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What we automate</h2>
                        <p className="text-white/40 max-w-xl mx-auto">From customer-facing chatbots to back-office pipelines — we build AI that works.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="rounded-2xl border border-white/[0.07] bg-[#111520] p-6 hover:border-[#8E4BFF]/20 transition-all duration-300">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: "#8E4BFF15", boxShadow: "0 0 16px #8E4BFF22" }}>
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
                        <p className="text-white/40 max-w-xl mx-auto">A structured engagement that delivers results, not just code.</p>
                    </div>
                    <div className="space-y-4">
                        {process.map((p, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-start gap-6 rounded-2xl border border-white/[0.07] bg-[#111520] p-6">
                                <span className="text-3xl font-bold flex-shrink-0" style={{ color: "#8E4BFF22" }}>{p.step}</span>
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
                    <div className="rounded-2xl p-[1.5px]" style={{ background: "linear-gradient(135deg, #8E4BFF33, transparent 60%)" }}>
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
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to automate your business?</h2>
                    <p className="text-white/40 mb-10 max-w-xl mx-auto">Pick a plan and start immediately, or request a custom quote for complex enterprise needs.</p>
                    <Link href="/services/ai-automation/order"
                        className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                        style={{ background: "linear-gradient(135deg, #8E4BFF, #3A8CFF)", boxShadow: "0 0 40px #8E4BFF55" }}>
                        <FontAwesomeIcon icon={faPenRuler} className="text-base" />
                        Order AI Automation
                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </Link>
                </div>
            </section>

        </div>
    );
}
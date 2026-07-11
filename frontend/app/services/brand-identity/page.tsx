"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPalette, faArrowRight, faFont, faLayerGroup,
    faPrint, faSwatchbook, faFileImage, faObjectGroup,
    faCheck, faPenRuler,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const ACCENT = "#FF2EC4";

const features = [
    {
        icon: faPalette,
        title: "Logo design",
        desc: "A mark that works everywhere — from a business card to a billboard, at any size or colour.",
    },
    {
        icon: faFont,
        title: "Typography system",
        desc: "Curated typefaces and a hierarchy that makes your communications instantly recognisable.",
    },
    {
        icon: faSwatchbook,
        title: "Colour palette",
        desc: "A scientifically and aesthetically considered palette that evokes the right emotions in your audience.",
    },
    {
        icon: faLayerGroup,
        title: "Brand guidelines",
        desc: "A comprehensive playbook covering usage rules, spacing, tone, and everything in between.",
    },
    {
        icon: faObjectGroup,
        title: "Social media kit",
        desc: "Profile images, cover photos, post templates, and story assets — ready for every platform.",
    },
    {
        icon: faPrint,
        title: "Print collateral",
        desc: "Business cards, letterheads, and branded documents that leave a lasting physical impression.",
    },
];

const process = [
    { step: "01", title: "Brand discovery", desc: "We dig into your story, values, audience, and competitors to understand what your brand needs to communicate." },
    { step: "02", title: "Concept development", desc: "Multiple creative directions — stylescapes, moodboards, and initial logo concepts — for you to react to." },
    { step: "03", title: "Refinement", desc: "We refine your chosen direction, developing every touchpoint until it feels completely right." },
    { step: "04", title: "Delivery", desc: "All files in every format you'll ever need, plus a brand guidelines document your entire team can use." },
];

const included = [
    "Multiple logo concepts",
    "All source files (AI, SVG, PNG)",
    "Light & dark variants",
    "Dedicated brand strategist",
    "Revision rounds",
    "Brand guidelines PDF",
];

export default function BrandIdentityServicePage() {
    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">

            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 20% 30%, #FF2EC418 0%, transparent 55%),
          radial-gradient(circle at 80% 70%, #FF2EC40D 0%, transparent 55%)
        ` }} />
            <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <section className="relative z-10 pt-36 pb-24 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8"
                            style={{ background: "#FF2EC41a", boxShadow: "0 0 40px #FF2EC444" }}>
                            <FontAwesomeIcon icon={faPalette} className="text-3xl" style={{ color: ACCENT }} />
                        </div>
                        <p className="text-xs font-semibold tracking-widest text-[#FF2EC4]/60 uppercase mb-4">Service</p>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                            Brand Identity
                        </h1>
                        <p className="text-white/50 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                            A complete visual identity that tells your story at a glance — logo, typography, colour, and everything in between, built to be instantly recognisable.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                            <Link href="/services/brand-identity/order"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                                style={{ background: "linear-gradient(135deg, #FF2EC4, #8E4BFF)", boxShadow: "0 0 32px #FF2EC455" }}>
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
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What's included</h2>
                        <p className="text-white/40 max-w-xl mx-auto">Every element of your brand, considered and crafted to work together.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="rounded-2xl border border-white/[0.07] bg-[#111520] p-6 hover:border-[#FF2EC4]/20 transition-all duration-300">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: "#FF2EC415", boxShadow: "0 0 16px #FF2EC422" }}>
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
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our creative process</h2>
                        <p className="text-white/40 max-w-xl mx-auto">Structured creativity — rigorous research, bold ideas, and refined execution.</p>
                    </div>
                    <div className="space-y-4">
                        {process.map((p, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex items-start gap-6 rounded-2xl border border-white/[0.07] bg-[#111520] p-6">
                                <span className="text-3xl font-bold flex-shrink-0" style={{ color: "#FF2EC422" }}>{p.step}</span>
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
                    <div className="rounded-2xl p-[1.5px]" style={{ background: "linear-gradient(135deg, #FF2EC433, transparent 60%)" }}>
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
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to build your brand?</h2>
                    <p className="text-white/40 mb-10 max-w-xl mx-auto">Choose a package or request a bespoke brand project — we'll build an identity that lasts.</p>
                    <Link href="/services/brand-identity/order"
                        className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                        style={{ background: "linear-gradient(135deg, #FF2EC4, #8E4BFF)", boxShadow: "0 0 40px #FF2EC455" }}>
                        <FontAwesomeIcon icon={faPenRuler} className="text-base" />
                        Order Brand Identity
                        <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                    </Link>
                </div>
            </section>

        </div>
    );
}
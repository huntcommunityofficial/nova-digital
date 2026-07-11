"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCode, faRobot, faPalette, faMagnifyingGlassChart,
    faArrowRight, faCheck, faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
    {
        icon: faCode,
        label: "Web Design",
        color: "#3A8CFF",
        slug: "web-design",
        orderHref: "/services/web-design/order",
        tagline: "Sites that perform, not just look good.",
        description:
            "We build fast, conversion-focused websites that reflect your brand and work flawlessly across every device. From landing pages to full-scale platforms — we build for results.",
        features: [
            "Custom responsive design",
            "Performance & Core Web Vitals optimized",
            "CMS integration (WordPress, Sanity, etc.)",
            "SEO-ready structure",
            "Ongoing support & maintenance",
        ],
        packages: [
            { name: "Starter",        price: "$1,200",  desc: "Perfect for small businesses & personal brands." },
            { name: "Pro",            price: "$3,500",  desc: "Full-featured site with CMS & advanced design.",  popular: true },
            { name: "Elite",          price: "$7,500",  desc: "Award-winning, full-scale advanced websites." },
            { name: "Custom project", price: "Custom",  desc: "Large-scale platforms with custom functionality." },
        ],
    },
    {
        icon: faRobot,
        label: "AI Automation",
        color: "#8E4BFF",
        slug: "ai-automation",
        orderHref: "/services/ai-automation/order",
        tagline: "Automate the work. Keep the humans.",
        description:
            "We design and deploy AI-powered workflows that eliminate manual processes, reduce costs, and free your team to focus on what actually matters.",
        features: [
            "Custom AI workflow design",
            "CRM, email & tool integrations",
            "Chatbots & virtual assistants",
            "Data extraction & processing pipelines",
            "Ongoing monitoring & optimization",
        ],
        packages: [
            { name: "Starter",        price: "$800",   desc: "One automation workflow, end-to-end." },
            { name: "Growth",         price: "$2,500", desc: "Multi-workflow suite with integrations.", popular: true },
            { name: "Enterprise",     price: "$6,000", desc: "Custom AI with unlimited scale." },
            { name: "Custom project", price: "Custom", desc: "Fine-tuned AI models outside standard plans." },
        ],
    },
    {
        icon: faPalette,
        label: "Brand Identity",
        color: "#FF2EC4",
        slug: "brand-identity",
        orderHref: "/services/brand-identity/order",
        tagline: "A brand people remember — and trust.",
        description:
            "We build cohesive visual identities that communicate who you are at a glance. Logo, typography, color system, and brand guidelines — all crafted with intention.",
        features: [
            "Logo design (3 concepts)",
            "Full color palette & typography system",
            "Brand guidelines document",
            "Social media kit",
            "Business card & stationery design",
        ],
        packages: [
            { name: "Basic",          price: "$900",   desc: "Logo + color palette + basic guidelines." },
            { name: "Standard",       price: "$2,800", desc: "Full identity system with all deliverables.", popular: true },
            { name: "Premium",        price: "$6,500", desc: "Enterprise-grade rebranding." },
            { name: "Custom project", price: "Custom", desc: "Full rebranding for established businesses." },
        ],
    },
    {
        icon: faMagnifyingGlassChart,
        label: "SEO",
        color: "#2EEBFF",
        slug: "seo",
        orderHref: "/services/seo/order",
        tagline: "Rank higher. Get found. Grow organically.",
        description:
            "We build and execute data-driven SEO strategies that drive sustainable organic traffic. From technical audits to content strategy — we cover every layer.",
        features: [
            "Full technical SEO audit",
            "Keyword research & mapping",
            "On-page & content optimization",
            "Link building strategy",
            "Monthly performance reports",
        ],
        packages: [
            { name: "Starter",        price: "$600",   desc: "Local or niche SEO for smaller sites." },
            { name: "Growth",         price: "$1,800", desc: "Competitive markets with full execution.", popular: true },
            { name: "Authority",      price: "$4,500", desc: "Large sites, multiple markets, full team." },
            { name: "Custom project", price: "Custom", desc: "Enterprise SEO campaigns and multi-site strategy." },
        ],
    },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
    const [activeSlug, setActiveSlug] = useState(SERVICES[0].slug);
    const active = SERVICES.find((s) => s.slug === activeSlug)!;

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">

            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
                    radial-gradient(circle at 10% 10%, ${active.color}0e 0%, transparent 45%),
                    radial-gradient(circle at 90% 90%, ${active.color}08 0%, transparent 45%)
                `,
                transition: "background 0.6s ease",
            }} />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24">

                {/* ── Header ── */}
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: active.color }}>
                        Our Services
                    </p>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 leading-[1.1]">
                        Everything you need<br className="hidden sm:block" /> to grow online.
                    </h1>
                    <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                        Four focused services. One team. All built around measurable results.
                    </p>
                </div>

                {/* ── Tab switcher ── */}
                <div className="flex items-center gap-2 sm:gap-3 justify-center flex-wrap mb-14">
                    {SERVICES.map((svc) => (
                        <button
                            key={svc.slug}
                            onClick={() => setActiveSlug(svc.slug)}
                            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border"
                            style={activeSlug === svc.slug ? {
                                background: `${svc.color}18`,
                                borderColor: `${svc.color}55`,
                                color: svc.color,
                                boxShadow: `0 0 18px ${svc.color}28`,
                            } : {
                                borderColor: "rgba(255,255,255,0.07)",
                                color: "rgba(255,255,255,0.4)",
                            }}
                        >
                            <FontAwesomeIcon icon={svc.icon} className="text-xs" />
                            <span className="hidden sm:inline">{svc.label}</span>
                            <span className="sm:hidden">{svc.label.split(" ")[0]}</span>
                        </button>
                    ))}
                </div>

                {/* ── Service detail panel ── */}
                <div
                    key={active.slug}
                    className="rounded-3xl border overflow-hidden"
                    style={{ borderColor: `${active.color}22` }}
                >
                    {/* Top bar */}
                    <div className="px-6 sm:px-10 py-8 border-b"
                        style={{
                            borderColor: `${active.color}18`,
                            background: `radial-gradient(ellipse at top left, ${active.color}0d 0%, transparent 55%)`,
                        }}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${active.color}18`, boxShadow: `0 0 20px ${active.color}30` }}>
                                    <FontAwesomeIcon icon={active.icon} className="text-lg" style={{ color: active.color }} />
                                </div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{active.label}</h2>
                                    <p className="text-white/45 text-sm mt-0.5">{active.tagline}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <Link href={`/services/${active.slug}`}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/[0.1] text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
                                    Learn More
                                </Link>
                                <Link href={active.orderHref}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all"
                                    style={{ background: active.color, boxShadow: `0 0 16px ${active.color}44` }}>
                                    Get Started
                                    <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x"
                        style={{ background: "rgba(255,255,255,0.01)", borderColor: `${active.color}10` }}>

                        {/* Left: about + features */}
                        <div className="lg:col-span-2 px-6 sm:px-8 py-8">
                            <p className="text-white/40 text-sm leading-relaxed mb-8">{active.description}</p>

                            <p className="text-white/25 text-[10px] uppercase tracking-widest font-semibold mb-4">What's included</p>
                            <ul className="space-y-3">
                                {active.features.map((f) => (
                                    <li key={f} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ background: `${active.color}18` }}>
                                            <FontAwesomeIcon icon={faCheck} className="text-[9px]" style={{ color: active.color }} />
                                        </div>
                                        <span className="text-white/65 text-sm">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right: packages */}
                        <div className="lg:col-span-3 px-6 sm:px-8 py-8">
                            <p className="text-white/25 text-[10px] uppercase tracking-widest font-semibold mb-5">Packages</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {active.packages.map((pkg) => (
                                    <div key={pkg.name}
                                        className="rounded-2xl border p-5 transition-all duration-200 relative"
                                        style={{
                                            borderColor: pkg.popular ? `${active.color}45` : "rgba(255,255,255,0.06)",
                                            background: pkg.popular
                                                ? `radial-gradient(ellipse at top left, ${active.color}10 0%, transparent 65%), rgba(255,255,255,0.02)`
                                                : "rgba(255,255,255,0.02)",
                                        }}>
                                        {pkg.popular && (
                                            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                                                style={{ background: `${active.color}22`, color: active.color }}>
                                                Popular
                                            </span>
                                        )}
                                        <p className="text-white/85 text-sm font-semibold mb-1">{pkg.name}</p>
                                        <p className="text-white/30 text-xs mb-4 leading-relaxed pr-10">{pkg.desc}</p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xl font-bold"
                                                style={{ color: pkg.popular ? active.color : "rgba(255,255,255,0.75)" }}>
                                                {pkg.price}
                                            </p>
                                            <Link href={active.orderHref}
                                                className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
                                                style={{ color: `${active.color}99` }}
                                                onMouseEnter={(e) => (e.currentTarget.style.color = active.color)}
                                                onMouseLeave={(e) => (e.currentTarget.style.color = `${active.color}99`)}>
                                                Order <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[9px]" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── All services mini-grid ── */}
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {SERVICES.filter((s) => s.slug !== activeSlug).map((svc) => (
                        <button key={svc.slug} onClick={() => setActiveSlug(svc.slug)}
                            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all p-5 text-left group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: `${svc.color}15` }}>
                                    <FontAwesomeIcon icon={svc.icon} className="text-xs" style={{ color: svc.color }} />
                                </div>
                                <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{svc.label}</p>
                            </div>
                            <p className="text-white/30 text-xs leading-relaxed">{svc.tagline}</p>
                        </button>
                    ))}
                </div>

                {/* ── Bottom CTA ── */}
                <div className="mt-16 rounded-3xl border border-white/[0.07] p-10 sm:p-14 text-center"
                    style={{ background: "radial-gradient(ellipse at center, #3A8CFF09 0%, transparent 65%)" }}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Not sure where to start?</h2>
                    <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
                        Tell us about your project and we'll put together a custom plan — no commitment needed.
                    </p>
                    <Link href="/contact"
                        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all"
                        style={{ background: "#3A8CFF", boxShadow: "0 0 22px #3A8CFF40" }}>
                        Book a free consultation
                        <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
"use client";

import { useState } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner, faGauge, faBoxOpen, faNewspaper,
    faRightFromBracket, faArrowLeft, faBars, faTimes,
    faShieldHalved,
    faComment, faEnvelope,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";
import api from "@/app/lib/api";
import NotFound from "@/app/not-found";

const NAV_ITEMS = [
    { href: "/admin", icon: faGauge, label: "Overview" },
    { href: "/admin/orders", icon: faBoxOpen, label: "Orders" },
    { href: "/admin/users",  icon: faUsers, label: "Users"    },
    { href: "/admin/blog", icon: faNewspaper, label: "Blog" },
    { href: "/admin/chat", icon: faComment, label: "Chat" },
    { href: "/admin/contacts", icon: faEnvelope, label: "Messages" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const guard = useAdminGuard();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    async function handleLogout() {
        try {
            await api.post("/api/logout");
        } finally {
            router.push("/");
        }
    }

    if (guard === "loading") return <NotFound/>;

    if (guard === "unauthorized") {
        notFound();
    }

    function isActive(href: string) {
        return href === "/admin" ? pathname === "/admin" : pathname?.startsWith(href);
    }

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white flex flex-col md:flex-row">

            {/* Background aurora */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 15% 20%, #3A8CFF10 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #8E4BFF0D 0%, transparent 50%)
        ` }} />
            <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

            {/* ── Mobile top bar ─────────────────────────────────────────────── */}
            <header className="md:hidden relative z-30 flex items-center justify-between px-4 py-4 border-b border-white/[0.07] bg-[#0d0f14]/90 backdrop-blur-xl sticky top-0">
                <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                    Site
                </Link>

                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-red-400 text-sm" />
                    Admin Panel
                </div>

                <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white w-8 h-8 flex items-center justify-center">
                    <FontAwesomeIcon icon={mobileOpen ? faTimes : faBars} />
                </button>
            </header>

            {/* Mobile dropdown nav */}
            {mobileOpen && (
                <div className="md:hidden relative z-30 border-b border-white/[0.07] bg-[#0d0f14]/95 backdrop-blur-xl">
                    <nav className="px-3 py-3 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all duration-200 ${active
                                        ? "text-white bg-[#3A8CFF]/[0.12] border border-[#3A8CFF]/20"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.03] border border-transparent"
                                        }`}>
                                    <FontAwesomeIcon icon={item.icon} className="text-sm w-4"
                                        style={{ color: active ? "#3A8CFF" : undefined }} />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <button onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/[0.08] transition-all duration-200 w-full">
                            <FontAwesomeIcon icon={faRightFromBracket} className="text-sm w-4" />
                            Log out
                        </button>
                    </nav>
                </div>
            )}

            {/* ── Desktop sidebar ────────────────────────────────────────────── */}
            <aside className="relative z-10 w-60 flex-shrink-0 border-r border-white/[0.07] bg-[#0d0f14]/80 backdrop-blur-xl hidden md:flex flex-col">
                <div className="px-6 py-6 border-b border-white/[0.07]">
                    <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-xs mb-4">
                        <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" /> Back to site
                    </Link>
                    <p className="text-white font-bold text-lg flex items-center gap-2">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-red-400 text-base" />
                        Admin Panel
                    </p>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link key={item.href} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${active
                                    ? "text-white bg-[#3A8CFF]/[0.12] border border-[#3A8CFF]/20"
                                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03] border border-transparent"
                                    }`}>
                                <FontAwesomeIcon icon={item.icon} className="text-sm w-4"
                                    style={{ color: active ? "#3A8CFF" : undefined }} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-3 py-4 border-t border-white/[0.07]">
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 w-full">
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-sm w-4" />
                        Log out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="relative z-10 flex-1 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
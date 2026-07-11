"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
    id: number;
    title: string;
    min_content: string;
    image: string | null;
    created_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
const PER_PAGE = 6;

function imageUrl(path: string | null): string {
    if (!path) return "/images/blog.png";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}/storage/${path}`;
}

function fmtDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlogsPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        api.get<{ data: BlogPost[] }>("/api/admin/blog/index")
            .then(({ data }) => setPosts(data.data))
            .catch(() => setError("Failed to load blog posts."))
            .finally(() => setLoading(false));
    }, []);

    // ── Pagination ─────────────────────────────────────────────────────────────
    const totalPages = Math.ceil(posts.length / PER_PAGE);
    const currentPosts = posts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    function goToPage(p: number) {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">

            {/* Aurora background */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 20% 25%, #3A8CFF18 0%, transparent 55%),
          radial-gradient(circle at 80% 75%, #8E4BFF12 0%, transparent 55%)
        ` }} />
            <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-28">

                {/* Header */}
                <div className="text-center mb-14">
                    <p className="text-xs font-semibold tracking-widest text-[#3A8CFF]/60 uppercase mb-3">
                        Our Blog
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-white">Latest Insights</h1>
                    <p className="text-white/40 text-lg mt-4 max-w-2xl mx-auto">
                        Explore our articles on design, development, branding and digital growth.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 mb-8 text-sm text-red-400 text-center">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-3xl animate-spin" />
                    </div>
                ) : currentPosts.length === 0 ? (
                    <div className="text-center py-24 text-white/30">
                        No articles yet. Check back soon.
                    </div>
                ) : (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentPosts.map((post, idx) => (
                                <Link
                                    key={post.id}
                                    href={`/blogs/${post.id}`}
                                    className="group relative p-[1.5px] rounded-2xl transition-all duration-300 hover:scale-[1.02] block"
                                    style={{ background: "linear-gradient(135deg, rgba(58,140,255,0.15), rgba(142,75,255,0.08))" }}
                                >
                                    <div className="rounded-2xl bg-[#111520] overflow-hidden h-full flex flex-col transition-all duration-500 group-hover:shadow-[0_0_40px_-10px_rgba(58,140,255,0.3)]">

                                        {/* Cover image */}
                                        <div className="relative h-52 w-full overflow-hidden flex-shrink-0">
                                            <div className="absolute inset-0 bg-blue-500/10 opacity-60 blur-xl z-[1]" />
                                            <Image
                                                src={imageUrl(post.image)}
                                                alt={post.title}
                                                fill
                                                unoptimized
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        </div>

                                        {/* Body */}
                                        <div className="p-6 flex flex-col flex-1">
                                            <p className="text-white/25 text-xs mb-3">{fmtDate(post.created_at)}</p>
                                            <h2 className="text-white font-bold text-lg leading-snug mb-3 line-clamp-2">
                                                {post.title}
                                            </h2>
                                            <p className="text-white/45 text-sm leading-relaxed line-clamp-3 flex-1">
                                                {post.min_content}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-5 text-[#3A8CFF] text-sm font-medium group-hover:gap-2.5 transition-all duration-300">
                                                Read article
                                                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                                            </div>
                                        </div>

                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-14">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => goToPage(p)}
                                        className={`w-9 h-9 rounded-xl text-sm font-medium border transition-all duration-200 ${p === page
                                                ? "text-white border-[#3A8CFF]"
                                                : "text-white/40 border-white/[0.07] hover:border-white/25 hover:text-white/70"
                                            }`}
                                        style={p === page
                                            ? { background: "#3A8CFF1a", boxShadow: "0 0 12px #3A8CFF44" }
                                            : { background: "rgba(255,255,255,0.02)" }}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
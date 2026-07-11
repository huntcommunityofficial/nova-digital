"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
    id: number;
    title: string;
    min_content: string;
    max_content: string;
    image: string | null;
    created_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

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

export default function BlogShowPage() {
    const { id: urlId } = useParams();
    const router = useRouter();

    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allIds, setAllIds] = useState<number[]>([]);

    const currentId = parseInt(urlId as string, 10);

    useEffect(() => {
        if (!urlId) return;
        setLoading(true);
        setError(null);

        api.get<{ data: BlogPost }>(`/api/admin/blog/show/${urlId}`)
            .then(({ data }) => setPost(data.data))
            .catch(() => setError("Blog post not found."))
            .finally(() => setLoading(false));
    }, [urlId]);

    function navigate(direction: "prev" | "next") {
        const newId = direction === "next" ? currentId + 1 : currentId - 1;
        if (newId < 1) return;
        router.push(`/blogs/${newId}`);
    }

    useEffect(() => {
        api.get<{ data: { id: number }[] }>("/api/admin/blog/index")
            .then(({ data }) => setAllIds(data.data.map((p) => p.id)));
    }, []);

    // ── Loading ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────

    if (error || !post) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center text-white/40 text-sm gap-4">
                <p>{error ?? "Post not found."}</p>
                <Link href="/blogs" className="text-[#3A8CFF] hover:underline">
                    ← Back to all articles
                </Link>
            </div>
        );
    }

    // Blog post exists, render it. Determine min/max IDs for navigation buttons.
    const sortedIds = [...allIds].sort((a, b) => a - b);
    const maxId = sortedIds[sortedIds.length - 1] ?? currentId;
    const minId = sortedIds[0] ?? 1;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">

            {/* Aurora */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 15% 20%, #3A8CFF15 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #8E4BFF0D 0%, transparent 50%)
        ` }} />
            <div className="fixed inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none z-0" />

            {/* Cover image — full-width hero */}
            {/* <div className="relative w-full h-72 md:h-96 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0f14] z-10" />
                <Image
                    src={imageUrl(post.image)}
                    alt={post.title}
                    fill
                    unoptimized
                    className="object-cover"
                />
            </div> */}

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-26 pb-16">

                {/* Back link */}
                <Link href="/blogs"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm mb-8">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                    All articles
                </Link>

                {/* Article card */}
                <div className="rounded-2xl border border-white/[0.07] bg-[#111520] overflow-hidden">

                    <div className="p-8 sm:p-10">

                        {/* Meta */}
                        <p className="text-white/30 text-xs mb-4">{fmtDate(post.created_at)}</p>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
                            {post.title}
                        </h1>

                        {/* Image */}
                        <div className="my-4">
                            <Image
                                src={imageUrl(post.image)}
                                alt={post.title}
                                width={800}
                                height={450}    // ← نسبت 16:9
                                unoptimized
                                className="object-cover rounded-xl w-full"
                            />
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-[#3A8CFF]/30 via-white/10 to-transparent mb-8" />

                        {/* Summary */}
                        <p className="text-white/60 text-lg leading-relaxed mb-8 font-light italic border-l-2 border-[#3A8CFF]/40 pl-5">
                            {post.min_content}
                        </p>

                        {/* Full content */}
                        <div className="text-white/70 text-base leading-[1.9] whitespace-pre-wrap">
                            {post.max_content}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between px-8 sm:px-10 py-5 border-t border-white/[0.06]">
                        <button
                            onClick={() => navigate("prev")}
                            disabled={currentId <= minId || allIds.length === 0}
                            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                            Previous
                        </button>

                        <Link href="/blogs" className="text-xs text-white/25 hover:text-white/50 transition-colors">
                            All articles
                        </Link>

                        <button
                            onClick={() => navigate("next")}
                            disabled={currentId >= maxId || allIds.length === 0}
                            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                        >
                            Next
                            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
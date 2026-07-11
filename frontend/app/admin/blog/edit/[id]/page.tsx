"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeftLong, faImage, faXmark, faCheck, faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import api from "@/app/lib/api";

// ─── Image validation constants ───────────────────────────────────────────────

const MAX_SIZE_MB = 4;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTS = ".jpg, .jpeg, .png, .webp";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

function existingImageUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}/storage/${path}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogData {
    id: number;
    title: string;
    min_content: string;
    max_content: string;
    image: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditBlogPage() {
    const { id: urlId } = useParams();
    const router = useRouter();

    // Form state
    const [title, setTitle] = useState("");
    const [minContent, setMinContent] = useState("");
    const [maxContent, setMaxContent] = useState("");

    // Image state
    const [existingImage, setExistingImage] = useState<string | null>(null); // path from DB
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [removeExisting, setRemoveExisting] = useState(false);

    // Page state
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Fetch blog ───────────────────────────────────────────────────────────

    useEffect(() => {
        if (!urlId) return;

        api.get<{ data: BlogData }>(`/api/admin/blog/show/${urlId}`)
            .then(({ data }) => {
                const post = data.data;
                setTitle(post.title);
                setMinContent(post.min_content);
                setMaxContent(post.max_content);
                setExistingImage(post.image ?? null);
            })
            .catch(() => setFetchError("Failed to load blog post."))
            .finally(() => setLoading(false));
    }, [urlId]);

    // ── Image handling ────────────────────────────────────────────────────────

    function handleImageChange(file: File | null) {
        setImageError(null);
        setNewImageFile(null);
        setNewImagePreview(null);

        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            setImageError("Unsupported format. Please use JPG, PNG, or WebP.");
            return;
        }

        if (file.size > MAX_SIZE_BYTES) {
            setImageError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
            return;
        }

        setNewImageFile(file);
        setNewImagePreview(URL.createObjectURL(file));
        setRemoveExisting(true); // replacing existing
    }

    function clearNewImage() {
        setNewImageFile(null);
        setNewImagePreview(null);
        setImageError(null);
        setRemoveExisting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleRemoveExisting() {
        setRemoveExisting(true);
        setExistingImage(null);
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        handleImageChange(e.dataTransfer.files?.[0] ?? null);
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setResult(null);

        if (!title.trim() || !minContent.trim() || !maxContent.trim()) {
            setResult({ ok: false, msg: "All text fields are required." });
            return;
        }

        // Laravel doesn't support file uploads via PUT — use POST + _method spoofing
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("min_content", minContent.trim());
        formData.append("max_content", maxContent.trim());
        if (newImageFile) {
            formData.append("image", newImageFile);
        }
        if (removeExisting && !newImageFile) {
            formData.append("remove_image", "1");
        }

        setSubmitting(true);
        try {
            // POST with _method=PUT — no Content-Type override, let axios set it
            await api.post("/api/admin/blog/store", formData, {
                headers: { "Content-Type": "multipart/form-data" }, // ← این اشتباهه
            });
            setResult({ ok: true, msg: "Blog updated successfully. Redirecting..." });
            setTimeout(() => router.push("/admin/blog"), 2000);
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? "Something went wrong. Please try again.";
            setResult({ ok: false, msg });
        } finally {
            setSubmitting(false);
        }
    }

    // ── Render: loading / error ───────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center text-white/40 text-sm gap-4">
                <p>{fetchError}</p>
                <Link href="/admin/blog" className="text-[#3A8CFF] hover:underline">Back to blog list</Link>
            </div>
        );
    }

    // ── Render: form ──────────────────────────────────────────────────────────

    // What image are we currently showing?
    const shownPreview = newImagePreview;
    const shownExisting = !newImagePreview && !removeExisting ? existingImageUrl(existingImage) : null;
    const showUploadZone = !shownPreview && !shownExisting;

    return (
        <div className="min-h-screen bg-[#0d0f14] text-white">
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                background: `
          radial-gradient(circle at 15% 20%, #3A8CFF10 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #8E4BFF0D 0%, transparent 50%)
        ` }} />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/admin/blog"
                        className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm">
                        <FontAwesomeIcon icon={faArrowLeftLong} className="text-xs" />
                        Back
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Edit blog post</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title */}
                    <Field label="Title" required>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Top Web Design Trends for 2025"
                            className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/50 focus:ring-1 focus:ring-[#3A8CFF]/30 transition-all"
                        />
                    </Field>

                    {/* Cover image */}
                    <Field label="Cover image">

                        {/* New image preview (just selected) */}
                        {shownPreview && (
                            <div className="rounded-xl overflow-hidden border border-white/[0.07]">
                                <div className="relative h-52 w-full">
                                    <Image
                                        src={shownPreview}
                                        alt="New image preview"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className="text-xs bg-[#3A8CFF]/80 text-white px-2 py-0.5 rounded-full">New</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2 bg-[#13161d] border-t border-white/[0.07]">
                                    <span className="text-xs text-white/40 truncate max-w-xs">
                                        {newImageFile?.name}
                                        <span className="ml-2 text-white/25">
                                            ({(newImageFile!.size / (1024 * 1024)).toFixed(2)} MB)
                                        </span>
                                    </span>
                                    <button type="button" onClick={clearNewImage}
                                        className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors ml-4 flex-shrink-0">
                                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Existing image from DB */}
                        {shownExisting && (
                            <div className="rounded-xl overflow-hidden border border-white/[0.07]">
                                <div className="relative h-52 w-full">
                                    <Image
                                        src={shownExisting}
                                        alt="last image preview"
                                        fill
                                        unoptimized  // ← این خط کافیه
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">Current</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-4 py-2 bg-[#13161d] border-t border-white/[0.07]">
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className="text-xs text-[#3A8CFF]/70 hover:text-[#3A8CFF] transition-colors">
                                        Replace image
                                    </button>
                                    <button type="button" onClick={handleRemoveExisting}
                                        className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Upload zone — when no image */}
                        {showUploadZone && (
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                className={`rounded-xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-all duration-200 ${imageError
                                    ? "border-red-500/40 bg-red-500/[0.04]"
                                    : "border-white/[0.1] hover:border-white/25 hover:bg-white/[0.02]"
                                    }`}>
                                <FontAwesomeIcon icon={faImage} className="text-3xl mb-3"
                                    style={{ color: imageError ? "#EF4444" : "rgba(255,255,255,0.2)" }} />
                                <p className="text-white/40 text-sm">Click to upload or drag & drop</p>
                                <p className="text-white/20 text-xs mt-1">{ALLOWED_EXTS} · Max {MAX_SIZE_MB}MB</p>
                                {imageError && (
                                    <p className="text-red-400/80 text-xs mt-3">{imageError}</p>
                                )}
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ALLOWED_TYPES.join(",")}
                            className="hidden"
                            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                        />
                    </Field>

                    {/* Short description */}
                    <Field label="Short description (shown on cards)" required>
                        <textarea
                            value={minContent}
                            onChange={(e) => setMinContent(e.target.value)}
                            rows={3}
                            placeholder="A brief summary visible on the blog listing page..."
                            className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/50 focus:ring-1 focus:ring-[#3A8CFF]/30 transition-all resize-none"
                        />
                    </Field>

                    {/* Full content */}
                    <Field label="Full content" required>
                        <textarea
                            value={maxContent}
                            onChange={(e) => setMaxContent(e.target.value)}
                            rows={10}
                            placeholder="Write the full article here..."
                            className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/50 focus:ring-1 focus:ring-[#3A8CFF]/30 transition-all resize-none"
                        />
                    </Field>

                    {/* Result message */}
                    {result && (
                        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${result.ok
                            ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400"
                            : "border-red-500/30 bg-red-500/[0.06] text-red-400"
                            }`}>
                            <FontAwesomeIcon icon={result.ok ? faCheck : faXmark} className="text-xs" />
                            {result.msg}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                        <Link href="/admin/blog"
                            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
                            <FontAwesomeIcon icon={faArrowLeftLong} className="text-xs" />
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || !!imageError}
                            className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            style={{ background: "#3A8CFF", boxShadow: "0 0 24px #3A8CFF44" }}>
                            {submitting
                                ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Saving...</>
                                : "Save changes"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, required, children }: {
    label: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                {label}{required && <span className="text-[#3A8CFF] ml-1">*</span>}
            </label>
            {children}
        </div>
    );
}
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeftLong, faImage, faXmark, faCheck, faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/app/lib/api";

// ─── Image validation constants ───────────────────────────────────────────────
const MAX_SIZE_MB = 4;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTS = ".jpg, .jpeg, .png, .webp";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateBlogPage() {
    const [title, setTitle] = useState("");
    const [minContent, setMinContent] = useState("");
    const [maxContent, setMaxContent] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Image selection ───────────────────────────────────────────────────────

    function handleImageChange(file: File | null) {
        setImageError(null);
        setImageFile(null);
        setImagePreview(null);

        if (!file) return;

        // Frontend validation — mirrors backend rules
        if (!ALLOWED_TYPES.includes(file.type)) {
            setImageError(`Unsupported format. Please use JPG, PNG, or WebP.`);
            return;
        }

        if (file.size > MAX_SIZE_BYTES) {
            setImageError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    function clearImage() {
        setImageFile(null);
        setImagePreview(null);
        setImageError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] ?? null;
        handleImageChange(file);
    }

    // ── Submit ────────────────────────────────────────────────────────────────

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setResult(null);

        if (!title.trim() || !minContent.trim() || !maxContent.trim()) {
            setResult({ ok: false, msg: "All text fields are required." });
            return;
        }

        // Build FormData — required for file uploads (not JSON)
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("min_content", minContent.trim());
        formData.append("max_content", maxContent.trim());
        if (imageFile) {
            formData.append("image", imageFile);
        }

        setSubmitting(true);
        try {
            await api.post("/api/admin/blog/store", formData, {
                headers: { "Content-Type": "multipart/form-data" }, // ← این اشتباهه
            });
            setResult({ ok: true, msg: "Blog created successfully." });
            // Reset form
            setTitle("");
            setMinContent("");
            setMaxContent("");
            clearImage();
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                ?? "Something went wrong. Please try again.";
            setResult({ ok: false, msg });
        } finally {
            setSubmitting(false);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────

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
                    <h1 className="text-2xl font-bold text-white">Create blog post</h1>
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
                        {imagePreview ? (
                            <div className="relative rounded-xl overflow-hidden border border-white/[0.07]">
                                <div className="relative h-52 w-full">
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                </div>
                                {/* Info bar */}
                                <div className="flex items-center justify-between px-4 py-2 bg-[#13161d] border-t border-white/[0.07]">
                                    <div className="text-xs text-white/40 truncate max-w-xs">
                                        {imageFile?.name}
                                        <span className="ml-2 text-white/25">
                                            ({(imageFile!.size / (1024 * 1024)).toFixed(2)} MB)
                                        </span>
                                    </div>
                                    <button type="button" onClick={clearImage}
                                        className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors ml-4 flex-shrink-0">
                                        <FontAwesomeIcon icon={faXmark} className="text-xs" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                                className={`rounded-xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-all duration-200 ${imageError
                                    ? "border-red-500/40 bg-red-500/[0.04]"
                                    : "border-white/[0.1] hover:border-white/25 hover:bg-white/[0.02]"
                                    }`}>
                                <FontAwesomeIcon icon={faImage}
                                    className="text-3xl mb-3"
                                    style={{ color: imageError ? "#EF4444" : "rgba(255,255,255,0.2)" }} />
                                <p className="text-white/40 text-sm">
                                    Click to upload or drag & drop
                                </p>
                                <p className="text-white/20 text-xs mt-1">
                                    {ALLOWED_EXTS} · Max {MAX_SIZE_MB}MB
                                </p>
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
                                ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Publishing...</>
                                : "Publish post"}
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
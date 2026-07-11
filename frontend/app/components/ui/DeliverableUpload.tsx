"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFileArrowUp, faUpload, faSpinner, faCheck, faRotateRight, faXmark, faTrash,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";

interface Props {
    orderId: number;
    currentPath: string | null;
    onUploaded: (newPath: string) => void;
    onDeleted?: () => void;
    accentColor?: string;
}

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

export default function DeliverableUpload({ orderId, currentPath, onUploaded, onDeleted, accentColor = "#10B981" }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    function handleFile(f: File | null) {
        setFileError(null);
        setFile(null);
        if (!f) return;
        if (f.size > MAX_SIZE_BYTES) {
            setFileError("File too large. Maximum size is 50MB.");
            return;
        }
        setFile(f);
    }

    function handleClear() {
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
    }

    async function handleUpload() {
        if (!file || uploading) return;
        setUploading(true);
        setUploadError(null);
        const formData = new FormData();
        formData.append("deliverable", file);
        try {
            const { data } = await api.post(`/api/admin/orders/${orderId}/deliverable`, formData);
            onUploaded(data.deliverable_path);
            setFile(null);
        } catch {
            setUploadError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    async function handleDelete() {
        if (!confirm("Delete the uploaded deliverable file?")) return;
        setDeleting(true);
        try {
            await api.delete(`/api/admin/orders/${orderId}/deliverable`);
            onDeleted?.();
        } catch {
            // silent
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="rounded-2xl border border-white/[0.07] bg-[#111520] p-6 mb-8">
            {/* header */}
            <div className="flex items-center gap-3 mb-5">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${accentColor}18`, boxShadow: `0 0 12px ${accentColor}33` }}
                >
                    <FontAwesomeIcon icon={faFileArrowUp} className="text-sm" style={{ color: accentColor }} />
                </div>
                <div>
                    <p className="text-white/90 text-sm font-semibold">
                        {currentPath ? "Replace deliverable file" : "Upload deliverable file"}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">
                        {currentPath
                            ? "Uploading a new file will replace the current one."
                            : "Upload the final files for the client. The order will be marked as completed."}
                    </p>
                </div>
            </div>

            {/* current file row */}
            {currentPath && !file && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 mb-3">
                    <a
                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${currentPath}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-white/50 hover:text-white/80 transition-colors truncate"
                    >
                        📎 {currentPath.split("/").pop()}
                    </a>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors flex-shrink-0 disabled:opacity-40"
                    >
                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                        {deleting ? "Deleting…" : "Remove"}
                    </button>
                </div>
            )}

            {/* drop zone */}
            <div
                onClick={() => fileRef.current?.click()}
                className={`rounded-xl border-2 border-dashed px-5 py-8 text-center cursor-pointer transition-all duration-200 mb-3 ${fileError
                    ? "border-red-500/40 bg-red-500/[0.03]"
                    : "border-white/[0.1] hover:border-white/25 hover:bg-white/[0.02]"
                    }`}
            >
                <FontAwesomeIcon
                    icon={currentPath ? faRotateRight : faUpload}
                    className="text-xl mb-2"
                    style={{ color: fileError ? "#EF4444" : "rgba(255,255,255,0.2)" }}
                />
                <p className="text-white/50 text-sm">{file ? file.name : "Click to select file"}</p>
                <p className="text-white/20 text-xs mt-1">Any file type · Max 50MB</p>
                {fileError && <p className="text-red-400/80 text-xs mt-2">{fileError}</p>}
            </div>

            <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />

            {uploadError && <p className="text-red-400/80 text-xs mb-3">{uploadError}</p>}

            {/* selected file actions */}
            {file && (
                <div className="flex items-center gap-2 mt-1">
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                        style={{ background: accentColor, boxShadow: `0 0 16px ${accentColor}44` }}
                    >
                        {uploading ? (
                            <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Uploading…</>
                        ) : (
                            <><FontAwesomeIcon icon={faCheck} className="text-xs" /> {currentPath ? "Replace file" : "Upload & complete order"}</>
                        )}
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={uploading}
                        className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/[0.08] text-white/40 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-40"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-sm" />
                    </button>
                </div>
            )}
        </div>
    );
}
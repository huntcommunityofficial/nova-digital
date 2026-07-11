"use client";

import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faReceipt, faUpload, faSpinner, faCheck, faXmark, faClock, faTrash, faEye,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    orderId: number;
    receiptPath: string | null;
    receiptStatus: "pending" | "approved" | "rejected" | null;
    receiptNote: string | null;
    onUploaded: (path: string) => void;
    onDeleted: () => void;
    accentColor?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReceiptUpload({
    orderId,
    receiptPath,
    receiptStatus,
    receiptNote,
    onUploaded,
    onDeleted,
    accentColor = "#3A8CFF",
}: Props) {
    // file selection
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    // upload
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    // delete
    const [deleting, setDeleting] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    // ── file validation ───────────────────────────────────────────────────────
    function handleFileSelect(f: File | null) {
        setFileError(null);
        setFile(null);
        if (!f) return;
        if (!ALLOWED_TYPES.includes(f.type)) {
            setFileError("Only JPG, PNG, and PDF files are accepted.");
            return;
        }
        if (f.size > MAX_SIZE_BYTES) {
            setFileError("File too large. Maximum size is 5 MB.");
            return;
        }
        setFile(f);
    }

    function handleClearSelected() {
        setFile(null);
        setFileError(null);
        if (fileRef.current) fileRef.current.value = "";
    }

    // ── upload ────────────────────────────────────────────────────────────────
    async function handleUpload() {
        if (!file || uploading) return;
        setUploading(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append("receipt", file);

        try {
            const { data } = await api.post<{ receipt_path: string }>(
                `/api/orders/${orderId}/receipt`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            setFile(null);
            if (fileRef.current) fileRef.current.value = "";
            onUploaded(data.receipt_path);
        } catch {
            setUploadError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    }

    // ── delete ────────────────────────────────────────────────────────────────
    async function handleDelete() {
        if (!confirm("Remove your uploaded receipt?")) return;
        setDeleting(true);
        try {
            await api.delete(`/api/orders/${orderId}/receipt`);
            onDeleted();
        } catch {
            // silent — let parent decide
        } finally {
            setDeleting(false);
        }
    }

    // ─── Render states ────────────────────────────────────────────────────────

    // 1 — approved
    if (receiptStatus === "approved") {
        return (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 flex items-center gap-4 mb-8">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/20">
                    <FontAwesomeIcon icon={faCheck} className="text-emerald-400 text-sm" />
                </div>
                <div>
                    <p className="text-white/90 text-sm font-semibold">Payment confirmed</p>
                    <p className="text-white/40 text-xs mt-0.5">Your receipt was approved. Your order is now in progress.</p>
                </div>
            </div>
        );
    }

    // 2 — pending (receipt already uploaded, waiting for admin)
    if (receiptStatus === "pending") {
        const isImage = receiptPath && !receiptPath.endsWith(".pdf");
        const fileUrl = receiptPath ? `${BACKEND_URL}/storage/${receiptPath}` : null;

        return (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 mb-8">
                {/* header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500/20">
                        <FontAwesomeIcon icon={faClock} className="text-amber-400 text-sm" />
                    </div>
                    <div>
                        <p className="text-white/90 text-sm font-semibold">Receipt under review</p>
                        <p className="text-white/40 text-xs mt-0.5">We've received your receipt and will confirm it shortly.</p>
                    </div>
                </div>

                {/* receipt preview */}
                {fileUrl && (
                    <>
                        {isImage ? (
                            <img
                                src={fileUrl}
                                alt="Uploaded receipt"
                                className="w-full max-h-64 object-contain rounded-xl border border-white/[0.07] bg-black/20 mb-3"
                            />
                        ) : (
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs mb-3 text-white/50 hover:text-white/80 transition-colors"
                            >
                                <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                                View uploaded PDF receipt
                            </a>
                        )}
                    </>
                )}

                {/* remove button */}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                    <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                    {deleting ? "Removing…" : "Remove receipt"}
                </button>
            </div>
        );
    }

    // 3 — rejected
    if (receiptStatus === "rejected") {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/20">
                        <FontAwesomeIcon icon={faXmark} className="text-red-400 text-sm" />
                    </div>
                    <div>
                        <p className="text-white/90 text-sm font-semibold">Receipt rejected</p>
                        {receiptNote && <p className="text-red-400/80 text-xs mt-0.5">{receiptNote}</p>}
                    </div>
                </div>
                <UploadArea
                    file={file} fileError={fileError} uploading={uploading} uploadError={uploadError}
                    fileRef={fileRef} accentColor={accentColor}
                    onSelect={handleFileSelect} onUpload={handleUpload} onClear={handleClearSelected}
                    label="Upload a new receipt"
                />
            </div>
        );
    }

    // 4 — default: no receipt yet
    return (
        <div
            className="rounded-2xl border p-6 mb-8"
            style={{ borderColor: `${accentColor}44`, background: `${accentColor}0a` }}
        >
            <div className="flex items-center gap-3 mb-5">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${accentColor}18`, boxShadow: `0 0 12px ${accentColor}33` }}
                >
                    <FontAwesomeIcon icon={faReceipt} className="text-sm" style={{ color: accentColor }} />
                </div>
                <div>
                    <p className="text-white/90 text-sm font-semibold">Upload payment receipt</p>
                    <p className="text-white/40 text-xs mt-0.5">
                        After making the payment, upload your receipt here for verification.
                    </p>
                </div>
            </div>
            <UploadArea
                file={file} fileError={fileError} uploading={uploading} uploadError={uploadError}
                fileRef={fileRef} accentColor={accentColor}
                onSelect={handleFileSelect} onUpload={handleUpload} onClear={handleClearSelected}
                label="Upload receipt"
            />
        </div>
    );
}

// ─── Internal upload area ─────────────────────────────────────────────────────

function UploadArea({
    file, fileError, uploading, uploadError, fileRef, accentColor,
    onSelect, onUpload, onClear, label,
}: {
    file: File | null;
    fileError: string | null;
    uploading: boolean;
    uploadError: string | null;
    fileRef: React.RefObject<HTMLInputElement | null>;
    accentColor: string;
    onSelect: (f: File | null) => void;
    onUpload: () => void;
    onClear: () => void;
    label: string;
}) {
    return (
        <div className="space-y-3">
            {/* drop zone */}
            <div
                onClick={() => fileRef.current?.click()}
                className={`rounded-xl border-2 border-dashed px-5 py-8 text-center cursor-pointer transition-all duration-200 ${fileError
                    ? "border-red-500/40 bg-red-500/[0.03]"
                    : "border-white/[0.1] hover:border-white/25 hover:bg-white/[0.02]"
                    }`}
            >
                <FontAwesomeIcon
                    icon={faUpload}
                    className="text-xl mb-2"
                    style={{ color: fileError ? "#EF4444" : "rgba(255,255,255,0.2)" }}
                />
                <p className="text-white/50 text-sm">{file ? file.name : "Click to select file"}</p>
                <p className="text-white/20 text-xs mt-1">JPG, PNG, PDF · Max 5 MB</p>
                {fileError && <p className="text-red-400/80 text-xs mt-2">{fileError}</p>}
            </div>

            <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
            />
            {file && file.type.startsWith("image/") && (
                <img
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    className="w-full max-h-48 object-contain rounded-xl border border-white/[0.07] bg-black/20"
                />
            )}

            {uploadError && <p className="text-red-400/80 text-xs">{uploadError}</p>}

            {/* selected file actions */}
            {file && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={onUpload}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                        style={{ background: accentColor, boxShadow: `0 0 16px ${accentColor}44` }}
                    >
                        {uploading ? (
                            <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Uploading…</>
                        ) : (
                            <><FontAwesomeIcon icon={faUpload} className="text-xs" /> {label}</>
                        )}
                    </button>
                    <button
                        onClick={onClear}
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
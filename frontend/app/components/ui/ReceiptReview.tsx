"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faReceipt, faCheck, faXmark, faSpinner, faExternalLink,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";

interface Props {
    orderId: number;
    receiptPath: string;
    onReviewed: (newReceiptStatus: "approved" | "rejected", newOrderStatus: string) => void;
    accentColor?: string;
}

export default function ReceiptReview({ orderId, receiptPath, onReviewed }: Props) {
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [action, setAction] = useState<"approve" | "reject" | null>(null);

    const receiptUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${receiptPath}`;

    async function handleReview(act: "approve" | "reject") {
        setSaving(true);
        setAction(act);
        setError(null);
        try {
            const { data } = await api.post(`/api/admin/orders/${orderId}/receipt/review`, {
                action: act,
                note: act === "reject" ? note : undefined,
            });
            onReviewed(act === "approve" ? "approved" : "rejected", data.order.status);
        } catch {
            setError("Failed to submit review. Please try again.");
        } finally {
            setSaving(false);
            setAction(null);
        }
    }

    return (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6 mb-8">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/20">
                    <FontAwesomeIcon icon={faReceipt} className="text-amber-400 text-sm" />
                </div>
                <div>
                    <p className="text-white/90 text-sm font-semibold">Payment receipt submitted</p>
                    <p className="text-white/40 text-xs mt-0.5">Review the receipt and approve or reject it.</p>
                </div>
            </div>

            <a href={receiptUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-sm text-white/70 hover:text-white mb-5 w-fit">
                <FontAwesomeIcon icon={faExternalLink} className="text-xs" />
                View receipt
            </a>

            <div className="mb-4">
                <label className="text-white/30 text-xs uppercase tracking-wider block mb-2">
                    Rejection note <span className="normal-case text-white/20">(optional, only used on reject)</span>
                </label>
                <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Amount doesn't match, unclear image..."
                    className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-red-500/40 transition-all" />
            </div>

            {error && <p className="text-red-400/80 text-xs mb-4">{error}</p>}

            <div className="flex items-center gap-3">
                <button onClick={() => handleReview("reject")} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white/60 border border-white/[0.1] hover:bg-white/[0.04] transition-all disabled:opacity-50">
                    {saving && action === "reject"
                        ? <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                        : <FontAwesomeIcon icon={faXmark} className="text-xs" />}
                    Reject
                </button>
                <button onClick={() => handleReview("approve")} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                    style={{ background: "#10B981", boxShadow: "0 0 16px #10B98144" }}>
                    {saving && action === "approve"
                        ? <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                        : <FontAwesomeIcon icon={faCheck} className="text-xs" />}
                    Approve & start project
                </button>
            </div>
        </div>
    );
}
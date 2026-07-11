"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onConfirmMessage: string;
    onCancel: () => void;
    onCancelMessage:string;
}
export default function ConfirmModal(
    {
        title,
        message,
        onConfirm,
        onConfirmMessage,
        onCancel,
        onCancelMessage,
    }: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-9999" onClick={onCancel}>
            <div className="w-full max-w-md mx-4 rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl p-6 text-white" onClick={(e)=>e.stopPropagation()}>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="mt-3 text-gray-300">{message}</p>
                <div className="flex justify-end gap-3 mt-6">
                <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-white/10 cursor-pointer">{onCancelMessage}</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 cursor-pointer">{onConfirmMessage}</button>
                </div>
            </div>
        </div>, document.body
    );
};
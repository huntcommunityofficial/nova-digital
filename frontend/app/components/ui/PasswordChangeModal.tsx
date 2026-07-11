"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark, faEye, faEyeSlash, faSpinner, faCheck,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

function PasswordInput({
    label, value, onChange, placeholder, error,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string | null;
}) {
    const [show, setShow] = useState(false);

    return (
        <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder ?? "••••••••"}
                    className={`w-full bg-[#13161d] border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/25 focus:outline-none focus:ring-1 transition-all ${error
                            ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20"
                            : "border-white/[0.07] focus:border-[#3A8CFF]/50 focus:ring-[#3A8CFF]/30"
                        }`}
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                    <FontAwesomeIcon icon={show ? faEyeSlash : faEye} className="text-sm" />
                </button>
            </div>
            {error && <p className="text-red-500/70 text-xs mt-1">{error}</p>}
        </div>
    );
}

export default function PasswordChangeModal({ onClose, onSuccess }: Props) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [errors, setErrors] = useState<{
        current_password?: string;
        password?: string;
        confirm?: string;
        general?: string;
    }>({});

    function validate(): boolean {
        const e: typeof errors = {};

        if (!currentPassword) e.current_password = "Current password is required.";
        if (!newPassword) e.password = "New password is required.";
        else if (newPassword.length < 8) e.password = "Password must be at least 8 characters.";

        if (!confirmPassword) e.confirm = "Please confirm your new password.";
        else if (newPassword !== confirmPassword) e.confirm = "Passwords do not match.";

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit() {
        if (!validate() || saving) return;

        setSaving(true);
        setErrors({});

        try {
            await api.patch("/api/user/password", {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });

            setSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: unknown) {
            const data = (err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } })
                ?.response?.data;

            if (data?.errors?.current_password) {
                setErrors({ current_password: data.errors.current_password[0] });
            } else if (data?.message) {
                setErrors({ general: data.message });
            } else {
                setErrors({ general: "Something went wrong. Please try again." });
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal */}
            <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111520] overflow-hidden shadow-[0_0_60px_rgba(58,140,255,0.15)]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
                    <h2 className="text-white font-bold text-lg">Change Password</h2>
                    <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-4">
                    {errors.general && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
                            {errors.general}
                        </div>
                    )}

                    {success && (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-400 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCheck} className="text-xs" />
                            Password changed successfully!
                        </div>
                    )}

                    <PasswordInput
                        label="Current password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        error={errors.current_password}
                    />
                    <PasswordInput
                        label="New password"
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="Min. 8 characters"
                        error={errors.password}
                    />
                    <PasswordInput
                        label="Confirm new password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        error={errors.confirm}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-5 border-t border-white/[0.06]">
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white/70 transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || success}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50"
                        style={{ background: "#3A8CFF", boxShadow: "0 0 20px #3A8CFF44" }}
                    >
                        {saving
                            ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Saving...</>
                            : "Change Password"}
                    </button>
                </div>
            </div>
        </div>
    );
}
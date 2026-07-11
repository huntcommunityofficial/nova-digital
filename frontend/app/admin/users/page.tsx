"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner, faShieldHalved, faUser, faPen, faTrash,
    faCheck, faXmark, faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { useAdminGuard } from "@/app/hooks/useAdminGuard";
import api from "@/app/lib/api";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: "user" | "admin";
    created_at: string;
}

interface EditState {
    id: number;
    name: string;
    email: string;
    role: "user" | "admin";
    password: string;
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
    const guard = useAdminGuard();

    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");

    const [editing, setEditing] = useState<EditState | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        if (guard !== "authorized") return;
        api.get<UserItem[]>("/api/admin/users")
            .then(({ data }) => setUsers(data))
            .catch(() => setError("Failed to load users."))
            .finally(() => setLoading(false));
    }, [guard]);

    if (guard === "loading") return null;
    if (guard === "unauthorized") notFound();

    // ── Filtering ─────────────────────────────────────────────────────────────

    const filtered = users.filter((u) => {
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        const matchSearch = search === "" ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    // ── Edit ──────────────────────────────────────────────────────────────────

    function startEdit(u: UserItem) {
        setEditing({ id: u.id, name: u.name, email: u.email, role: u.role, password: "" });
        setSaveError(null);
    }

    function cancelEdit() {
        setEditing(null);
        setSaveError(null);
    }

    async function handleSave() {
        if (!editing || saving) return;
        setSaving(true);
        setSaveError(null);
        try {
            const { data } = await api.patch<{ user: UserItem }>(`/api/admin/users/${editing.id}`, {
                name: editing.name,
                email: editing.email,
                role: editing.role,
                password: editing.password || undefined,
            });
            setUsers((prev) => prev.map((u) => u.id === editing.id ? { ...u, ...data.user } : u));
            setEditing(null);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setSaveError(msg ?? "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    }

    // ── Delete ────────────────────────────────────────────────────────────────

    async function handleDelete() {
        if (deleteId === null || deleting) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            await api.delete(`/api/admin/users/${deleteId}`);
            setUsers((prev) => prev.filter((u) => u.id !== deleteId));
            setDeleteId(null);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setDeleteError(msg ?? "Failed to delete user.");
            setDeleteId(null);
        } finally {
            setDeleting(false);
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

            {deleteId !== null && (
                <ConfirmModal
                    title="Delete user"
                    message="This will permanently delete the user account and all associated data. This cannot be undone."
                    onConfirm={handleDelete}
                    onConfirmMessage={deleting ? "Deleting..." : "Delete"}
                    onCancel={() => setDeleteId(null)}
                    onCancelMessage="Cancel"
                />
            )}

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Users</h1>
                    <p className="text-white/40 text-sm mt-1">
                        Manage accounts and roles.
                        <span className="ml-2 text-white/25">{users.length} total</span>
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <FontAwesomeIcon icon={faSearch}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 text-xs" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full bg-[#13161d] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#3A8CFF]/40 transition-all"
                        />
                    </div>

                    {/* Role filter */}
                    <div className="flex gap-2">
                        {(["all", "user", "admin"] as const).map((r) => (
                            <button key={r} onClick={() => setRoleFilter(r)}
                                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-200 capitalize ${roleFilter === r
                                    ? "border-[#3A8CFF]/40 text-white bg-[#3A8CFF]/10"
                                    : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/70"
                                    }`}>
                                {r}
                                <span className="ml-1.5 text-white/25">
                                    ({r === "all" ? users.length : users.filter((u) => u.role === r).length})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {(error || deleteError) && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 mb-6 text-sm text-red-400">
                        {error || deleteError}
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-xl animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.07] bg-[#111520] py-14 text-center text-white/30 text-sm">
                        No users found.
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/[0.07] bg-[#111520] overflow-hidden">
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/[0.06]">
                                        {["User", "Role", "Joined", "Actions"].map((h) => (
                                            <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u) => {
                                        const isEditing = editing?.id === u.id;
                                        return (
                                            <tr key={u.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors">

                                                {/* User */}
                                                <td className="px-5 py-4">
                                                    {isEditing ? (
                                                        <div className="space-y-1.5">
                                                            <input
                                                                value={editing.name}
                                                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                                                className="w-full bg-[#1a1d26] border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#3A8CFF]/50"
                                                            />
                                                            <input
                                                                value={editing.email}
                                                                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                                                                className="w-full bg-[#1a1d26] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-[#3A8CFF]/50"
                                                            />
                                                            <input
                                                                type="password"
                                                                value={editing.password}
                                                                onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                                                                placeholder="New password (leave blank to keep)"
                                                                className="w-full bg-[#1a1d26] border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-[#3A8CFF]/50"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                                                style={{ background: u.role === "admin" ? "rgba(239,68,68,0.15)" : "rgba(58,140,255,0.15)" }}>
                                                                <span style={{ color: u.role === "admin" ? "#ef4444" : "#3A8CFF" }}>
                                                                    {u.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-white/90 font-medium">{u.name}</p>
                                                                <p className="text-white/35 text-xs">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Role */}
                                                <td className="px-5 py-4">
                                                    {isEditing ? (
                                                        <div className="flex gap-2">
                                                            {(["user", "admin"] as const).map((r) => (
                                                                <button key={r} type="button"
                                                                    onClick={() => setEditing({ ...editing, role: r })}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${editing.role === r
                                                                        ? r === "admin"
                                                                            ? "border-red-500/40 bg-red-500/10 text-red-400"
                                                                            : "border-[#3A8CFF]/40 bg-[#3A8CFF]/10 text-[#3A8CFF]"
                                                                        : "border-white/[0.08] text-white/35 hover:border-white/20"
                                                                        }`}>
                                                                    <FontAwesomeIcon icon={r === "admin" ? faShieldHalved : faUser} className="text-[10px]" />
                                                                    {r}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.role === "admin"
                                                            ? "bg-red-500/15 text-red-400"
                                                            : "bg-[#3A8CFF]/15 text-[#3A8CFF]"
                                                            }`}>
                                                            <FontAwesomeIcon icon={u.role === "admin" ? faShieldHalved : faUser} className="text-[9px]" />
                                                            {u.role}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Joined */}
                                                <td className="px-5 py-4 text-white/35 text-xs">{fmtDate(u.created_at)}</td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            {saveError && (
                                                                <span className="text-red-400/80 text-xs">{saveError}</span>
                                                            )}
                                                            <button onClick={handleSave} disabled={saving}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white font-medium bg-[#3A8CFF] disabled:opacity-50 transition-all">
                                                                {saving
                                                                    ? <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" />
                                                                    : <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                                                                Save
                                                            </button>
                                                            <button onClick={cancelEdit}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all">
                                                                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => startEdit(u)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/[0.07] hover:text-white hover:border-white/20 transition-all">
                                                                <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                                                                Edit
                                                            </button>
                                                            <button onClick={() => setDeleteId(u.id)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/[0.07] hover:text-red-400 hover:border-red-500/30 transition-all">
                                                                <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-white/[0.04]">
                            {filtered.map((u) => {
                                const isEditing = editing?.id === u.id;
                                return (
                                    <div key={u.id} className="p-5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                                    style={{ background: u.role === "admin" ? "rgba(239,68,68,0.15)" : "rgba(58,140,255,0.15)" }}>
                                                    <span style={{ color: u.role === "admin" ? "#ef4444" : "#3A8CFF" }}>
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white/90 text-sm font-medium">{u.name}</p>
                                                    <p className="text-white/35 text-xs">{u.email}</p>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${u.role === "admin" ? "bg-red-500/15 text-red-400" : "bg-[#3A8CFF]/15 text-[#3A8CFF]"
                                                }`}>
                                                <FontAwesomeIcon icon={u.role === "admin" ? faShieldHalved : faUser} className="text-[8px]" />
                                                {u.role}
                                            </span>
                                        </div>

                                        {isEditing ? (
                                            <div className="space-y-2 mt-3">
                                                <input value={editing.name}
                                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                                    className="w-full bg-[#1a1d26] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none" />
                                                <input value={editing.email}
                                                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                                                    className="w-full bg-[#1a1d26] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none" />
                                                <input
                                                    type="password"
                                                    value={editing.password}
                                                    onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                                                    placeholder="New password (leave blank to keep)"
                                                    className="w-full bg-[#1a1d26] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white/70 focus:outline-none"
                                                />
                                                <div className="flex gap-2">
                                                    {(["user", "admin"] as const).map((r) => (
                                                        <button key={r} onClick={() => setEditing({ ...editing, role: r })}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border flex-1 justify-center transition-all ${editing.role === r
                                                                ? r === "admin"
                                                                    ? "border-red-500/40 bg-red-500/10 text-red-400"
                                                                    : "border-[#3A8CFF]/40 bg-[#3A8CFF]/10 text-[#3A8CFF]"
                                                                : "border-white/[0.08] text-white/35"
                                                                }`}>
                                                            <FontAwesomeIcon icon={r === "admin" ? faShieldHalved : faUser} className="text-[10px]" />
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                                {saveError && <p className="text-red-400/80 text-xs">{saveError}</p>}
                                                <div className="flex gap-2">
                                                    <button onClick={handleSave} disabled={saving}
                                                        className="flex-1 py-2 rounded-lg text-xs text-white font-medium bg-[#3A8CFF] disabled:opacity-50">
                                                        {saving ? "Saving..." : "Save changes"}
                                                    </button>
                                                    <button onClick={cancelEdit}
                                                        className="flex-1 py-2 rounded-lg text-xs text-white/50 border border-white/[0.08]">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-white/25 text-[11px]">Joined {fmtDate(u.created_at)}</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => startEdit(u)}
                                                        className="px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/[0.07] hover:text-white transition-all">
                                                        <FontAwesomeIcon icon={faPen} className="text-[10px] mr-1" />Edit
                                                    </button>
                                                    <button onClick={() => setDeleteId(u.id)}
                                                        className="px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/[0.07] hover:text-red-400 hover:border-red-500/30 transition-all">
                                                        <FontAwesomeIcon icon={faTrash} className="text-[10px] mr-1" />Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
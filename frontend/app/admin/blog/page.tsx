"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus, faTrash, faPen, faSpinner, faEye,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: number;
  title: string;
  min_content: string;
  max_content: string;
  image: string | null;
  created_at: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

function imageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}/storage/${path}`;
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get<{ data: BlogPost[] }>("/api/admin/blog/index")
      .then(({ data }) => setPosts(data.data))
      .catch(() => setError("Failed to load blog posts."))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete() {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/blog/destroy/${deleteId}`);
      setPosts((prev) => prev.filter((p) => p.id !== deleteId));
    } catch {
      setError("Failed to delete post.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: `
          radial-gradient(circle at 15% 20%, #3A8CFF10 0%, transparent 50%),
          radial-gradient(circle at 85% 80%, #8E4BFF0D 0%, transparent 50%)
        ` }} />

      {deleteId !== null && (
        <ConfirmModal
          title="Delete post"
          message="This will permanently delete the blog post and its cover image. This action cannot be undone."
          onConfirm={handleDelete}
          onConfirmMessage={deleting ? "Deleting..." : "Delete"}
          onCancel={() => setDeleteId(null)}
          onCancelMessage="Cancel"
        />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Blog posts</h1>
            <p className="text-white/40 text-sm mt-1">Manage all published and draft articles.</p>
          </div>
          <Link href="/admin/blog/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:opacity-90 hover:scale-[1.01]"
            style={{ background: "#3A8CFF", boxShadow: "0 0 20px #3A8CFF44" }}>
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            New post
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 mb-6 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="text-white/30 text-2xl animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.07] bg-[#111520] py-16 text-center">
            <p className="text-white/30 text-sm mb-4">No blog posts yet.</p>
            <Link href="/admin/blog/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#3A8CFF", boxShadow: "0 0 16px #3A8CFF44" }}>
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#111520] divide-y divide-white/[0.04] overflow-hidden">
            {posts.map((post) => {
              const thumb = imageUrl(post.image);
              return (
                <div key={post.id}
                  className="flex items-center gap-5 px-5 py-4 hover:bg-white/[0.02] transition-colors">

                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white/[0.04] border border-white/[0.06]">
                    {thumb ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={thumb}
                          alt={post.title}
                          fill
                          unoptimized 
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/15 text-xs">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/90 font-medium text-sm truncate">{post.title}</p>
                    <p className="text-white/35 text-xs mt-0.5 line-clamp-1">{post.min_content}</p>
                    <p className="text-white/20 text-xs mt-0.5">{fmtDate(post.created_at)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/admin/blog/${post.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/[0.08] hover:text-white hover:border-white/20 transition-all">
                      <FontAwesomeIcon icon={faEye} className="text-[10px]" />
                      View
                    </Link>
                    <Link href={`/admin/blog/edit/${post.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/[0.08] hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                      <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/50 border border-white/[0.08] hover:text-red-400 hover:border-red-500/30 transition-all">
                      <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
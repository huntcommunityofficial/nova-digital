"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Blog {
  id: number;
  title: string;
  min_content: string;
  image: string | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

function imageUrl(path: string | null): string {
  if (!path) return "/images/blog.png";
  // If it's already a full URL, return as-is
  if (path.startsWith("http")) return path;
  return `${BACKEND_URL}/storage/${path}`;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#1b1e24]/70 border border-white/10 overflow-hidden animate-pulse">
      <div className="h-56 bg-white/[0.05]" />
      <div className="p-8 space-y-3">
        <div className="h-4 bg-white/[0.07] rounded w-3/4" />
        <div className="h-3 bg-white/[0.05] rounded w-full" />
        <div className="h-3 bg-white/[0.05] rounded w-5/6" />
        <div className="h-3 bg-white/[0.04] rounded w-16 mt-6" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BlogsSection() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get<{ data: Blog[] }>("/api/admin/blog/index")
      .then(({ data }) => {
        // Take only the 3 most recent (backend already orders by created_at desc)
        setBlogs(data.data.slice(0, 3));
      })
      .catch(() => {
        // On failure, fall back to empty — no crash, section just won't show cards
        setBlogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative py-28 overflow-hidden">

      {/* Aurora Background */}
      <div
        className="absolute inset-0 blur-[120px] opacity-60 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 25%, #3A8CFF33 0%, transparent 60%),
            radial-gradient(circle at 80% 75%, #8E4BFF33 0%, transparent 60%)
          `,
        }}
      />

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Latest Insights</h2>
          <p className="text-muted-custom text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            Explore our articles on design, development, branding and digital growth.
          </p>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : blogs.length === 0 ? (
            <p className="col-span-3 text-center text-white/30 text-sm py-10">
              No articles yet.
            </p>
          ) : (
            blogs.map((blog, idx) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                onClick={() => router.push(`/blogs/${blog.id}`)}
                className="group relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-white/5 cursor-pointer"
              >
                <div className="rounded-2xl bg-[#1b1e24]/70 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_35px_-10px_rgba(255,255,255,0.35)]">

                  {/* Image */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/20 opacity-40 blur-xl" />
                    <Image
                      src={imageUrl(blog.image)}
                      alt={blog.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Text */}
                  <div className="p-8">
                    <h3 className="text-white text-2xl font-semibold mb-3">
                      {blog.title}
                    </h3>

                    <p className="text-muted-custom leading-relaxed mb-6 line-clamp-3">
                      {blog.min_content}
                    </p>

                    <Link href={`/blogs/${blog.id}`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Read More →
                    </Link>
                  </div>

                </div>
              </motion.div>
            ))
          )}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white border border-white/[0.1] hover:border-[#3A8CFF]/40 hover:bg-[#3A8CFF]/10 transition-all duration-300"
          >
            View All Articles →
          </Link>
        </div>

      </div>
    </section>
  );
}
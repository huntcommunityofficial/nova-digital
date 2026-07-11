"use client";

import { motion } from "framer-motion";
import Link from "next/link";


export default function CTASection() {
  return (
    <section className="relative py-32 overflow-hidden">

      {/* Aurora Background */}
      <div
        className="absolute inset-0 blur-[120px] opacity-60 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 20%, #3A8CFF33 0%, transparent 60%),
            radial-gradient(circle at 75% 80%, #8E4BFF33 0%, transparent 60%)
          `,
        }}
      />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-6">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white"
        >
          Ready to Build Something Extraordinary?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-muted-custom text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed"
        >
          Whether you need a high‑performance website, a powerful brand identity,
          or a full digital growth strategy — we’re here to bring your vision to life.
        </motion.p>

        {/* Glass CTA Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-14 relative p-[2px] rounded-3xl bg-gradient-to-br from-white/10 to-white/5 mx-auto max-w-xl"
        >
          <div className="rounded-3xl bg-[#1b1e24]/70 backdrop-blur-xl border border-white/10 p-10">

            <h3 className="text-white text-2xl font-semibold mb-4">
              Let’s Talk About Your Project
            </h3>

            <p className="text-muted-custom mb-8">
              Get a free consultation with our experts — no obligations.
            </p>

            <Link
              href="/#contact"
              className="inline-block px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-lg font-medium transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)]"
            >
              Contact Us
            </Link>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

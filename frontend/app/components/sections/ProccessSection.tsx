"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Discovery",
    desc: "We deeply understand your goals, audience, and market to craft a strategic foundation.",
  },
  {
    number: "02",
    title: "Strategy",
    desc: "We design a tailored roadmap that aligns design, technology, and growth.",
  },
  {
    number: "03",
    title: "Execution",
    desc: "Our team builds high‑performance solutions with precision and attention to detail.",
  },
  {
    number: "04",
    title: "Launch & Scale",
    desc: "We optimize, analyze, and scale your digital presence for sustainable future growth.",
  },
];

export default function ProcessSection() {
  return (
    <section className="relative py-28 overflow-hidden">

      {/* Aurora continuation */}
      <div
        className="absolute inset-0 blur-[120px] opacity-60 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, #3A8CFF33 0%, transparent 60%),
            radial-gradient(circle at 70% 80%, #8E4BFF33 0%, transparent 60%)
          `,
        }}
      />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none" />

      <div className="relative z-10 w-[90%] mx-auto max-w-7xl">

        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Our Process
          </h2>
          <p className="text-muted-custom text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            A structured approach designed to transform ideas into scalable digital success.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-white/5">
                
                {/* Inner Card */}
                <div className="rounded-2xl bg-[#1b1e24]/70 backdrop-blur-xl p-8 h-full border border-white/10 shadow-xl transition-all duration-500 group-hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">

                  {/* Step Number Glow */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 blur-2xl opacity-50 bg-blue-500/30 rounded-full" />
                    <span className="relative text-4xl font-bold text-white/90">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-white text-2xl font-bold">
                    {step.title}
                  </h3>

                  <p className="text-muted-custom mt-4 text-lg leading-relaxed">
                    {step.desc}
                  </p>

                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

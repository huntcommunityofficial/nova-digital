"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faShieldAlt,
  faUsers,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const reasons = [
  {
    icon: faRocket,
    title: "Performance First",
    desc: "Every product we build is optimized for speed, scalability, and flawless user experience.",
  },
  {
    icon: faShieldAlt,
    title: "Reliable Technology",
    desc: "We use modern, proven technologies to build secure and future‑proof digital solutions.",
  },
  {
    icon: faUsers,
    title: "Client Focused",
    desc: "Your success drives every decision we make throughout the entire project lifecycle.",
  },
  {
    icon: faChartLine,
    title: "Growth Driven",
    desc: "Our strategies are designed to not just launch products — but help businesses grow.",
  },
];

export default function WhyUsSection() {
  return (
    <section className="relative py-28 overflow-hidden">

      {/* Aurora background (matching other sections) */}
      <div
        className="absolute inset-0 blur-[120px] opacity-60 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 25%, #3A8CFF33 0%, transparent 60%),
            radial-gradient(circle at 80% 75%, #8E4BFF33 0%, transparent 60%)
          `,
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Why Choose Us
          </h2>

          <p className="text-muted-custom text-lg md:text-xl mt-4 max-w-2xl mx-auto">
            We combine strategy, design, and technology to deliver digital
            solutions that drive measurable results.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {reasons.map((item, index) => (
            <div
              key={index}
              className="group relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-white/5"
            >
              <div className="h-full rounded-2xl bg-[#1b1e24]/70 backdrop-blur-xl border border-white/10 p-8 transition-all duration-500 group-hover:shadow-[0_0_35px_-10px_rgba(255,255,255,0.35)]">

                {/* Icon */}
                <div className="relative w-14 h-14 flex items-center justify-center rounded-xl mb-6 bg-white/5 border border-white/10">

                  <div className="absolute inset-0 blur-xl opacity-50 bg-blue-500/30 rounded-xl" />

                  <FontAwesomeIcon
                    icon={item.icon}
                    className="text-white text-xl relative"
                  />
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {item.title}
                </h3>

                <p className="text-muted-custom mt-3 leading-relaxed">
                  {item.desc}
                </p>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

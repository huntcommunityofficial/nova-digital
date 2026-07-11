"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullhorn,
  faChartLine,
  faCode,
  faMagnifyingGlassChart,
  faMobileAlt,
  faPalette,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { useRef, useEffect } from "react";
import Link from "next/link";

const services = [
  {
    icon: faCode,
    color: "#3A8CFF",
    title: "Web Design",
    desc: "Award-winning modern UI/UX designs crafted to convert users with elegance and clarity.",
    link: "/services/web-design",
  },
  {
    icon: faRobot,
    color: "#8E4BFF",
    title: "AI Automation",
    desc: "AI-powered workflows, chatbots, business automation, and smart integrations that save time and increase productivity.",
    link: "/services/ai-automation",
  },
  {
    icon: faPalette,
    color: "#FF2EC4",
    title: "Brand Identity",
    desc: "Professional branding, logo design, and visual identity that make your business stand out.",
    link: "/services/brand-identity",
  },
  {
    icon: faMagnifyingGlassChart,
    color: "#2EEBFF",
    title: "SEO",
    desc: "Boost your website's visibility with technical SEO and performance optimization.",
    link: "/services/seo",
  },
];

export default function ServicesSection() {
  return (
    <section className="relative py-32 overflow-hidden" id="services">

      {/* HERO-MATCHED AURORA BACKGROUND */}
      <div
        className="absolute inset-0 blur-[140px] opacity-60 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, #3A8CFF55 0%, transparent 55%),
            radial-gradient(circle at 80% 70%, #FF2EC455 0%, transparent 55%),
            radial-gradient(circle at 40% 90%, #2EEBFF55 0%, transparent 60%)
          `,
        }}
      />

      {/* HERO-MATCHED SOFT GRID TEXTURE */}
      <div className="absolute inset-0 opacity-[0.06] bg-[url('/grid.svg')] bg-center pointer-events-none" />

      {/* HERO-STYLED FLOATING PARTICLES */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[url('/particles.svg')] bg-cover bg-center animate-pulse" />

      {/* CURSOR GLOW (SYNCED WITH HERO) */}
      <div
        id="services-cursor"
        className="pointer-events-none fixed w-72 h-72 rounded-full blur-[120px] bg-cyan-400/10 mix-blend-overlay -translate-x-1/2 -translate-y-1/2 z-0"
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('mousemove', e => {
              const el = document.getElementById('services-cursor')
              if (!el) return
              el.style.left = e.clientX + 'px'
              el.style.top = e.clientY + 'px'
            })
          `,
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 text-center w-[90%] mx-auto max-w-7xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-xl">
          Our Services
        </h1>
        <p className="text-muted-custom text-lg md:text-xl mt-4 max-w-2xl mx-auto">
          Premium solutions crafted with precision, strategy, and world‑class
          quality.
        </p>
      </div>

      {/* SERVICES GRID – UNTOUCHED DESIGN */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-[90%] mx-auto mt-20 max-w-8xl">
        {services.map((service, i) => {
          const cardRef = useRef(null);

          return (
            <div
              key={i}
              ref={cardRef}
              className="group relative p-0.5 rounded-2xl transition-all duration-300 hover:scale-[1.07]"
              style={{
                background: `linear-gradient(135deg, ${service.color}, transparent 60%)`,
              }}
            >
              {/* INNER CARD */}
              <div className="rounded-2xl bg-[#1b1e24]/70 backdrop-blur-xl p-8 h-full border border-white/10 shadow-xl group-hover:shadow-[0_0_45px_-10px_rgba(255,255,255,0.25)] transition-all duration-500 pb-18">

                {/* ICON */}
                <div
                  className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: `${service.color}22`,
                    boxShadow: `0 0 25px ${service.color}55`,
                  }}
                >
                  <FontAwesomeIcon
                    icon={service.icon}
                    className="text-4xl"
                    style={{ color: service.color }}
                  />
                </div>

                <h3 className="text-white text-xl md:text-2xl font-bold">
                  {service.title}
                </h3>

                <p className="text-muted-custom text-base lg:text-[17px] mt-4 leading-relaxed">
                  {service.desc}
                </p>

                <Link
                  href={service.link}
                  className="absolute bottom-3 start-4 mx-auto w-[90%] block py-2.5 font-bold rounded-xl text-white text-center transition-all duration-300"
                  style={{
                    background: service.color,
                    boxShadow: `0 0 25px ${service.color}55`,
                  }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          );
        })}

          <div className=" text-center mt-5 mx-auto w-full col-span-full">
            <Link href="/services"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-medium text-white/50 border border-white/[0.08] hover:border-white/20 hover:text-white/70 transition-all duration-300 bg-black/30">
              View all services →
            </Link>
          </div>

      </div>
    </section>
  );
}
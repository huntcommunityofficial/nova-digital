"use client";

import Image from "next/image";
import AboutImage from "@/public/images/about.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StatCard from "@/app/components/ui/StatCard";

import {
  faBullseye,
  faEye,
  faHeadset,
  faHeart,
  faProjectDiagram,
  faUsers,
  faUserSecret,
} from "@fortawesome/free-solid-svg-icons";

export default function AboutSection() {
  return (
    <section
      id="aboutUs"
      className="relative overflow-hidden py-28 px-6 lg:px-8"
    >
      {/* Aurora Background */}
      <div
        className="absolute inset-0 blur-[120px] opacity-60 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 30%, #3A8CFF33 0%, transparent 60%),
            radial-gradient(circle at 75% 70%, #8E4BFF33 0%, transparent 60%)
          `,
        }}
      />

      {/* Subtle Grid */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* 1 — HEADER */}
        <div className="text-center text-white mb-20">
          <h1 className="text-4xl md:text-5xl font-bold">Our Story</h1>

          <p className="text-muted-custom text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">
            We’re Nova Digital, passionate about building powerful digital
            experiences through innovative web design, development, and
            strategic marketing.
          </p>
        </div>

        {/* 2 — IMAGE + TEXT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-24">

          {/* Image */}
          <div className="flex justify-center">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-white/5">
              <div className="rounded-2xl overflow-hidden bg-[#1b1e24]/70 backdrop-blur-xl border border-white/10">
                <Image
                  src={AboutImage}
                  alt="About Nova Digital"
                  priority
                  className="w-sm max-w-md lg:max-w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
              Who We Are
            </h2>

            <p className="text-muted-custom text-lg leading-relaxed">
              Nova Digital is a creative digital studio focused on crafting
              powerful online experiences. We specialize in building
              high‑performance websites, modern user interfaces, and marketing
              strategies that help brands grow and stand out in the digital
              world.
            </p>
          </div>
        </div>

        {/* 3 — MISSION / VISION / VALUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">

          {[
            {
              icon: faBullseye,
              title: "Our Mission",
              desc: "Deliver reliable and user‑centered digital solutions that empower businesses to grow online.",
            },
            {
              icon: faEye,
              title: "Our Vision",
              desc: "Create digital experiences that inspire users, strengthen brands, and drive meaningful results.",
            },
            {
              icon: faHeart,
              title: "Our Values",
              desc: "Innovation, empathy, and craftsmanship guide every project we build.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-white/5"
            >
              <div className="h-full rounded-2xl bg-[#1b1e24]/70 backdrop-blur-xl border border-white/10 p-8 text-center transition-all duration-500 group-hover:shadow-[0_0_35px_-10px_rgba(255,255,255,0.35)]">

                <div className="relative w-16 h-16 flex items-center justify-center mx-auto mb-6 rounded-xl bg-white/5 border border-white/10">
                  <div className="absolute inset-0 blur-xl opacity-40 bg-blue-500/30 rounded-xl" />

                  <FontAwesomeIcon
                    icon={item.icon}
                    className="text-white text-2xl relative"
                  />
                </div>

                <h3 className="text-white text-xl font-semibold mb-3">
                  {item.title}
                </h3>

                <p className="text-muted-custom leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 4 — STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">

          <StatCard icon={faUsers} end={500} label="Happy Clients" />
          <StatCard icon={faHeadset} end={1000} label="Support Tickets" />
          <StatCard icon={faUserSecret} end={50} label="Expert Members" />
          <StatCard icon={faProjectDiagram} end={150} label="Projects Completed" />

        </div>

        {/* 5 — CTA */}
        <div className="flex justify-center">
          <button className="btn-primary-custom px-8 py-3 rounded-full text-lg font-medium hover:scale-105 transition-transform">
            Contact Us
          </button>
        </div>

      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import HeroImage from "@/public/images/Hero.png";
import Link from "next/link";

export default function Hero() {
  const imageRef = useRef<HTMLDivElement>(null);

  // subtle parallax
  useEffect(() => {
    const el = imageRef.current;
    if (!el) return;

    const move = (e: MouseEvent) => {
      const x = (window.innerWidth / 2 - e.clientX) / 60;
      const y = (window.innerHeight / 2 - e.clientY) / 60;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };

    window.addEventListener("mousemove", move);

    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <section id="hero" className="relative overflow-hidden py-28">

      {/* Matched Aurora Background */}
      <div
        className="absolute inset-0 blur-[120px] opacity-60 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 30%, #3A8CFF33 0%, transparent 60%),
            radial-gradient(circle at 75% 70%, #8E4BFF33 0%, transparent 60%)
          `,
        }}
      />

      {/* Matched subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.04] bg-[url('/grid.svg')] bg-center pointer-events-none" />

      {/* Cursor glow */}
      <div
        id="hero-cursor"
        className="pointer-events-none fixed w-72 h-72 rounded-full blur-[120px] bg-cyan-400/10 mix-blend-overlay -translate-x-1/2 -translate-y-1/2 z-0"
      />

      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.addEventListener('mousemove', e=>{
            const el=document.getElementById('hero-cursor')
            if(el){
              el.style.left=e.clientX+'px'
              el.style.top=e.clientY+'px'
            }
          })
        `,
        }}
      />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center w-[90%] mx-auto max-w-7xl gap-12">

        {/* IMAGE */}
        <div className="flex justify-center">
          <div
            ref={imageRef}
            className="relative transition-transform duration-300"
          >
            <div
              className="absolute inset-0 blur-[80px] opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(58,140,255,0.5) 0%, transparent 60%)",
              }}
            />

            <Image
              src={HeroImage}
              alt="Hero image"
              priority
              className="relative w-72 md:w-[380px] lg:w-[420px] rounded-xl shadow-[0_0_60px_rgba(0,140,255,0.25)]"
            />
          </div>
        </div>

        {/* TEXT */}
        <div className="text-white text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="text-white/90">Empowering your</span>
            <br />
            <span className="text-white/90">digital journey</span>
          </h1>

          <h2
            className="
              mt-2 text-3xl md:text-4xl font-bold 
              text-transparent bg-clip-text
              bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400
              animate-[gradientMove_6s_linear_infinite]
            "
          >
            from idea to execution
          </h2>

          <p className="text-muted-custom mt-6 text-lg max-w-lg mx-auto md:mx-0">
            We craft websites, apps, and marketing experiences that drive
            growth, elevate brands, and build trust with your audience.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              className="
                px-6 py-3 rounded-lg font-semibold
                bg-gradient-to-r from-blue-500 to-cyan-400
                shadow-[0_0_25px_rgba(0,200,255,0.5)]
                transition hover:scale-105
              " href="#aboutUs"
            >
              Learn More
            </a>

            <Link
              className="
                px-6 py-3 rounded-lg font-semibold
                border border-white/20
                backdrop-blur-md
                bg-white/5
                hover:bg-white/10
                transition
              " href="/services"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

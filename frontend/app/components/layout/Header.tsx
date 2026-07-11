"use client";

import DesktopHeader from "./DesktopHeader";
import MobileHeader from "./MobileHeader";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const hiddenPages = [
    "/services/web-design/order",
    "/services/ai-automation/order",
    "/services/brand-identity/order",
    "/services/seo/order",
  ];

  if (hiddenPages.includes(pathname) || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="fixed top-4 left-0 w-full z-999 px-4 sm:px-6 lg:px-8">

      <nav
        className="
          relative max-w-6xl mx-auto flex items-center justify-between px-6 py-3

          /* Glass */
          bg-[#0f1115]/60 backdrop-blur-xl

          /* Border + glow */
          border border-white/60 rounded-2xl md:rounded-3xl
          shadow-[0_0_25px_-5px_rgba(0,136,255,0.4)]

          /* Smooth */
          transition-all duration-300
        "
      >

        {/* AURORA BACKLIGHT */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-blue-500/20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[180px] h-[180px] bg-purple-500/20 blur-[120px]" />
        </div>

        {/* Desktop */}
        <div className="hidden md:flex w-full relative z-20">
          <DesktopHeader />
        </div>

        {/* Mobile */}
        <div className="flex md:hidden w-full relative z-20">
          <MobileHeader />
        </div>

      </nav>
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars, faTimes, faUser, faShieldHalved,
  faBoxOpen, faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import api from "@/app/lib/api";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import Link from "next/link";

interface UserData {
  name: string;
  role?: string;
}

export default function MobileHeader() {
  const [user, setUser] = useState<UserData | null>(null);
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
      window.location.href = "/";
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    api.get("/api/user")
      .then(res => {
        setUser(res.data);
        setUserName(res.data.name)
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {showLogoutModal && (
        <ConfirmModal
          title="Logout"
          message="Are you sure you want to logout?"
          onConfirm={handleLogout}
          onConfirmMessage="Logout"
          onCancel={() => setShowLogoutModal(false)}
          onCancelMessage="Cancel"
        />
      )}

      <div className="flex items-center justify-between w-full">
        <a href="/" className="text-xl font-extrabold text-white tracking-tight">
          Nova Digital
        </a>

        <div className="flex items-center gap-2">
          {/* Admin shortcut, icon-only on mobile bar */}
          {isAdmin && (
            <Link
              href="/admin"
              className="
                flex items-center justify-center w-9 h-9 rounded-lg
                bg-red-600/40 border border-red-500/60
                shadow-[0_0_12px_rgba(239,68,68,0.4)]
                hover:bg-red-600/60 transition-all duration-300
              "
            >
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm text-white" />
            </Link>
          )}

          <button onClick={() => setIsOpen(!isOpen)} className="text-white z-50 w-9 h-9 flex items-center justify-center">
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} size="lg" />
          </button>
        </div>
      </div>

      {/* Portal */}
      {mounted &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              onClick={() => setIsOpen(false)}
              className={`
                fixed inset-0 bg-black/60 backdrop-blur-sm z-40 
                transition-opacity duration-300 
                ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"} md:hidden
              `}
            />

            {/* Drawer */}
            <div
              className={`
                fixed top-0 left-0 h-screen w-[80%] max-w-sm
                bg-[#111216]/90 backdrop-blur-xl 
                border-r border-white/10
                shadow-[0_0_20px_rgba(0,120,255,0.4)]
                z-50 transition-transform duration-300
                flex flex-col
                ${isOpen ? "translate-x-0" : "-translate-x-[110%]"} md:hidden
              `}
            >
              <div className="p-6 space-y-8 flex-1 overflow-y-auto ">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Nova Digital</h2>

                  <button onClick={() => setIsOpen(false)} className="text-white">
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>

                {/* Logged-in user card */}
                {user && (
                  <div className="rounded-xl bg-blue-600/20 border border-blue-500/40 px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600/50 flex items-center justify-center flex-shrink-0">
                      <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{userName}</p>
                      {isAdmin && (
                        <p className="text-red-400 text-xs flex items-center gap-1">
                          <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
                          Administrator
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Nav Links */}
                <ul className="space-y-6 text-white text-lg">
                  {[
                    ["Home", "/"],
                    ["Blogs", "/blogs"],
                    ["Services", "/services"],
                    ["Contact", "/contact"],
                  ].map(([label, link]) => (
                    <li key={label}>
                      <Link
                        href={link}
                        onClick={() => setIsOpen(false)}
                        className="block hover:text-blue-400 transition"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Account section for logged-in users */}
                {user && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
                    >
                      <FontAwesomeIcon icon={faBoxOpen} className="text-sm w-4" />
                      {user.name}
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 transition-all duration-200"
                      >
                        <FontAwesomeIcon icon={faShieldHalved} className="text-sm w-4" />
                        Admin Panel
                      </Link>
                    )}

                    <button
                      onClick={() => { setShowLogoutModal(true); setIsOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} className="text-sm w-4" />
                      Logout
                    </button>
                  </div>
                )}

                {/* CTA Buttons for guests */}
                {!user && (
                  <div className="flex items-center gap-4">
                    <Link
                      href="/signup"
                      onClick={() => setIsOpen(false)}
                      className="
                        flex-1 text-center
                        text-white px-3 lg:px-5 py-2.5 rounded-lg bg-blue-600/50 
                        border border-blue-500/70 
                        shadow-[0_0_15px_rgba(0,136,255,0.4)]
                        hover:bg-blue-600/70 hover:scale-[1.04]
                        transition-all duration-300
                      "
                    >
                      Sign Up
                    </Link>

                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="
                        flex-1 text-center
                        border border-blue-500/40 px-3 lg:px-5 py-2.5 rounded-lg
                        text-gray-200 hover:text-white
                        hover:bg-blue-600/50 hover:scale-[1.04]
                        transition-all duration-300
                      "
                    >
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
"use client"
import { useEffect, useState, useRef } from "react";
import api from "@/app/lib/api";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp, faUser, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons/faCaretDown";
import Link from "next/link";

interface UserData {
  name: string;
  role?: string;
}

export default function DesktopHeader() {
  const [user, setUser] = useState<UserData | null>(null);
  const [userName, setUserName] = useState('');
  const [showList, setShowList] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setShowList(false);
      };
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>

      {showDeleteModal && <ConfirmModal
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onConfirmMessage="Logout"
        onCancel={() => {
          setShowDeleteModal(false)
        }}
        onCancelMessage="Cancel"
      />}

      <Link href="/" className="text-lg lg:text-2xl font-extrabold text-white tracking-tight flex items-center">
        Nova Digital
      </Link>

      <ul className="flex items-center gap-10 text-gray-300 mx-auto">
        {[
          ["Home", "/"],
          ["Services", "/services"],
          ["Blogs", "/blogs"],
          ["Contact", "/contact"],
        ].map(([label, link], i) => (
          <li key={i}>
            <Link
              href={link}
              className="
                transition-all
                hover:text-white hover:tracking-wide
                relative pb-1
              "
            >
              {label}
              <span
                className="
                  absolute left-0 -bottom-[2px] h-[2px] w-0 bg-gradient-to-r from-blue-400 to-purple-400 
                  transition-all duration-300 group-hover:w-full
                "
              ></span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 mr-3">

        {/* Admin shortcut — separate, visually distinct */}
        {isAdmin && (
          <Link
            href="/admin"
            className="
              flex items-center gap-2
              text-white px-3 lg:px-4 py-2 rounded-lg
              bg-red-600/40 border border-red-500/60
              shadow-[0_0_15px_rgba(239,68,68,0.4)]
              hover:bg-red-600/60 hover:scale-[1.04]
              transition-all duration-300
            "
          >
            <FontAwesomeIcon icon={faShieldHalved} />
            <span className="hidden lg:inline">Admin</span>
          </Link>
        )}

        {/* User account menu */}
        {user ? (
          <div className="relative" ref={menuRef}>
            <button onClick={() => { setShowList(!showList) }} className="
              text-white px-3 lg:px-3 py-2 rounded-lg bg-blue-600/50 
              border border-blue-500/70 
              shadow-[0_0_15px_rgba(0,136,255,0.4)]
              hover:bg-blue-600/70 hover:scale-[1.04]
              transition-all duration-300 block text-center
            " >
              <FontAwesomeIcon icon={faUser} />
              {showList ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}
            </button>
            {showList && <div
              className="absolute right-0
              text-white rounded-lg bg-black/80 
              border border-white/70 
              shadow-[0_0_15px_rgba(0,136,255,0.4)]
              transition-all duration-300 pb-1 mt-1"
            >
              <Link href="/dashboard" className="px-8 py-2 flex hover:bg-white/50 my-1 transition duration-300 ease-in-out cursor-pointer">
                {userName}
              </Link>
              <hr className="border border-white/70 w-4/5 mx-auto mt-1 mb-1" />
              <div onClick={() => { setShowDeleteModal(true); setShowList(false) }} className="px-8 mt-1 py-2 text-red-500 hover:bg-red-500/50 transition duration-300 ease-in-out cursor-pointer">
                <button>Logout</button>
              </div>
            </div>}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="
                text-white px-3 lg:px-5 py-2 rounded-lg bg-blue-600/50 
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
              className="
                border border-blue-500/40 px-3 lg:px-5 py-2 rounded-lg
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
    </>
  );
}
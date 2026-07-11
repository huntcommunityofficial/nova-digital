import { faTwitter, faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Footer() {
  return (
    <section className="w-full mx-auto">
      <footer className="relative w-full bg-[#0f1115]/70 backdrop-blur-xl p-10 border-t border-white/10 shadow-xl overflow-hidden">

        {/* AURORA GLOW */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-[300px] h-[300px] bg-blue-500/30 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/30 rounded-full blur-[130px]"></div>
        </div>

        {/* CONTENT */}
        <div className="relative grid gap-10 md:grid-cols-2 lg:grid-cols-4 text-white">
          
          {/* BRAND */}
          <div>
            <span className="text-3xl font-extrabold tracking-tight">Nova Digital</span>
            <p className="text-gray-300 mt-4 leading-relaxed">
              Providing modern solutions for digital growth.  
              We focus on quality, creativity, and clean UI/UX.
            </p>

            <div className="flex space-x-4 mt-5">
              <a href="/" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:scale-110">
                <FontAwesomeIcon icon={faInstagram} className="text-pink-400 text-xl" />
              </a>
              <a href="/" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:scale-110">
                <FontAwesomeIcon icon={faTwitter} className="text-blue-400 text-xl" />
              </a>
              <a href="/" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:scale-110">
                <FontAwesomeIcon icon={faWhatsapp} className="text-green-400 text-xl" />
              </a>
            </div>
          </div>

          {/* LINKS */}
          <div>
            <span className="text-2xl font-bold">Links</span>
            <ul className="mt-4 space-y-3">
              {["Home", "Why Us?", "About", "Blogs"].map((item, i) => (
                <li
                  key={i}
                  className="text-gray-300 hover:text-white transition-all hover:translate-x-2 w-fit"
                >
                  <a href="/">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* SERVICES */}
          <div>
            <span className="text-2xl font-bold">Services</span>
            <ul className="mt-4 space-y-3">
              {["Web Design", "Development", "Branding", "Marketing"].map((item, i) => (
                <li
                  key={i}
                  className="text-gray-300 hover:text-white transition-all hover:translate-x-2 w-fit"
                >
                  <a href="/">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <span className="text-2xl font-bold">Contact</span>
            <p className="text-gray-300 mt-4 leading-relaxed">
              Email: example@gmail.com <br />
              Phone: 09123456789 <br />
              Address: 123 Street, Mashhad
            </p>
          </div>
        </div>

        {/* COPYRIGHT */}
        <hr className="border-gray-700 my-10" />

        <p className="text-center text-gray-400 tracking-wide">
          © 2026 Nova Digital. All Rights Reserved.
        </p>

      </footer>
    </section>
  );
}

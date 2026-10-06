import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks } from "../data/siteData";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="container-main relative flex items-center justify-between py-4 md:py-5">
      {/* Logo */}
      <a
        href="#home"
        className="z-30 text-[20px] font-bold tracking-[-0.02em] text-[#0B1B3F] md:text-[22px]"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        Elforte
      </a>

      {/* Desktop Links */}
      <ul className="hidden items-center gap-6 text-[13px] font-medium text-[#3D5468] lg:flex xl:gap-8">
        {navLinks.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="transition-colors duration-200 hover:text-[#0B1B3F]"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Desktop CTA */}
      <a
        href="#contact"
        className="hidden rounded-lg bg-[#D41B2C] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#B91525] hover:shadow-md active:scale-[0.98] lg:inline-flex"
      >
        Get Started
      </a>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-[#D1E3EF] text-[#0B1B3F] lg:hidden"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-20 mx-4 rounded-xl border border-[#D1E3EF] bg-white p-5 shadow-xl lg:hidden"
          >
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-[14px] font-medium text-[#3D5468] transition-colors hover:bg-[#F0F8FF] hover:text-[#0B1B3F]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-3 block rounded-lg bg-[#D41B2C] px-5 py-2.5 text-center text-[13px] font-semibold text-white"
            >
              Get Started
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

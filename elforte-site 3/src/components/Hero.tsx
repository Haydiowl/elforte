import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";
import Navbar from "./Navbar";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function Hero() {
  return (
    <header className="grid-pattern-bg" id="home">
      <Navbar />
      <section className="container-main flex flex-col items-center pb-10 pt-8 text-center sm:pb-14 sm:pt-12">
        <motion.div {...fadeUp(0)}>
          <SectionBadge>HOUSE &nbsp;|&nbsp; LAND &nbsp;|&nbsp; ACCOMMODATION</SectionBadge>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="mt-5 max-w-[700px] text-[32px] font-semibold leading-[1.08] tracking-[-0.01em] text-[#0B1B3F] sm:mt-6 sm:text-[48px] md:text-[56px]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Own Land Today,{" "}
          <br className="hidden sm:block" />
          Build Your Future Tomorrow.
        </motion.h1>

        <motion.p
          {...fadeUp(0.18)}
          className="mt-4 max-w-[540px] text-[14px] leading-[1.7] text-[#4A5D74] sm:text-[15px]"
        >
          Secure your plans with Elforte, a thoughtfully planned residential
          estate designed for people who want to build their future.
        </motion.p>

        <motion.div
          {...fadeUp(0.26)}
          className="mt-7 flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href="#properties"
            className="rounded-lg border border-[#BEDAED] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0B1B3F] shadow-sm transition-all duration-200 hover:border-[#93BFDA] hover:shadow-md active:scale-[0.98]"
          >
            Explore our properties
          </a>
          <a
            href="#contact"
            className="rounded-lg bg-[#D41B2C] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#B91525] hover:shadow-md active:scale-[0.98]"
          >
            Book an inspection
          </a>
        </motion.div>
      </section>

      {/* Hero Image */}
      <div className="relative">
        <img
          src="/images/hero-aerial.jpg"
          alt="Aerial view of Elforte Signature City estate development"
          className="h-[280px] w-full object-cover sm:h-[380px] md:h-[460px] lg:h-[520px]"
        />
        {/* Signature City logo overlay */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="flex items-center gap-3 rounded-xl border border-[#D1E3EF] bg-white px-5 py-3 shadow-lg sm:px-7 sm:py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1B3F] sm:h-12 sm:w-12">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#D41B2C" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0B1B3F] sm:text-[12px]">
                SIGNATURE
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0B1B3F] sm:text-[12px]">
                CITY
              </p>
              <p className="text-[8px] tracking-[0.2em] text-[#6B7E94] sm:text-[9px]">
                E S T A T E
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

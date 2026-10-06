import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionBadge from "./SectionBadge";
import { faqs } from "../data/siteData";

export default function FAQ() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section id="faq" className="bg-[#E8F4FF] py-16 sm:py-20 md:py-24">
      <div className="container-main">
        <div className="text-center">
          <SectionBadge>FREQUENTLY ASKED QUESTIONS</SectionBadge>
          <h2
            className="mt-5 text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] text-[#0B1B3F] sm:text-[36px] md:text-[42px]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Questions, Answered.
          </h2>
          <p className="mx-auto mt-3 max-w-[580px] text-[14px] leading-[1.7] text-[#4A5D74]">
            Find clear answers about Elforte, Signature City, property ownership,
            and what to expect before you buy.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:gap-8">
          {/* Left card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-[#D1E3EF] bg-white shadow-sm"
          >
            <img
              src="/images/change-gate.png"
              alt="Elforte property"
              className="h-[200px] w-full object-cover sm:h-[220px]"
            />
            <div className="p-5 sm:p-6">
              <h3 className="text-[18px] font-bold text-[#0B1B3F] sm:text-[20px]">
                Planning to Own Land?
              </h3>
              <p className="mt-2 text-[13px] leading-[1.7] text-[#4A5D74] sm:text-[14px]">
                Explore Elforte's property locations, explore available plots, and speak
                with our team to find the right fit for you.
              </p>
              <a
                href="#contact"
                className="mt-4 inline-flex rounded-lg bg-[#D41B2C] px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-[#B91525] active:scale-[0.98]"
              >
                Book an Inspection
              </a>
            </div>
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="divide-y divide-[#D1E3EF] rounded-2xl border border-[#D1E3EF] bg-white"
          >
            {faqs.map((faq, i) => {
              const isOpen = i === activeIdx;
              return (
                <div key={i} className="group">
                  <button
                    onClick={() => setActiveIdx(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#F8FCFF] sm:px-6"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[13px] font-semibold text-[#0B1B3F] sm:text-[14px]">
                      {faq.q}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D1E3EF] text-[#4A5D74] transition-colors group-hover:border-[#93BFDA]">
                      <svg
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M7 1v12M1 7h12" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-[13px] leading-[1.7] text-[#4A5D74] sm:px-6 sm:text-[14px]">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";
import { whyFeatures } from "../data/siteData";

function FeatureIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    location: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D41B2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    document: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D41B2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    plan: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D41B2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    guide: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D41B2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    payment: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D41B2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    inspect: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D41B2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  };
  return <>{icons[icon] || icons.location}</>;
}

export default function WhyElforte() {
  return (
    <section id="why-us" className="bg-[#D41B2C] py-16 sm:py-20 md:py-24">
      <div className="container-main text-center">
        <SectionBadge variant="red">WHY CHOOSE US</SectionBadge>
        <h2
          className="mx-auto mt-5 max-w-[500px] text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] text-white sm:text-[36px] md:text-[42px]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Why Choose Elforte?
        </h2>
        <p className="mx-auto mt-3 max-w-[560px] text-[14px] leading-[1.7] text-white/80">
          From your first enquiry to the day you receive your allocation—we've built every
          step to give you confidence, clarity, and complete peace of mind.
        </p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {whyFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-xl border border-white/20 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF0F1]">
                <FeatureIcon icon={feature.icon} />
              </div>
              <h3 className="text-[15px] font-bold text-[#0B1B3F] sm:text-[16px]">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-[1.7] text-[#4A5D74]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

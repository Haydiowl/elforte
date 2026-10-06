import React from "react";
import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";
import { services } from "../data/siteData";

function ServiceIcon({ icon }: { icon: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    building: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B1B3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
      </svg>
    ),
    handshake: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B1B3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    chart: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B1B3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  };
  return iconMap[icon] || iconMap.building;
}

export default function Services() {
  return (
    <section id="services" className="grid-pattern-bg py-16 sm:py-20 md:py-24">
      <div className="container-main">
        <div className="text-center sm:text-left">
          <SectionBadge>OUR SERVICES</SectionBadge>
          <h2
            className="mt-4 text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] text-[#0B1B3F] sm:text-[36px] md:text-[42px]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            More Than Property Sales.
          </h2>
          <p className="mx-auto mt-3 max-w-[600px] text-[14px] leading-[1.7] text-[#4A5D74] sm:mx-0 sm:text-[15px]">
            Secure your plans with Elforte, a thoughtfully planned residential
            estate designed for people who want to build their future.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Service list */}
          <div className="space-y-4">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group cursor-pointer rounded-xl border border-[#D1E3EF] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#93BFDA] hover:shadow-md sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F4FF]">
                    <ServiceIcon icon={service.icon} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#0B1B3F] sm:text-[18px]">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-[1.7] text-[#4A5D74] sm:text-[14px]">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Service Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl"
          >
            <img
              src="/images/service-image.jpg"
              alt="Elforte property development"
              className="h-full min-h-[320px] w-full object-cover sm:min-h-[400px]"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

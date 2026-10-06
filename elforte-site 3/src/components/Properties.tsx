import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";
import { properties } from "../data/siteData";

export default function Properties() {
  return (
    <section id="properties" className="bg-[#E8F4FF] py-16 sm:py-20 md:py-24">
      <div className="container-main">
        {/* Header row */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-[520px]">
            <SectionBadge>BUILT PROPERTIES</SectionBadge>
            <h2
              className="mt-4 text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] text-[#0B1B3F] sm:text-[36px] md:text-[42px]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Find a Place to Build Your Future.
            </h2>
          </div>
          <p className="max-w-[380px] text-[14px] leading-[1.7] text-[#4A5D74] sm:pt-8">
            Explore Elforte's thoughtfully planned properties, each offering a unique
            opportunity to own land in a strategic, fast-growing community.
          </p>
        </div>

        {/* Property Cards */}
        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {properties.map((property, idx) => (
            <motion.article
              key={`${property.name}-${idx}`}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group overflow-hidden rounded-2xl p-5 sm:p-6 ${
                property.variant === "dark"
                  ? "bg-[#0B1B3F] text-white"
                  : "bg-white text-[#0B1B3F]"
              }`}
            >
              {/* Icon */}
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${
                  property.variant === "dark"
                    ? "bg-white/10"
                    : "bg-[#E8F4FF]"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={property.variant === "dark" ? "#ffffff" : "#0B1B3F"}
                  strokeWidth="1.5"
                >
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
              </div>

              <h3 className="text-[20px] font-bold tracking-[-0.01em] sm:text-[22px]">
                {property.name}
              </h3>

              <p
                className={`mt-2.5 text-[13px] leading-[1.7] sm:text-[14px] ${
                  property.variant === "dark"
                    ? "text-[#B8CADF]"
                    : "text-[#4A5D74]"
                }`}
              >
                {property.description}
              </p>

              <a
                href="#contact"
                className={`mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-all duration-200 hover:gap-2.5 ${
                  property.variant === "dark"
                    ? "text-white"
                    : "text-[#0B1B3F]"
                }`}
              >
                {property.linkLabel}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              {/* Image */}
              <div className="mt-5 overflow-hidden rounded-xl">
                <img
                  src={property.image}
                  alt={property.name}
                  className="h-[200px] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 sm:h-[220px]"
                />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

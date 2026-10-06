import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";
import { testimonial } from "../data/siteData";

export default function Testimonials() {
  return (
    <section className="bg-white py-16 sm:py-20 md:py-24">
      <div className="container-main text-center">
        <SectionBadge>CUSTOMER STORIES</SectionBadge>
        <h2
          className="mx-auto mt-5 max-w-[600px] text-[28px] font-semibold leading-[1.1] tracking-[-0.01em] text-[#0B1B3F] sm:text-[36px] md:text-[42px]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Property Owners Notice the Elforte Difference.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-[1.7] text-[#4A5D74]">
          Real experiences from homeowners and investors who trusted Elforte to help them find, acquire, and own their property.
        </p>

        {/* Decorative colored dots row */}
        <div className="mx-auto mt-8 flex items-center justify-center gap-2">
          {["#F59E0B", "#D41B2C", "#EC4899", "#3B82F6", "#10B981"].map((color, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-8 max-w-[800px] overflow-hidden rounded-2xl border border-[#D1E3EF] bg-white text-left shadow-lg"
        >
          <div className="grid sm:grid-cols-[220px_1fr] md:grid-cols-[260px_1fr]">
            <img
              src={testimonial.image}
              alt={`Photo of ${testimonial.name}`}
              className="h-[220px] w-full object-cover sm:h-full"
            />
            <div className="p-6 sm:p-8">
              <p className="text-[15px] leading-[1.75] text-[#2D4356] sm:text-[16px]">
                {testimonial.quote}
              </p>
              <div className="mt-5">
                <p className="text-[14px] font-bold text-[#0B1B3F]">
                  {testimonial.name}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation arrows */}
        <div className="mx-auto mt-6 flex items-center justify-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D1E3EF] bg-white text-[#4A5D74] transition-colors hover:bg-[#F0F8FF]"
            aria-label="Previous testimonial"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 4l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D1E3EF] bg-[#0B1B3F] text-white transition-colors hover:bg-[#142D54]"
            aria-label="Next testimonial"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

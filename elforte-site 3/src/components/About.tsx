import { motion } from "framer-motion";
import SectionBadge from "./SectionBadge";
import { stats } from "../data/siteData";

export default function About() {
  return (
    <section id="about" className="bg-white py-20 pt-28 sm:py-24 sm:pt-32">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <SectionBadge>ABOUT US</SectionBadge>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-6 max-w-[880px] text-[22px] font-medium leading-[1.4] tracking-[-0.01em] text-[#0B1B3F] sm:text-[26px] md:text-[30px]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Whether you're buying your first property, securing land for your
          family, or investing for the future, Elforte connects you with
          thoughtfully developed properties, strategic locations, and a clear
          path to ownership.
        </motion.p>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-[#BEDAED] pt-8 sm:mt-12 sm:pt-10 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <p
                className="text-[40px] font-bold leading-none tracking-[-0.03em] text-[#0B1B3F] sm:text-[48px] md:text-[56px]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {stat.value}
              </p>
              <p className="mt-1.5 text-[13px] text-[#6B7E94] sm:text-[14px]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

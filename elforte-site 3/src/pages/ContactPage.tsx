import ContactForm from "../components/ContactForm";
import { FaqSection, FooterScene, SiteNav } from "../components/site";

const SOCIALS = [
  {
    name: "X",
    href: "https://x.com/elforte",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/elforte",
    path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/elforte",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "Email",
    href: "mailto:hello@elforte.com",
    path: "M2 5h20v14H2zM2 6l10 7L22 6",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#cc091b]/10 selection:text-[#cc091b]">
      <SiteNav />

      {/* Hero — image background with heading + form card, per Figma */}
      <section className="relative overflow-hidden">
        <img
          src="/images/hero-aerial.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#09123c]/92 via-[#09123c]/78 to-[#09123c]/55"
        />
        <div className="container-site relative z-10 grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_592px] lg:gap-12">
          <div className="max-w-[484px] text-white">
            <span className="inline-flex items-center rounded-full bg-[#bfe3ff]/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#09123c]">
              Contact us
            </span>
            <h1 className="mt-5 text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[56px]">
              Get in Touch <span className="whitespace-nowrap">With Us</span>
            </h1>
            <p className="mt-4 max-w-[440px] text-[15px] leading-[1.6] text-white/90 sm:text-[16px]">
              We would love to hear from you. Whether you have a question, feedback, or want to explore working
              together, our team is here to listen.
            </p>
          </div>

          <div className="rounded-2xl bg-white/25 p-2 backdrop-blur-sm sm:p-3">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Contact info strip — per Figma */}
      <section className="bg-[#E4F6FF] py-8">
        <div className="container-site flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <div>
              <h2 className="text-[13px] font-black tracking-[0.08em] text-[#09123c]">GET IN TOUCH WITH US</h2>
              <div className="mt-3">
                <div className="text-[13px] font-semibold text-[#355672]">Location</div>
                <div className="mt-0.5 text-[13px] text-[#4a556a]">Ijebu Ode, Ogun State</div>
              </div>
            </div>
            <div className="hidden h-12 w-px bg-[#bdd9ef] sm:block" aria-hidden="true" />
            <div className="sm:pt-8">
              <div className="text-[13px] font-semibold text-[#355672]">Phone</div>
              <a href="tel:+23481234567879" className="mt-0.5 block text-[13px] text-[#4a556a] hover:text-[#09123c]">
                +234 81234567879
              </a>
            </div>
          </div>

          <div className="flex gap-2.5">
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={s.name}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-[#09123c] shadow-sm transition-colors hover:text-[#cc091b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09123c]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d={s.path}
                    fill={s.name === "Email" ? "none" : "currentColor"}
                    stroke={s.name === "Email" ? "currentColor" : "none"}
                    strokeWidth="1.8"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />
      <FooterScene />
    </div>
  );
}

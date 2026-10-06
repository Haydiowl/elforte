import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// --- Badge (same as homepage App.tsx) ---
export function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#BEDAED] bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#355672] ${className}`}
    >
      <span className="mr-2 h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
}

// --- Button (same as homepage App.tsx) ---
export function Button({
  children,
  variant = "primary",
  className = "",
  to,
  href,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  to?: string;
  href?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-[13px] font-bold transition-all duration-200 active:scale-95";
  const variants = {
    primary: "bg-[#cc091b] text-white hover:bg-[#b50818] shadow-sm",
    secondary: "bg-white text-[#09123c] hover:bg-slate-50 shadow-sm",
    outline: "border border-[#aacde7] bg-white text-[#09123c] hover:border-[#8ab5d6]",
  };
  const cls = `${base} ${variants[variant]} ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <a href={href ?? "#"} className={cls}>{children}</a>;
}

// --- SiteNav (same visual system as homepage nav) ---
const NAV = [
  { label: "About us", href: "/#about-us" },
  { label: "Explore properties", href: "/properties" },
  { label: "Blogs", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Become a partner", href: "https://form.jotform.com/262775440551055" },
];

export function SiteNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#bdd9ef] bg-[#d6eeff]/90 backdrop-blur-md">
      <div className="container-site flex h-20 items-center justify-between">
        <Link to="/" aria-label="Elforte home" className="inline-flex items-center">
          <img src="/images/elforte-logo.png" alt="Elforte" className="h-auto w-[108px]" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) =>
            item.href.startsWith("/") && !item.href.includes("#") ? (
              <Link
                key={item.label}
                to={item.href}
                className={`text-[13px] font-medium transition-colors hover:text-[#09123c] ${
                  location.pathname === item.href ? "text-[#09123c]" : "text-[#4a556a]"
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="text-[13px] font-medium text-[#4a556a] transition-colors hover:text-[#09123c]"
              >
                {item.label}
              </a>
            )
          )}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <Button href="https://wa.me/2349056592894" className="gap-2 px-5 py-2.5">
            <span>Chat with us</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </Button>
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden" aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={mobileMenuOpen ? "M18 6L6 18M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"} />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-white lg:hidden"
          >
            <div className="container-site flex flex-col gap-4 py-6">
              {NAV.map((item) =>
                item.href.startsWith("/") && !item.href.includes("#") ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-[#09123c]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-[#09123c]"
                  >
                    {item.label}
                  </a>
                )
              )}
              <Button href="https://wa.me/2349056592894" className="w-full">
                Chat with us
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// --- FAQ section (same content/pattern as homepage) ---
const FAQS = [
  {
    q: "What is Signature City?",
    a: "Signature City is a thoughtfully planned residential development by Elforte, created for individuals, families, and investors looking to secure land in a location with room for growth. It offers an organized environment designed to make land ownership and future development easier.",
  },
  {
    q: "Where is Signature City located?",
    a: "It is located in a high-growth zone with proximity to major road networks and urban amenities.",
  },
  {
    q: "How much does a plot cost?",
    a: "Prices vary based on size and specific location within the estate. Contact us for current pricing.",
  },
  {
    q: "Can I pay in installments?",
    a: "Yes, we offer flexible payment plans designed to match your financial goals.",
  },
  {
    q: "Can I inspect the property before buying?",
    a: "Absolutely! We encourage on-site inspections before any commitment.",
  },
  {
    q: "What documents will I receive when I purchase?",
    a: "You'll receive a contract of sale, allocation letter, and other relevant legal titles.",
  },
];

export function FaqSection() {
  const [activeFaq, setActiveFaq] = useState(0);
  return (
    <section id="faq" className="scroll-mt-nav bg-white py-20 sm:py-32">
      <div className="container-site">
        <div className="text-center">
          <Badge className="mb-6 bg-slate-100/50">FREQUENTLY ASKED QUESTION</Badge>
          <h2 className="text-3xl font-bold text-[#09123c] sm:text-4xl lg:text-5xl">Questions, Answered.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.35] text-[#4a556a]">
            Find clear answers about Elforte, Signature City, property ownership, documentation, payment plans, and what to expect before you buy.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1.5fr]">
          <div className="overflow-hidden rounded-xl border border-[#bdd9ef] bg-[#d6eeff] shadow-lg">
            <img src="/images/change-gate.png" alt="Planning Land" className="h-[360px] w-full object-cover sm:h-[380px]" />
            <div className="p-5">
              <h3 className="text-xl font-bold text-[#09123c]">Planning to Own Land?</h3>
              <p className="mt-2 text-[14px] leading-[1.35] text-[#4a556a]">
                See Signature City firsthand, explore available plots, and speak with our property team.
              </p>
              <Button href="https://wa.me/2349056592894" className="mt-5">
                Book an inspection
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-[#bdd9ef] bg-white">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="font-bold text-[#09123c]">{faq.q}</span>
                  <span className="text-xl">{activeFaq === i ? "−" : "+"}</span>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden px-5 pb-5"
                    >
                      <p className="text-[14px] leading-relaxed text-[#4a556a]">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Final CTA + Footer (same as homepage) ---
export function FooterScene() {
  return (
    <div className="footer-scene relative overflow-hidden bg-[#00031E] pb-8 sm:pb-10">
      <img
        src="/images/hero-signature-city.png"
        alt="Signature City estate"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-100 object-cover opacity-70 blur-[2px]"
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#00031E]/65" />
      <section className="relative z-10 overflow-hidden bg-transparent pb-36 pt-24 sm:pb-44 sm:pt-32">
        <div className="container-site relative z-10 text-center text-white">
          <Badge className="mb-6 bg-white/10 text-white">YOUR NEXT MOVE</Badge>
          <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Ready to See It for Yourself?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Visit Signature City, explore available plots, and speak with our property team about your next step toward ownership.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="https://wa.me/2349056592894" variant="secondary" className="px-8 py-4">
              Chat on WhatsApp
            </Button>
            <Button href="https://wa.me/2349056592894" className="px-8 py-4">
              Book an inspection
            </Button>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer-grid relative z-20 mx-auto -mt-24 w-[calc(100%-2rem)] max-w-[1200px] scroll-mt-nav rounded-xl bg-white px-6 pb-28 pt-12 sm:px-10 sm:pb-32 sm:pt-14 lg:px-14">
        <div>
          <div className="grid gap-10 lg:grid-cols-[1.7fr_.7fr_.9fr_1fr]">
            <div>
              <Link to="/" aria-label="Elforte home" className="inline-flex items-center">
                <img src="/images/elforte-logo.png" alt="Elforte" className="h-auto w-[132px]" />
              </Link>
              <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-[#4a556a]">
                Explore thoughtfully developed properties, secure your ideal plot, and take your next step toward property ownership with clarity and confidence.
              </p>
            </div>

            <div>
              <h4 className="mb-6 text-[12px] font-black tracking-widest text-[#09123c]">QUICK LINKS</h4>
              <ul className="space-y-3 text-[13px] text-[#4a556a]">
                <li><Link to="/" className="hover:text-[#cc091b]">Home</Link></li>
                <li><a href="/#about-us" className="hover:text-[#cc091b]">About us</a></li>
                <li><Link to="/properties" className="hover:text-[#cc091b]">Our Properties</Link></li>
                <li><Link to="/contact" className="hover:text-[#cc091b]">Contact Us</Link></li>
                <li><Link to="/blog" className="hover:text-[#cc091b]">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-[12px] font-black tracking-widest text-[#09123c]">EXPLORE ELFORTE</h4>
              <ul className="space-y-3 text-[13px] text-[#4a556a]">
                <li><Link to="/properties/signature-city" className="hover:text-[#cc091b]">Signature city</Link></li>
                <li><Link to="/properties/itunu-gardens" className="hover:text-[#cc091b]">Itunu Gardens</Link></li>
                <li><Link to="/properties/blossom-city" className="hover:text-[#cc091b]">Blossom City</Link></li>
                <li><Link to="/properties" className="hover:text-[#cc091b]">All properties</Link></li>
              </ul>
            </div>

            <div className="lg:text-right">
              <h4 className="mb-6 text-[12px] font-black tracking-widest text-[#09123c]">GET IN TOUCH</h4>
              <div className="space-y-4 text-[13px] text-[#4a556a]">
                <div>
                  <div className="font-bold text-[#09123c]">Location</div>
                  <div>Ijebu Ode, Ogun State</div>
                </div>
                <div>
                  <div className="font-bold text-[#09123c]">Phone</div>
                  <a href="tel:+2348123456789" className="hover:text-[#cc091b]">+234 8123456789</a>
                </div>
                <div className="flex gap-2 pt-2 lg:justify-end">
                  {[
                    { name: "X", path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" },
                    { name: "LinkedIn", path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
                    { name: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                    { name: "Email", path: "M2 5h20v14H2zM2 6l10 7L22 6" },
                  ].map((social) => (
                    <a key={social.name} href="mailto:hello@elforte.com" aria-label={social.name} className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8e8e8] text-[#09123c] transition-colors hover:text-[#cc091b]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d={social.path} fill={social.name === "Email" ? "none" : "currentColor"} stroke={social.name === "Email" ? "currentColor" : "none"} strokeWidth="1.8" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-[#dce4ea] pt-8 text-center sm:flex-row sm:text-left">
            <div className="text-[12px] text-[#4a556a]">@2026 Elforte All Rights Reserved</div>
            <div className="flex gap-6 text-[12px] text-[#4a556a]">
              <a href="#" className="hover:text-[#09123c]">Terms of Use</a>
              <a href="#" className="hover:text-[#09123c]">Privacy Policy</a>
              <a href="#" className="hover:text-[#09123c]">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

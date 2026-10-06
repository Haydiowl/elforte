import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// --- Components ---

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-[#BEDAED] bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#355672] ${className}`}>
      <span className="mr-2 h-1 w-1 rounded-full bg-current" />
      {children}
    </span>
  );
}

function Button({ 
  children, 
  variant = "primary", 
  className = "",
  href = "#",
  to
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "secondary" | "outline"; 
  className?: string;
  href?: string;
  to?: string;
}) {
  const base = "inline-flex items-center justify-center rounded-full px-6 py-3 text-[13px] font-bold transition-all duration-200 active:scale-95";
  const variants = {
    primary: "bg-[#cc091b] text-white hover:bg-[#b50818] shadow-sm",
    secondary: "bg-white text-[#09123c] hover:bg-slate-50 shadow-sm",
    outline: "border border-[#aacde7] bg-white text-[#09123c] hover:border-[#8ab5d6]"
  };

  const cls = `${base} ${variants[variant]} ${className}`;
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  const statRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);
  const target = Number.parseInt(value, 10);
  const suffix = value.replace(String(target), "");

  useEffect(() => {
    const node = statRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || hasStarted.current) return;
      hasStarted.current = true;
      const startedAt = performance.now();
      const duration = 1200;
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(String(Math.round(target * eased)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.45 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={statRef} className="flex flex-col gap-2">
      <div className="text-5xl font-bold leading-none text-[#09123c] lg:text-6xl">{displayValue}{suffix}</div>
      <div className="text-[14px] text-[#4a556a]">{label}</div>
    </div>
  );
}

function BenefitIcon({ icon }: { icon: string }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#ff263c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icon === "location" && <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>}
      {icon === "document" && <><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4M9 11h6M9 15h6M9 18h4" /></>}
      {icon === "plan" && <><path d="M3 18h18M5 18V9h14v9M8 9V6h8v3M8 13h2M14 13h2" /><path d="M3 9l9-4 9 4" /></>}
      {icon === "guide" && <><path d="M8 12h8M12 8v8" /><path d="M4 7h5l3 3 3-3h5v10h-5l-3 3-3-3H4z" /></>}
      {icon === "payment" && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></>}
      {icon === "inspect" && <><path d="M6 10a3 3 0 1 1 6 0v7H6zM12 10a3 3 0 1 1 6 0v7h-6z" /><path d="M12 10V6M9 6h6" /></>}
    </svg>
  );
}

// --- Main App ---

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("section"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.12 });
    sections.forEach((section) => {
      section.classList.add("scroll-reveal");
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const testimonials = [
    {
      quote: "Elforte made the entire process easy to understand. Their team was responsive and guided me through the documentation without unnecessary stress.",
      name: "Tolu M.",
      role: "Property Owner",
      image: "/images/rectangle-10.png",
    },
    {
      quote: "The team listened to what I needed and made the journey to property ownership feel clear, practical, and reassuring.",
      name: "Amaka O.",
      role: "Property Owner",
      image: "/images/rectangle-12.png",
    },
    {
      quote: "From the first conversation to the inspection, the team made every step feel clear, practical, and well supported.",
      name: "Chinedu K.",
      role: "Homeowner",
      image: "/images/rectangle-13.png",
    },
    {
      quote: "I appreciated how transparent and supportive the process was. Elforte helped me make a confident decision about my family’s future.",
      name: "Emeka N.",
      role: "Property Investor",
      image: "/images/rectangle-14.png",
    },
    {
      quote: "I found a location that matched my plans and received helpful guidance throughout the ownership process.",
      name: "Zainab I.",
      role: "Homeowner",
      image: "/images/rectangle-15.png",
    },
    {
      quote: "The documentation was explained clearly, and the inspection gave me confidence before making my decision.",
      name: "Kunle A.",
      role: "Property Investor",
      image: "/images/rectangle-16.png",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#cc091b]/10 selection:text-[#cc091b]">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#bdd9ef] bg-[#d6eeff]/90 backdrop-blur-md">
        <div className="container-site flex h-20 items-center justify-between">
          <a href="#" aria-label="Elforte home" className="inline-flex items-center">
            <img src="/images/elforte-logo.png" alt="Elforte" className="h-auto w-[108px]" />
          </a>
          
          <div className="hidden items-center gap-8 lg:flex">
            {["About us", "Explore properties", "Blogs", "Contact", "Become a partner"].map((item) =>
              item === "Explore properties" ? (
                <Link key={item} to="/properties" className="text-[13px] font-medium text-[#4a556a] transition-colors hover:text-[#09123c]">
                  {item}
                </Link>
              ) : item === "Blogs" ? (
                <Link key={item} to="/blog" className="text-[13px] font-medium text-[#4a556a] transition-colors hover:text-[#09123c]">
                  {item}
                </Link>
              ) : item === "Contact" ? (
                <Link key={item} to="/contact" className="text-[13px] font-medium text-[#4a556a] transition-colors hover:text-[#09123c]">
                  {item}
                </Link>
              ) : item === "Become a partner" ? (
                <a key={item} href="https://form.jotform.com/262775440551055" target="_blank" rel="noreferrer" className="text-[13px] font-medium text-[#4a556a] transition-colors hover:text-[#09123c]">
                  {item}
                </a>
              ) : (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-[13px] font-medium text-[#4a556a] transition-colors hover:text-[#09123c]">
                  {item}
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

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={mobileMenuOpen ? "M18 6L6 18M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </div>
        
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-white lg:hidden">
              <div className="container-site flex flex-col gap-4 py-6">
                {["About us", "Explore properties", "Blogs", "Contact", "Become a partner"].map((item) =>
                  item === "Explore properties" ? (
                    <Link key={item} to="/properties" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-[#09123c]">
                      {item}
                    </Link>
                  ) : item === "Blogs" ? (
                    <Link key={item} to="/blog" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-[#09123c]">
                      {item}
                    </Link>
                  ) : item === "Contact" ? (
                    <Link key={item} to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-[#09123c]">
                      {item}
                    </Link>
                  ) : item === "Become a partner" ? (
                    <a key={item} href="https://form.jotform.com/262775440551055" target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-[#09123c]">
                      {item}
                    </a>
                  ) : (
                    <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-[#09123c]">
                      {item}
                    </a>
                  )
                )}
                <Button href="https://wa.me/2349056592894" className="w-full">Chat with us</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="grid-bg pt-6 text-center sm:pt-10">
        <div className="container-site flex flex-col items-center">
          <Badge className="mb-6">SECURE • ACCESSIBLE • INVESTMENT READY</Badge>
          <h1 className="max-w-[100%] text-[38px] font-bold leading-[0.98] text-[#09123c] sm:max-w-[1050px] sm:text-6xl lg:text-7xl">
            <span className="block sm:whitespace-nowrap">Own Land Today.</span>
            <span className="block sm:whitespace-nowrap">Build Your Future Tomorrow.</span>
          </h1>
          <p className="mt-6 max-w-[600px] text-[15px] leading-relaxed text-[#4a556a]">
            Secure your place with Elforte, a thoughtfully planned residential <br className="hidden sm:block" /> estate designed for people who want to own land.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4 pb-12 sm:pb-14">
            <Button variant="outline" to="/properties">Explore our properties</Button>
            <Button>Book an inspection</Button>
          </div>
        </div>
      </section>

      {/* Hero Image — Signature City Gate (full bleed, fades into About section) */}
      <section className="relative">
        <img
          src="/images/hero-signature-city.png"
          alt="Signature City Estate Entrance"
          className="h-[460px] w-full object-cover object-[center_42%] sm:h-[600px] lg:h-[720px]"
        />
        {/* White-to-transparent fog fade at the bottom so the image bleeds into the about section */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
          style={{ background: "linear-gradient(to bottom, transparent 0%, #e8f4ff 100%)" }}
        />
      </section>

      {/* About Section — sky-blue background, image bleeds in from top */}
      <section id="about-us" className="scroll-mt-nav bg-[#e8f4ff] pb-20 pt-10 sm:pb-28 sm:pt-14">
        <div className="container-site">
          {/* Badge styled as the Figma: small pill, border, subtle bg */}
          <span className="inline-flex items-center rounded-full border border-[#c8dce8] bg-white/70 px-4 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#4a556a]">
            ABOUT US
          </span>

          {/* Mixed-weight heading: first sentence regular/light, last clause bold black */}
          <p className="mt-6 max-w-[1000px] text-2xl leading-snug text-[#5a6a7e] sm:text-3xl md:text-4xl lg:text-[42px] lg:leading-[1.2]">
            Whether you're buying your first property, securing land for your
            family, or investing for the future, Elforte connects you with{" "}
            <strong className="font-bold text-[#09123c]">
              thoughtfully developed properties, strategic locations, and a clear
              path to ownership.
            </strong>
          </p>

          {/* Stats row — divided by vertical lines */}
          <div className="mt-14 grid grid-cols-2 gap-y-10 border-t border-[#bdd9ef] pt-10 md:grid-cols-4">
            {[
              { val: "12+", label: "Year of experience" },
              { val: "8+", label: "Properties developed" },
              { val: "300+", label: "Happy clients" },
              { val: "100%", label: "Commitment to quality" },
            ].map((stat, i) => (
              <div key={i} className={`${i > 0 ? "md:border-l md:border-[#bdd9ef] md:pl-10" : ""}`}>
                <AnimatedStat value={stat.val} label={stat.label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Section — white bg with radiating sunburst at top */}
      <section id="explore-properties" className="scroll-mt-nav relative overflow-hidden bg-white pb-20 pt-16 sm:pb-32 sm:pt-24">
        {/* Radial sunburst light at top center */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2" style={{ width: "900px", height: "400px" }}>
          <svg viewBox="0 0 900 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <defs>
              <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c8dff0" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = -90 + (i - 6.5) * 10;
              const rad = (angle * Math.PI) / 180;
              const len = 500;
              const x2 = 450 + Math.cos(rad) * len;
              const y2 = 0 + Math.sin(rad) * len;
              return (
                <polygon
                  key={i}
                  points={`450,0 ${450 + Math.cos(((angle - 4) * Math.PI) / 180) * len},${Math.sin(((angle - 4) * Math.PI) / 180) * len} ${x2},${y2}`}
                  fill="url(#ray)"
                  opacity={0.45}
                />
              );
            })}
          </svg>
        </div>

        <div className="container-site relative z-10">
          {/* Header Row */}
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-full border border-[#c8dce8] bg-[#eaf4fc] px-4 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#4a556a]">
                INVEST WITH PURPOSE
              </span>
              <h2 className="mt-5 text-3xl font-bold leading-tight text-[#09123c] sm:text-4xl lg:text-[46px]">
                Find a Place to Build Your Future.
              </h2>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <p className="max-w-[320px] text-[15px] leading-relaxed text-[#4a556a] lg:text-right">
                Explore Elforte's thoughtfully planned properties, each offering a unique opportunity to own land.
              </p>
              <Button to="/properties">View more properties</Button>
            </div>
          </div>

          {/* Property Cards */}
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Signature city",
                bg: "bg-[#e8f4ff]",
                text: "text-[#09123c]",
                descColor: "text-[#4a556a]",
                btnBorder: "border-[#b5cfe0]",
                btnText: "text-[#09123c]",
                iconBg: "bg-[#e8f4ff] border border-[#c8dce8]",
                iconStroke: "#962020",
                desc: "A thoughtfully planned residential estate offering well-positioned plots, organized infrastructure, and space to build your future.",
                img: "/images/change-gate.png",
                tilt: "-rotate-[6deg] -translate-x-4 translate-y-4",
              },
              {
                title: "Itunu Gardens",
                bg: "bg-[#09123c]",
                text: "text-white",
                descColor: "text-[#a0b4ca]",
                btnBorder: "border-[#3a5070]",
                btnText: "text-white",
                iconBg: "bg-[#1e2c50] border border-[#2f426a]",
                iconStroke: "#cc091b",
                desc: "A growing residential community designed for comfortable living, accessible ownership, and long-term development.",
                img: "/images/property-road.jpg",
                tilt: "rotate-[3deg] translate-y-2",
              },
              {
                title: "Blossom City",
                bg: "bg-[#e8f4ff]",
                text: "text-[#09123c]",
                descColor: "text-[#4a556a]",
                btnBorder: "border-[#b5cfe0]",
                btnText: "text-[#09123c]",
                iconBg: "bg-[#e8f4ff] border border-[#c8dce8]",
                iconStroke: "#962020",
                desc: "Discover available plots within Blossom City and find an option that fits your plans, location preferences, and ownership goals.",
                img: "/images/property-lot.jpg",
                tilt: "rotate-[6deg] translate-x-4 translate-y-4",
                soldOut: true,
              },
            ].map((card, i) => (
              <div key={i} className={`group relative overflow-hidden rounded-[24px] ${card.bg} p-6 pb-0 sm:p-8 sm:pb-0`}>
                {/* Icon — building/house SVG in circular badge */}
                <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-full ${card.iconBg}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={card.iconStroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="9" width="7" height="13" rx="1" />
                    <rect x="14" y="4" width="7" height="18" rx="1" />
                    <path d="M5 13h3M5 16h3M16 8h3M16 11h3M16 14h3" />
                  </svg>
                </div>

                {/* Title */}
                <div className="flex items-center gap-3">
                  <h3 className={`text-xl font-bold ${card.text}`}>{card.title}</h3>
                  {(card as { soldOut?: boolean }).soldOut && (
                    <span className="inline-flex items-center rounded-full bg-[#cc091b] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                      Sold out
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className={`mt-3 text-[13.5px] leading-relaxed ${card.descColor}`}>{card.desc}</p>

                {/* View property pill button */}
                {(card as { soldOut?: boolean }).soldOut ? (
                  <span
                    className={`mt-5 inline-flex cursor-not-allowed items-center rounded-full border ${card.btnBorder} px-4 py-2 text-[12.5px] font-semibold ${card.btnText} opacity-60`}
                  >
                    Sold out
                  </span>
                ) : (
                  <a
                    href="#contact"
                    className={`mt-5 inline-flex items-center rounded-full border ${card.btnBorder} px-4 py-2 text-[12.5px] font-semibold ${card.btnText} transition-all duration-200 hover:shadow-md`}
                  >
                    View property
                  </a>
                )}

                {/* Tilted image — the key visual feature */}
                <div className="relative mt-8 h-[280px] sm:h-[340px]">
                  <div className={`absolute inset-0 overflow-hidden rounded-2xl border-[3px] border-white/40 shadow-2xl ${card.tilt} origin-center transition-transform duration-500 group-hover:rotate-0 group-hover:translate-x-0 group-hover:translate-y-0`}>
                    <img
                      src={card.img}
                      alt={card.title}
                      className={`h-full w-full object-cover ${(card as { soldOut?: boolean }).soldOut ? "grayscale" : ""}`}
                    />
                    {(card as { soldOut?: boolean }).soldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#09123c]/45">
                        <span className="rounded-full bg-white px-5 py-2 text-[12px] font-bold uppercase tracking-[0.1em] text-[#09123c]">
                          Sold out
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="grid-bg py-16 sm:py-20 lg:py-18">
        <div className="container-site">
          <div className="text-center">
            <Badge className="mb-6">OUR SERVICES</Badge>
            <h2 className="text-3xl font-bold leading-[1.02] text-[#09123c] sm:text-4xl lg:text-5xl">More Than Property Sales.</h2>
            <p className="mx-auto mt-4 max-w-[650px] text-[15px] leading-[1.35] text-[#4a556a]">
              Secure your place with Elforte, a thoughtfully planned residential estate designed for people who want to own land.
            </p>
          </div>

          <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-[1fr_1.2fr_1fr]">
            {[
              [
                { title: "We Buy Houses", desc: "Sell your property with confidence through a transparent, straightforward process." },
                { title: "We Sell Houses", desc: "Discover quality homes in desirable locations, carefully selected to meet your investment, and ownership goals." },
                { title: "We Build Properties", desc: "From concept to completion, we create thoughtfully designed properties built for comfort, quality, and lasting value." }
              ],
              "image",
              [
                { title: "Property Management", desc: "We manage the properties we build, handle tenant relationships and maintenance, and remit rental income to property owners." },
                { title: "Renovation & Development", desc: "We transform existing properties through strategic renovations and thoughtful development." },
                { title: "Developing Estates", desc: "Explore our portfolio of developing estates planned communities designed to create valuable places to live." }
              ]
            ].map((column, columnIndex) => column === "image" ? (
              <div key="image" className="order-first min-h-[560px] rounded-xl bg-gradient-to-br from-[#ff263c] via-[#f43372] to-[#df238c] p-10 sm:p-12 lg:order-none">
                <img src="/images/change-gate.png" alt="Signature City estate entrance" className="h-full min-h-[480px] w-full rounded-2xl object-cover" />
              </div>
            ) : (
              <div key={columnIndex} className="flex flex-col gap-4">
                {(column as { title: string; desc: string }[]).map((service) => (
                  <div key={service.title} className="flex min-h-[180px] flex-1 flex-col items-start rounded-xl bg-white p-7 sm:min-h-[190px]">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d6eeff] text-[#ff263c]">
                      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 21h18M5 21V9h14v12M8 9V5h8v4M8 13h2M14 13h2M8 17h2M14 17h2" /><path d="M3 9l9-4 9 4" />
                      </svg>
                    </div>
                    <h3 className="mt-5 text-[21px] font-medium leading-[1.05] tracking-[-0.03em] text-[#09123c]">{service.title}</h3>
                    <p className="mt-4 max-w-[360px] text-[15px] leading-[1.35] text-[#4a556a]">{service.desc}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#E4F6FF] py-16 sm:py-20">
        <div className="container-site text-center">
          <Badge className="mb-6">CUSTOMERS STORIES</Badge>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-[#09123c] sm:text-4xl lg:text-5xl">Property Owners Notice the Elforte Difference.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.35] text-[#4a556a]">Real experiences from homeowners and investors who trusted Elforte to help them find, secure, and own the right property.</p>
          
          <div className="mx-auto mt-10 max-w-4xl rounded-xl bg-white p-5 shadow-2xl">
            <div className="grid items-center md:grid-cols-[260px_1fr]">
              <img src={testimonials[activeTestimonial].image} alt={testimonials[activeTestimonial].name} className="h-[250px] w-full rounded-xl object-cover object-[center_25%] md:h-[250px]" />
              <div className="flex flex-col justify-center p-6 text-left md:p-8">
                <div className="mb-4 flex text-xl tracking-[0.12em] text-orange-400">
                  {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                </div>
                <p className="text-[17px] italic leading-[1.45] text-[#4a556a]">
                  “{testimonials[activeTestimonial].quote}”
                </p>
                <div className="mt-5">
                  <div className="font-bold text-[#09123c]">{testimonials[activeTestimonial].name}</div>
                  <div className="text-sm text-[#4a556a]">{testimonials[activeTestimonial].role}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button type="button" aria-label="Previous testimonial" onClick={() => setActiveTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#bdd9ef] bg-white text-xl text-[#09123c] transition-colors hover:bg-slate-50">←</button>
            <button type="button" aria-label="Next testimonial" onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)} className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#cc091b] text-xl text-white transition-opacity hover:opacity-90">→</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-nav bg-white py-20 sm:py-32">
        <div className="container-site">
          <div className="text-center">
            <Badge className="mb-6 bg-slate-100/50">FREQUENTLY ASKED QUESTION</Badge>
            <h2 className="text-3xl font-bold text-[#09123c] sm:text-4xl lg:text-5xl">Questions, Answered.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.35] text-[#4a556a]">Find clear answers about Elforte, Signature City, property ownership, documentation, payment plans, and what to expect before you buy.</p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1.5fr]">
            <div className="overflow-hidden rounded-xl border border-[#bdd9ef] bg-[#d6eeff] shadow-lg">
              <img src="/images/change-gate.png" alt="Planning Land" className="h-[360px] w-full object-cover sm:h-[380px]" />
              <div className="p-5">
                <h3 className="text-xl font-bold text-[#09123c]">Planning to Own Land?</h3>
                <p className="mt-2 text-[14px] leading-[1.35] text-[#4a556a]">See Signature City firsthand, explore available plots, and speak with our property team.</p>
                <Button className="mt-5">Book an inspection</Button>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { q: "What is Signature City?", a: "Signature City is a thoughtfully planned residential development by Elforte, created for individuals, families, and investors looking to secure land in a location with room for growth. It offers an organized environment designed to make land ownership and future development easier." },
                { q: "Where is Signature City located?", a: "It is located in a high-growth zone with proximity to major road networks and urban amenities." },
                { q: "How much does a plot cost?", a: "Prices vary based on size and specific location within the estate. Contact us for current pricing." },
                { q: "Can I pay in installments?", a: "Yes, we offer flexible payment plans designed to match your financial goals." },
                { q: "Can I inspect the property before buying?", a: "Absolutely! We encourage on-site inspections before any commitment." },
                { q: "What documents will I receive when I purchase?", a: "You'll receive a contract of sale, allocation letter, and other relevant legal titles." }
              ].map((faq, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-[#bdd9ef] bg-white">
                  <button onClick={() => setActiveFaq(activeFaq === i ? -1 : i)} className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50">
                    <span className="font-bold text-[#09123c]">{faq.q}</span>
                    <span className="text-xl">{activeFaq === i ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden px-5 pb-5">
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

      {/* Why Choose us - Red Section */}
      <section id="why-us" className="benefits-grid scroll-mt-nav py-20 sm:py-24">
        <div className="container-site text-center">
          <Badge className="mb-6 border-0 bg-[#ef3d45] text-white">BENEFITS</Badge>
          <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">Why Choose Elforte?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.35] text-white">Property ownership made clearer, simpler, and more confident—from your first enquiry to the day you secure your property.</p>
          
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "Strategic Locations", d: "Carefully selected properties in locations with accessibility and future development potential.", i: "location" },
              { t: "Clear Documentation", d: "Get the relevant property information and documentation you need before making your decision.", i: "document" },
              { t: "Planned Developments", d: "Invest in thoughtfully planned estates designed with organized layouts and future development in mind.", i: "plan" },
              { t: "Guided From Start to Finish", d: "From inspection to allocation, our team helps you understand each step of the ownership process.", i: "guide" },
              { t: "Flexible Payment Options", d: "Access available payment plans designed to make securing your property more manageable.", i: "payment" },
              { t: "Inspect Before You Commit", d: "Visit the property, explore the location, and make your decision with greater clarity and confidence.", i: "inspect" }
            ].map((item, i) => (
              <div key={i} className="h-full rounded-xl bg-white/10 p-5 text-left shadow-lg">
                <div className="h-full rounded-xl bg-white p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#d6eeff]"><BenefitIcon icon={item.i} /></div>
                  <h3 className="text-lg font-bold text-[#09123c]">{item.t}</h3>
                  <p className="mt-2 text-[13px] leading-[1.45] text-[#4a556a]">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blogs" className="scroll-mt-nav bg-[#d6eeff] py-20 sm:py-32">
        <div className="container-site text-center">
          <Badge className="mb-6">FROM ELFORTE</Badge>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-[#09123c] sm:text-4xl lg:text-5xl">Insights to Help You Make Better Property Decisions.</h2>
          <p className="mt-4 text-[15px] text-[#4a556a]">Explore practical insights on property ownership, land investment, locations, and the things to consider before making your next move.</p>
          <Button to="/blog" className="mt-8 gap-2">Explore Our Insights <span className="text-lg">→</span></Button>
          
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { tag: "Property Guide", title: "Buying Land for the First Time? 7 Things to Check Before You Commit", desc: "Buying land is a major decision. Learn the key things to consider—from location and documentation to accessibility and development plans.", img: "/images/blog-1.jpg", slug: "buying-land-first-time" },
              { tag: "Investment", title: "Land or House: Which Should You Consider First?", desc: "Buying property is a major decision, especially when choosing between land and a completed house.", img: "/images/property-road.jpg", slug: "land-or-house-which-should-you-consider-first" },
              { tag: "Ownership Guide", title: "Land Documentation: What Every Buyer Should Understand", desc: "From title documents to agreements and allocation papers, understand the essential property documents you should review before completing a land purchase.", img: "/images/property-lot.jpg", slug: "land-documentation" }
            ].map((post, i) => (
              <div key={i} className="group flex flex-col overflow-hidden rounded-xl border border-[#bdd9ef] bg-white text-left shadow-md transition-shadow hover:shadow-xl">
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-4 inline-block self-start rounded-full bg-[#d6eeff] px-4 py-1 text-[10px] font-bold text-[#355672] uppercase">{post.tag}</div>
                  <h3 className="text-[18px] font-bold leading-snug text-[#09123c] transition-colors group-hover:text-[#cc091b]">{post.title}</h3>
                  <p className="mt-3 flex-1 text-[13px] leading-relaxed text-[#4a556a]">{post.desc}</p>
                  <Link to={`/blog/${post.slug}`} className="mt-6 inline-flex text-[13px] font-bold underline">Read article</Link>
                </div>
                <div className="h-64 overflow-hidden sm:h-80">
                  <img src={post.img} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <div className="footer-scene relative overflow-hidden bg-[#00031E] pb-8 sm:pb-10">
        <img src="/images/hero-signature-city.png" alt="Signature City estate" className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-100 object-cover opacity-70 blur-[2px]" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[#00031E]/65" />
      <section className="relative z-10 overflow-hidden bg-transparent pb-36 pt-24 sm:pb-44 sm:pt-32">
        <div className="container-site relative z-10 text-center text-white">
          <Badge className="mb-6 bg-white/10 text-white">YOUR NEXT MOVE</Badge>
          <h2 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Ready to See It for Yourself?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">Visit Signature City, explore available plots, and speak with our property team about your next step toward ownership.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="https://wa.me/2349056592894" variant="secondary" className="px-8 py-4">Chat on WhatsApp</Button>
            <Button className="px-8 py-4">Book an inspection</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer-grid relative z-20 mx-auto -mt-24 w-[calc(100%-2rem)] max-w-[1200px] scroll-mt-nav rounded-xl bg-white px-6 pb-28 pt-12 sm:px-10 sm:pb-32 sm:pt-14 lg:px-14">
        <div>
          <div className="grid gap-10 lg:grid-cols-[1.7fr_.7fr_.9fr_1fr]">
            <div>
              <a href="#" aria-label="Elforte home" className="inline-flex items-center">
                <img src="/images/elforte-logo.png" alt="Elforte" className="h-auto w-[132px]" />
              </a>
              <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-[#4a556a]">
                Explore thoughtfully developed properties, secure your ideal plot, and take your next step toward property ownership with clarity and confidence.
              </p>
            </div>
            
            <div>
              <h4 className="mb-6 text-[12px] font-black tracking-widest text-[#09123c]">QUICK LINKS</h4>
              <ul className="space-y-3 text-[13px] text-[#4a556a]">
                <li><a href="#" className="hover:text-[#cc091b]">Home</a></li>
                <li><a href="#about-us" className="hover:text-[#cc091b]">About us</a></li>
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
                    { name: 'X', path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' },
                    { name: 'LinkedIn', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                    { name: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
                    { name: 'Email', path: 'M2 5h20v14H2zM2 6l10 7L22 6' }
                  ].map((social) => (
                    <a key={social.name} href="#" aria-label={social.name} className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#e8e8e8] text-[#09123c] transition-colors hover:text-[#cc091b]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d={social.path} fill={social.name === 'Email' ? 'none' : 'currentColor'} stroke={social.name === 'Email' ? 'currentColor' : 'none'} strokeWidth="1.8" />
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
    </div>
  );
}

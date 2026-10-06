import { footerQuickLinks, footerExplore } from "../data/siteData";

export default function Footer() {
  return (
    <footer className="bg-[#F5FAFF] py-12 sm:py-16">
      <div className="container-main">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div>
            <a
              href="#home"
              className="text-[22px] font-bold tracking-[-0.02em] text-[#0B1B3F]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Elforte
            </a>
            <p className="mt-3 max-w-[260px] text-[13px] leading-[1.7] text-[#4A5D74]">
              Elforte is a thoughtfully developed property brand focused on clear
              documentation, strategic locations, and long-term value for homeowners
              and investors.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B7E94]">
              QUICK LINKS
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerQuickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[13px] text-[#2D4356] transition-colors hover:text-[#0B1B3F]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B7E94]">
              EXPLORE ELFORTE
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerExplore.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[13px] text-[#2D4356] transition-colors hover:text-[#0B1B3F]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#6B7E94]">
              GET IN TOUCH
            </h4>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[#2D4356]">
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7E94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href="mailto:hello@elforte.com" className="transition-colors hover:text-[#0B1B3F]">hello@elforte.com</a>
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7E94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <a href="tel:+2348012345678" className="transition-colors hover:text-[#0B1B3F]">+234 801 234 5678</a>
              </li>
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7E94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Lekki, Lagos, Nigeria</span>
              </li>
            </ul>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com/elforte"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F4FF] text-[#4A5D74] transition-colors hover:bg-[#D1E3EF]"
                aria-label="Instagram"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://twitter.com/elforte"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F4FF] text-[#4A5D74] transition-colors hover:bg-[#D1E3EF]"
                aria-label="Twitter"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/elforte"
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F4FF] text-[#4A5D74] transition-colors hover:bg-[#D1E3EF]"
                aria-label="Facebook"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#D1E3EF] pt-6 sm:flex-row">
          <p className="text-[12px] text-[#6B7E94]">
            © 2024 Elforte. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-[#6B7E94]">
            <a href="#" className="transition-colors hover:text-[#0B1B3F]">Terms of Use</a>
            <a href="#" className="transition-colors hover:text-[#0B1B3F]">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-[#0B1B3F]">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link, useParams } from "react-router-dom";
import InspectionBookingForm from "../components/InspectionBookingForm";
import PropertyCard from "../components/PropertyCard";
import { Button, FaqSection, FooterScene, SiteNav } from "../components/site";
import { getProperties } from "../lib/db";
import type { Property } from "../lib/types";

function getPropertyBySlug(slug: string | undefined): Property | undefined {
  return getProperties().find((p) => p.slug === slug);
}

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const property = getPropertyBySlug(slug);

  if (!property) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <SiteNav />
        <section className="bg-[#E4F6FF] py-20">
          <div className="container-site text-center">
            <h1 className="text-3xl font-bold text-[#09123c] sm:text-4xl">Property not found</h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] text-[#4a556a]">
              This property does not exist. Explore our available properties instead.
            </p>
            <Link
              to="/properties"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[#cc091b] px-6 py-3 text-[13px] font-bold text-white hover:bg-[#b50818]"
            >
              Back to properties
            </Link>
          </div>
        </section>
        <FooterScene />
      </div>
    );
  }

  const detail = property.detail ?? {
    heroImage: property.featuredImage,
    aboutTitle: `About ${property.name}`,
    about: [property.shortDescription, property.description].filter(Boolean),
    whyTitle: "Why this property?",
    why: [],
    whoTitle: "Who is it for?",
    whoIntro: "Suitable for:",
    who: [],
    moveTitle: "Next steps",
    move: [],
  };
  const soldOut = property.status === "Closed" || property.status === "Sold";
  const related = getProperties().filter((p) => p.slug !== property.slug);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#cc091b]/10 selection:text-[#cc091b]">
      <SiteNav />

      {/* Hero band — property name + status, per Figma */}
      <section className="benefits-grid py-14 sm:py-16">
        <div className="container-site relative z-10 text-center">
          <h1 className="mx-auto max-w-[820px] text-[36px] font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-5xl lg:text-[64px] lg:leading-[71px]">
            {property.name}
          </h1>
          <p className="mx-auto mt-4 max-w-[616px] text-[16px] leading-[1.4] text-[#b8cadf] sm:text-[20px] sm:leading-[28px]">
            Each opportunity below is selected based on location potential, land use value, and long-term growth outlook.
          </p>
          <div className="mt-6 flex justify-center">
            {soldOut ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#cc091b] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                {property.status}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                {property.status}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Detail body — image + content, per Figma */}
      <section className="bg-[#E4F6FF] pb-16 pt-8 sm:pb-20 sm:pt-10">
        <div className="container-site">
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 rounded-full border border-[#c8dce8] bg-[#eaf4fc] px-4 py-2 text-[13px] font-semibold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            More properties
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[678px_1fr] lg:gap-12">
            <div>
              <div className="overflow-hidden rounded-xl">
                <img
                  src={detail.heroImage}
                  alt={property.name}
                  className={`aspect-[1118/797] w-full object-cover lg:aspect-[678/777] ${
                    soldOut ? "grayscale" : ""
                  }`}
                />
              </div>
            </div>

            <div className="max-w-[646px] text-[#1e2a3a]">
              <h2 className="text-[18px] font-bold leading-snug text-[#09123c]">{detail.aboutTitle}</h2>
              <div className="mt-3 space-y-4 text-[14px] leading-[1.7] text-[#33415c]">
                {detail.about.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <h2 className="mt-8 text-[18px] font-bold leading-snug text-[#09123c]">{detail.whyTitle}</h2>
              <div className="mt-3 space-y-4 text-[14px] leading-[1.7] text-[#33415c]">
                {detail.why.map((w, i) => (
                  <p key={i}>
                    <strong className="font-bold text-[#09123c]">{w.heading}</strong>
                    <br />
                    {w.text}
                  </p>
                ))}
              </div>

              <h2 className="mt-8 text-[18px] font-bold leading-snug text-[#09123c]">{detail.whoTitle}</h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#33415c]">{detail.whoIntro}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-[1.7] text-[#33415c]">
                {detail.who.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h2 className="mt-8 text-[18px] font-bold leading-snug text-[#09123c]">{detail.moveTitle}</h2>
              <div className="mt-3 space-y-4 text-[14px] leading-[1.7] text-[#33415c]">
                {detail.move.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="mt-8">
                {soldOut ? (
                  <div className="flex flex-col gap-3">
                    <span className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-full bg-[#94a3b8] px-6 py-4 text-[15px] font-bold text-white opacity-80">
                      Sold out — {property.status}
                    </span>
                    <Button to="/properties" variant="outline" className="w-full py-4">
                      Explore available properties
                    </Button>
                  </div>
                ) : (
                  <a
                    href="#book-inspection"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#cc091b] px-6 py-4 text-[15px] font-bold text-white transition-all hover:bg-[#b50818] active:scale-[0.99]"
                  >
                    Book an Inspection
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book inspection — creates an Inspection record in the admin repository */}
      {!soldOut && (
        <section id="book-inspection" className="scroll-mt-nav bg-white py-14 sm:py-16">
          <div className="container-site grid items-start gap-8 lg:grid-cols-[1fr_592px]">
            <div className="max-w-[484px]">
              <span className="inline-flex items-center rounded-full bg-[#eaf4fc] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#09123c]">
                Book Inspection
              </span>
              <h2 className="mt-4 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[#09123c] sm:text-[36px]">
                See {property.name} in person
              </h2>
              <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-[#4a556a]">
                Pick a date and time that works for you. Your request goes straight to our team, who will confirm
                your visit.
              </p>
            </div>
            <InspectionBookingForm propertyId={property.id} propertyName={property.name} />
          </div>
        </section>
      )}

      {/* Related properties — same card system, compact, per Figma */}
      <section className="bg-[#D6EEFF] py-14 sm:py-16">
        <div className="container-site">
          <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#09123c] sm:text-[32px]">
            Related properties
          </h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PropertyCard key={p.slug} property={p} compact />
            ))}
          </div>
        </div>
      </section>

      <FaqSection />
      <FooterScene />
    </div>
  );
}

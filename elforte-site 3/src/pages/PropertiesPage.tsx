import { useMemo, useState } from "react";
import PropertyCard from "../components/PropertyCard";
import { FaqSection, FooterScene, SiteNav } from "../components/site";
import { categoryOptions, landOptions, properties } from "../data/properties";

export default function PropertiesPage() {
  const [land, setLand] = useState("Land");
  const [category, setCategory] = useState("Buy");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (p.landType !== land) return false;
      if (p.category !== category) return false;
      if (q && !`${p.name} ${p.location} ${p.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [land, category, query]);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#cc091b]/10 selection:text-[#cc091b]">
      <SiteNav />

      {/* Hero band — dark navy with grid, per Figma */}
      <section className="benefits-grid py-14 sm:py-16">
        <div className="container-site relative z-10 text-center">
          <h1 className="mx-auto max-w-[820px] text-[36px] font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-5xl lg:text-[64px] lg:leading-[71px]">
            Our Curated Properties
          </h1>
          <p className="mx-auto mt-4 max-w-[582px] text-[16px] leading-[1.4] text-[#b8cadf] sm:text-[20px] sm:leading-[28px]">
            Each opportunity below is selected based on location potential, land use value, and long-term growth outlook.
          </p>
        </div>
      </section>

      {/* Investment Properties + filters — light blue, per Figma */}
      <section className="bg-[#E4F6FF] pb-16 pt-10 sm:pb-20 sm:pt-12">
        <div className="container-site">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-[568px]">
              <h2 className="text-[28px] font-semibold leading-[1.27] tracking-[-0.04em] text-[#09123c] sm:text-[40px] sm:leading-[51px]">
                Investment Properties
              </h2>
              <p className="mt-3 max-w-[534px] text-[16px] font-medium leading-[1.3] text-[#4a556a] sm:text-[20px] sm:leading-[26px]">
                Explore Elforte&apos;s thoughtfully planned properties, each offering a unique opportunity to own land.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <label className="inline-flex items-center gap-2 rounded-full border border-[#c8dce8] bg-[#eaf4fc] px-4 py-2.5 text-[14px] font-semibold text-[#09123c]">
                <span className="sr-only">Land type</span>
                <select
                  value={land}
                  onChange={(e) => setLand(e.target.value)}
                  className="bg-transparent pr-1 outline-none"
                  aria-label="Filter by land type"
                >
                  {landOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>

              <label className="inline-flex items-center gap-2 rounded-full border border-[#c8dce8] bg-[#eaf4fc] px-4 py-2.5 text-[14px] font-semibold text-[#09123c]">
                <span className="sr-only">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent pr-1 outline-none"
                  aria-label="Filter by category"
                >
                  {categoryOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>

              <form
                className="flex flex-1 items-center gap-2 rounded-full border border-[#c8dce8] bg-[#eaf4fc] py-1.5 pl-4 pr-1.5 sm:w-[300px] lg:w-[360px]"
                onSubmit={(e) => e.preventDefault()}
                role="search"
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search properties"
                  aria-label="Search properties"
                  className="w-full bg-transparent text-[14px] font-semibold text-[#09123c] placeholder:text-[#6b8aa0] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="flex h-8 w-10 shrink-0 items-center justify-center rounded-full bg-[#cc091b] text-white transition-opacity hover:opacity-90"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Cards — same widths/gaps as Figma: 3-col desktop, 1-col mobile */}
          {filtered.length > 0 ? (
            <div className="mt-10 grid gap-x-6 gap-y-12 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <PropertyCard key={p.slug} property={p} />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-xl border border-[#bdd9ef] bg-white p-10 text-center">
              <h3 className="text-xl font-bold text-[#09123c]">No properties match your search</h3>
              <p className="mx-auto mt-2 max-w-md text-[14px] text-[#4a556a]">
                Try a different keyword or reset the filters to see all available properties.
              </p>
              <button
                onClick={() => {
                  setLand("Land");
                  setCategory("Buy");
                  setQuery("");
                }}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#cc091b] px-6 py-3 text-[13px] font-bold text-white transition-all hover:bg-[#b50818] active:scale-95"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      <FaqSection />
      <FooterScene />
    </div>
  );
}

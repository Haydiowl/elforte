import { BlogGrid, BlogHero } from "../components/blogCards";
import { FooterScene, SiteNav } from "../components/site";
import { articles } from "../data/articles";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#cc091b]/10 selection:text-[#cc091b]">
      <SiteNav />
      <BlogHero
        title="Blog Section"
        subtitle="Each opportunity below is selected based on location potential, land use value, and long-term growth outlook."
      />

      <section className="bg-[#F5F7FA] pb-16 pt-10 sm:pb-20 sm:pt-12">
        <div className="container-site">
          <div className="max-w-[531px]">
            <h2 className="text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#09123c] sm:text-[36px]">
              Ideas to Help You Make Better Property Decisions
            </h2>
            <p className="mt-4 text-[15px] leading-[1.6] text-[#4a556a] sm:text-[16px]">
              From buying your first plot to choosing a home and understanding the property market, explore
              practical insights designed to help you make more informed real estate decisions.
            </p>
          </div>

          <hr className="my-8 border-[#dce4ea]" />

          <BlogGrid items={articles} />
        </div>
      </section>

      <FooterScene />
    </div>
  );
}

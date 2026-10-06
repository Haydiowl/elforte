import { Link } from "react-router-dom";
import type { Article } from "../data/articles";

// --- BlogHero: dark navy band with centered title, per Figma ---
export function BlogHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="benefits-grid py-14 sm:py-16">
      <div className="container-site relative z-10 text-center">
        <h1 className="mx-auto max-w-[820px] text-[36px] font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-5xl lg:text-[64px] lg:leading-[71px]">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-[616px] text-[16px] leading-[1.4] text-[#b8cadf] sm:text-[20px] sm:leading-[28px]">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

// --- ArticleCard: tag pill + title + excerpt + Read article + image, per Figma ---
export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#e3e9f0] bg-white p-5 sm:p-6">
      <div className="flex flex-1 flex-col">
        <span className="inline-block self-start rounded-full bg-[#eaf4fc] px-4 py-1 text-[11px] font-semibold text-[#355672]">
          {article.tag}
        </span>
        <Link to={`/blog/${article.slug}`} className="mt-4">
          <h3 className="text-[17px] font-bold leading-snug text-[#09123c] transition-colors group-hover:text-[#cc091b]">
            {article.title}
          </h3>
        </Link>
        <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#4a556a]">{article.excerpt}</p>
        <div className="mt-4">
          <Link
            to={`/blog/${article.slug}`}
            className="inline-flex items-center rounded-full border border-[#b5cfe0] px-4 py-1.5 text-[12.5px] font-semibold text-[#09123c] transition-all duration-200 hover:border-[#09123c] hover:shadow-sm"
          >
            Read article
          </Link>
        </div>
      </div>
      <Link to={`/blog/${article.slug}`} className="mt-5 block overflow-hidden rounded-lg" aria-label={`Read: ${article.title}`}>
        <img
          src={article.image}
          alt={article.title}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </Link>
    </article>
  );
}

// --- BlogGrid: 1-col mobile, 2-col tablet, 3-col desktop, per Figma ---
export function BlogGrid({ items }: { items: Article[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => (
        <ArticleCard key={a.slug} article={a} />
      ))}
    </div>
  );
}

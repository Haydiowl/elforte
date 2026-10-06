import { Link, useParams } from "react-router-dom";
import { ArticleCard } from "../components/blogCards";
import { FooterScene, SiteNav } from "../components/site";
import { articles, getArticle, type Article } from "../data/articles";

function ArticleBody({ article }: { article: Article }) {
  // Structured Figma-style sections when present, plain paragraphs otherwise.
  if (article.sections && article.sections.length > 0) {
    return (
      <div>
        {article.intro?.map((p, i) => (
          <p key={i} className="mt-4 text-[15px] leading-[1.75] text-[#33415c] first:mt-0">
            {p}
          </p>
        ))}
        {article.sections.map((s, i) => (
          <div key={i}>
            <h2 className="mt-8 text-[17px] font-bold leading-snug text-[#09123c]">{s.heading}</h2>
            <div className="mt-3 space-y-3 text-[15px] leading-[1.75] text-[#33415c]">
              {s.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
              {s.listIntro && <p>{s.listIntro}</p>}
              {s.bullets && (
                <ul className="list-disc space-y-1 pl-5">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {s.extraLists?.map((l) => (
                <div key={l.intro}>
                  <p>{l.intro}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {l.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {s.closing?.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
            <hr className="mt-8 border-[#dce4ea]" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-8 space-y-5 text-[15px] leading-[1.8] text-[#33415c]">
      <p className="text-[17px] font-medium text-[#09123c]">{article.excerpt}</p>
      {article.body.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export default function BlogPostPage({
  showRelated = false,
  showBack = false,
}: {
  showRelated?: boolean;
  showBack?: boolean;
}) {
  const { slug } = useParams();
  const article = getArticle(slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <SiteNav />
        <section className="bg-white py-20">
          <div className="container-site text-center">
            <h1 className="text-3xl font-bold text-[#09123c] sm:text-4xl">Article not found</h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] text-[#4a556a]">
              This article does not exist. Explore our other property insights instead.
            </p>
            <Link
              to="/blog"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[#cc091b] px-6 py-3 text-[13px] font-bold text-white hover:bg-[#b50818]"
            >
              Back to blog
            </Link>
          </div>
        </section>
        <FooterScene />
      </div>
    );
  }

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#cc091b]/10 selection:text-[#cc091b]">
      <SiteNav />

      <article className="bg-white pb-16 pt-10 sm:pb-20 sm:pt-12">
        <div className="container-site">
          {showBack && (
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-[#c8dce8] bg-white px-4 py-2 text-[13px] font-semibold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            More articles
          </Link>
          )}

          {/* Headline block — centered, per Figma */}
          <div className="mx-auto mt-2 max-w-[736px] text-center">
            <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#09123c] sm:text-[44px]">
              {article.title}
            </h1>
            <p className="mx-auto mt-4 max-w-[678px] text-[15px] leading-[1.6] text-[#4a556a] sm:text-[17px]">
              {article.excerpt}
            </p>
            {article.date && (
              <p className="mt-3 text-[12px] font-medium tracking-wide text-[#6b8aa0]">{article.date}</p>
            )}
          </div>

          {/* Featured image — full container width, per Figma */}
          <div className="mt-8 overflow-hidden rounded-xl">
            <img src={article.image} alt={article.title} className="aspect-[1360/480] w-full object-cover" />
          </div>

          {/* Reading column — per Figma */}
          <div className="mt-8">
            <ArticleBody article={article} />
          </div>

          {showRelated && related.length > 0 && (
            <div className="mt-16">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#09123c]">
                Related articles
              </h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {related.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <FooterScene />
    </div>
  );
}

import { Link, useParams } from "react-router-dom";
import { ArticleCard } from "../components/blogCards";
import { FooterScene, SiteNav } from "../components/site";
import { getArticles } from "../lib/db";
import type { Blog } from "../lib/types";

function getArticleBySlug(slug: string | undefined): Blog | undefined {
  return getArticles().find((a) => a.slug === slug);
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return null;
  }
}

export default function BlogPostPage({
  showRelated = false,
  showBack = false,
}: {
  showRelated?: boolean;
  showBack?: boolean;
}) {
  const { slug } = useParams();
  const article = getArticleBySlug(slug);

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

  const related = getArticles()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  const publishedDate = formatDate(article.publishedAt);

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

          {/* Headline block — centered */}
          <div className="mx-auto mt-2 max-w-[736px] text-center">
            <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#09123c] sm:text-[44px]">
              {article.title}
            </h1>
            <p className="mx-auto mt-4 max-w-[678px] text-[15px] leading-[1.6] text-[#4a556a] sm:text-[17px]">
              {article.excerpt}
            </p>
            {publishedDate && (
              <p className="mt-3 text-[12px] font-medium tracking-wide text-[#6b8aa0]">{publishedDate}</p>
            )}
          </div>

          {/* Featured image — full container width */}
          <div className="mt-8 overflow-hidden rounded-xl">
            <img src={article.featuredImage} alt={article.title} className="aspect-[1360/480] w-full object-cover" />
          </div>

          {/* Reading column */}
          <div className="mx-auto mt-8 max-w-[768px]">
            <div
              className="prose-sm text-[15px] leading-[1.8] text-[#33415c] [&_a]:text-[#cc091b] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#c8dce8] [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-8 [&_h2]:text-[18px] [&_h2]:font-bold [&_h2]:text-[#09123c] [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_hr]:my-8 [&_hr]:border-[#dce4ea]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
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

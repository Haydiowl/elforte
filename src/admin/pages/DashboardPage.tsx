import { useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { getProperties, getInquiries, getInspections, getClients, getActivities, getArticles } from "../../lib/db";
import { getCurrentUser } from "../../lib/auth";
import { can, canAccessProperty } from "../../lib/permissions";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff) || diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(iso);
}

type RangeKey = "7d" | "month" | "30d";

const RANGES: { key: RangeKey; label: string; days: number | "month" }[] = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "month", label: "This month", days: "month" },
  { key: "30d", label: "Last 30 days", days: 30 },
];

function rangeStart(range: RangeKey): Date {
  const now = new Date();
  if (range === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  const days = range === "7d" ? 7 : 30;
  const d = new Date(now);
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function DashboardPage() {
  const [range, setRange] = useState<RangeKey>("month");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const properties = getProperties().filter((p) => canAccessProperty(p.id));
  const inquiries = getInquiries();
  const inspections = getInspections();
  const clients = getClients();
  const articles = getArticles();
  const user = getCurrentUser();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "Admin";

  const availableCount = properties.filter((p) => p.status === "Available").length;
  const newCount = inquiries.filter((i) => i.status === "New").length;
  const upcoming = inspections
    .filter((i) => i.status === "Scheduled" || i.status === "Confirmed")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const publishedArticles = articles.filter((a) => a.status === "Published");
  const draftArticles = articles.filter((a) => a.status === "Draft");
  const nextInspection = upcoming[0];

  const start = rangeStart(range);
  const rangedInquiries = inquiries.filter((i) => new Date(i.createdAt) >= start);
  const dayCount = range === "7d" ? 7 : range === "month" ? new Date().getDate() : 30;
  const buckets: { key: string; label: string; count: number }[] = [];
  for (let d = dayCount - 1; d >= 0; d--) {
    const day = new Date();
    day.setDate(day.getDate() - d);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    const count = rangedInquiries.filter((i) => {
      const t = new Date(i.createdAt).getTime();
      return t >= day.getTime() && t < next.getTime();
    }).length;
    buckets.push({
      key: day.toISOString(),
      label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      count,
    });
  }
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));
  const chartPoints = buckets
    .map((b, i) => {
      const x = buckets.length === 1 ? 50 : (i / (buckets.length - 1)) * 100;
      const y = 100 - (b.count / maxBucket) * 88;
      return `${x},${y}`;
    })
    .join(" ");

  const activities = getActivities()
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const recentInquiries = [...inquiries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const propertiesMissingImages = properties.filter((p) => !p.featuredImage || p.featuredImage === "");
  const unpublishedDrafts = properties.filter((p) => p.status === "Draft");
  const alertCount = propertiesMissingImages.length + unpublishedDrafts.length + newCount;

  return (
    <div className="-m-4 min-h-full bg-[var(--admin-bg)] p-4 text-[var(--admin-text)] sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[var(--admin-muted)]">
        <span>Elforte Admin</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] normal-case tracking-normal">
          {user?.role ?? "Admin"}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-white sm:text-[36px]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-[14px] text-[var(--admin-muted)]">Here&apos;s what&apos;s happening across Elforte today.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            aria-label="Chart date range"
            className="rounded-full border border-white/10 bg-[var(--admin-surface)] px-4 py-2.5 text-[13px] font-semibold text-white outline-none transition-colors focus:border-white/30"
          >
            {RANGES.map((r) => (
              <option key={r.key} value={r.key} className="bg-[#141b33] text-white">
                {r.label}
              </option>
            ))}
          </select>
          {can("properties", "create") && (
            <Link
              to="/admin/properties/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#cc091b] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
            >
              <span aria-hidden="true">+</span> Add property
            </Link>
          )}
        </div>
      </div>

      {alertCount > 0 && (
        <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 p-5">
          <h3 className="text-[15px] font-bold text-amber-200">Attention Needed</h3>
          <ul className="mt-2 space-y-1.5 text-[13px] text-amber-100/90">
            {propertiesMissingImages.length > 0 && (
              <li>• {propertiesMissingImages.length} propert{propertiesMissingImages.length === 1 ? "y is" : "ies are"} missing a featured image</li>
            )}
            {unpublishedDrafts.length > 0 && (
              <li>• {unpublishedDrafts.length} unpublished draft{unpublishedDrafts.length === 1 ? "" : "s"}</li>
            )}
            {newCount > 0 && <li>• {newCount} new inquir{newCount === 1 ? "y" : "ies"} waiting for response</li>}
          </ul>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard dark label="Total properties" value={String(properties.length)} trend={`${availableCount} available now`} trendUp={availableCount > 0} />
        <StatCard dark label="Total inquiries" value={String(inquiries.length)} trend={`${newCount} new`} trendUp={newCount > 0} />
        <StatCard dark label="Upcoming inspections" value={String(upcoming.length)} trend={nextInspection ? `Next: ${formatDate(nextInspection.date)}` : "None scheduled"} trendUp={upcoming.length > 0} />
        <StatCard dark label="Published articles" value={String(publishedArticles.length)} trend={`${draftArticles.length} draft${draftArticles.length === 1 ? "" : "s"}`} trendUp={publishedArticles.length > 0} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[var(--admin-surface)] p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-white">Inquiry activity</h3>
              <p className="mt-1 text-[13px] text-[var(--admin-muted)]">
                New inquiries per day · {RANGES.find((r) => r.key === range)?.label}
              </p>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-[12px] font-bold text-white">
              {rangedInquiries.length} total
            </span>
          </div>
          {rangedInquiries.length === 0 ? (
            <div className="mt-4 flex h-[300px] items-center justify-center text-sm text-[var(--admin-muted)]">
              No data available for this range
            </div>
          ) : (
            <div className="mt-4" onMouseLeave={() => setHoverIndex(null)}>
              <div className="flex gap-2">
                <div className="flex h-[300px] w-16 shrink-0 flex-col justify-between py-1 text-right text-[11px] text-[#8B9098]" aria-hidden="true">
                  <span>{maxBucket}</span>
                  <span>{Math.ceil(maxBucket / 2)}</span>
                  <span>0</span>
                </div>
                <div
                  className="relative min-w-0 flex-1"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    const idx = Math.round(ratio * (buckets.length - 1));
                    setHoverIndex(Math.max(0, Math.min(buckets.length - 1, idx)));
                  }}
                >
                  <svg viewBox="0 0 100 104" preserveAspectRatio="none" className="h-[300px] w-full" role="img" aria-label="Inquiries per day chart">
                    <defs>
                      <linearGradient id="elforte-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#cc091b" stopOpacity="0.42" />
                        <stop offset="45%" stopColor="#cc091b" stopOpacity="0.20" />
                        <stop offset="100%" stopColor="#cc091b" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon points={`0,104 ${chartPoints} 100,104`} fill="url(#elforte-area)" />
                    {[25, 50, 75].map((y) => (
                      <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" strokeWidth="0.4" />
                    ))}
                    <polyline points={chartPoints} fill="none" stroke="#e5484d" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                    {hoverIndex !== null && buckets[hoverIndex] && (() => {
                      const x = buckets.length === 1 ? 50 : (hoverIndex / (buckets.length - 1)) * 100;
                      const y = 100 - (buckets[hoverIndex].count / maxBucket) * 88;
                      return <circle cx={x} cy={y} r={3.5} fill="#F5F5F7" stroke="#131315" strokeWidth={2} vectorEffect="non-scaling-stroke" />;
                    })()}
                  </svg>
                  {hoverIndex !== null && buckets[hoverIndex] && (() => {
                    const x = buckets.length === 1 ? 50 : (hoverIndex / (buckets.length - 1)) * 100;
                    return (
                      <div
                        className="pointer-events-none absolute top-2 z-10 rounded-lg border px-3 py-1.5 text-[12px]"
                        style={{
                          left: `${Math.min(85, Math.max(0, x))}%`,
                          transform: "translateX(-50%)",
                          backgroundColor: "#1C1D22",
                          borderColor: "#26262F",
                          color: "#F5F5F7",
                        }}
                      >
                        <div className="font-semibold">{buckets[hoverIndex].label}</div>
                        <div className="text-[#8B9098]">{buckets[hoverIndex].count} {buckets[hoverIndex].count === 1 ? "inquiry" : "inquiries"}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="mt-2 flex justify-between pl-[72px] text-[11px] text-[#8B9098]">
                <span>{buckets[0]?.label}</span>
                <span>{buckets[Math.floor(buckets.length / 2)]?.label}</span>
                <span>{buckets[buckets.length - 1]?.label}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[var(--admin-surface)] p-5 sm:p-6">
          <h3 className="text-[16px] font-bold text-white">Recent activity</h3>
          <p className="mt-1 text-[13px] text-[var(--admin-muted)]">The latest across your workspace</p>
          {activities.length === 0 ? (
            <p className="mt-4 text-[14px] text-[var(--admin-muted)]">No recent activity.</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {activities.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white" aria-hidden="true">
                    {a.entityType.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-white">{a.action}</div>
                    <div className="truncate text-[12px] text-[var(--admin-muted)]">{a.entityType}</div>
                    <div className="text-[11px] text-[var(--admin-muted)]">{relativeTime(a.timestamp)}</div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-white">Your properties</h2>
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]">A quick look at your real estate portfolio</p>
          </div>
          <Link to="/admin/properties" className="text-[13px] font-bold text-[#ff6b76] hover:underline">
            View all properties →
          </Link>
        </div>
        {properties.length === 0 ? (
          <p className="mt-4 text-[14px] text-[var(--admin-muted)]">No properties yet.</p>
        ) : (
          <PropertyCards />
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[var(--admin-surface)] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-white">Recent inquiries</h3>
              <p className="mt-1 text-[13px] text-[var(--admin-muted)]">People taking the next step</p>
            </div>
            <Link to="/admin/inquiries" className="text-[13px] font-bold text-[#ff6b76] hover:underline">
              View all →
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="mt-4 text-[14px] text-[var(--admin-muted)]">No recent inquiries.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentInquiries.map((i) => {
                const client = clients.find((c) => c.id === i.clientId);
                const property = properties.find((p) => p.id === i.propertyId);
                return (
                  <div key={i.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-bold text-white">{client?.name ?? i.source}</div>
                      <div className="truncate text-[12px] text-[var(--admin-muted)]">{property?.name ?? "General inquiry"} · {formatDate(i.createdAt)}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white">{i.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-[var(--admin-surface)] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-white">Upcoming inspections</h3>
              <p className="mt-1 text-[13px] text-[var(--admin-muted)]">Scheduled and confirmed visits</p>
            </div>
            <Link to="/admin/inspections" className="text-[13px] font-bold text-[#ff6b76] hover:underline">
              View all →
            </Link>
          </div>
          {upcoming.slice(0, 4).length === 0 ? (
            <p className="mt-4 text-[14px] text-[var(--admin-muted)]">No upcoming inspections.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {upcoming.slice(0, 4).map((i) => {
                const property = properties.find((p) => p.id === i.propertyId);
                return (
                  <div key={i.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-bold text-white">{property?.name ?? "Unknown property"}</div>
                      <div className="text-[12px] text-[var(--admin-muted)]">{formatDate(i.date)} · {i.time}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white">{i.status}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-[var(--admin-surface)] p-5 sm:p-6">
        <h3 className="text-[16px] font-bold text-white">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {can("properties", "create") && (
            <Link to="/admin/properties/new" className="rounded-full bg-[#cc091b] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]">
              Add Property
            </Link>
          )}
          {can("blog", "create") && (
            <Link to="/admin/blog/new" className="rounded-full border border-white/15 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:border-white/40">
              Create Blog Post
            </Link>
          )}
          <Link to="/admin/inquiries" className="rounded-full border border-white/15 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:border-white/40">
            View Inquiries
          </Link>
          {can("staff", "create") && (
            <Link to="/admin/staff" className="rounded-full border border-white/15 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:border-white/40">
              Add Staff
            </Link>
          )}
          <Link to="/admin/inspections" className="rounded-full border border-white/15 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:border-white/40">
            Schedule Inspection
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 pt-2 text-[12px] text-[var(--admin-muted)] sm:flex-row">
        <span>© 2026 Elforte Realty. All rights reserved.</span>
        <span><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />Local data</span>
      </div>
    </div>
  );

  function PropertyCards() {
    const top = properties
      .map((p) => ({ ...p, inquiriesCount: inquiries.filter((i) => i.propertyId === p.id).length }))
      .sort((a, b) => b.inquiriesCount - a.inquiriesCount)
      .slice(0, 3);
    if (top.length === 0) return <p className="mt-4 text-[14px] text-[var(--admin-muted)]">No properties yet.</p>;
    return (
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((p) => (
          <Link
            key={p.id}
            to={`/admin/properties/${p.id}`}
            className="group overflow-hidden rounded-xl border border-white/10 bg-[var(--admin-surface)] transition-colors hover:border-white/25"
          >
            <div className="relative">
              <img src={p.featuredImage || "/images/property-lot.jpg"} alt={p.name} className="aspect-[16/10] w-full object-cover" loading="lazy" />
              <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${p.status === "Available" ? "bg-emerald-100 text-emerald-800" : p.status === "Closed" ? "bg-slate-200 text-slate-700" : "bg-white/90 text-[#09123c]"}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{p.status}
              </span>
            </div>
            <div className="p-4">
              <div className="text-[15px] font-bold text-white">{p.name}</div>
              <div className="mt-1 text-[13px] text-[var(--admin-muted)]">{p.location}</div>
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-[12px] text-[var(--admin-muted)]">{p.propertyType}</span>
                <span className="text-[12px] font-bold text-white transition-colors group-hover:text-[#ff6b76]">View details ↗</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }
}

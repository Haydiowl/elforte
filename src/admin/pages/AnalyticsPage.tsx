import { useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import { getProperties, getInquiries, getInspections, getClients } from "../../lib/db";

const TIME_FILTERS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "3 months", days: 90 },
  { label: "6 months", days: 180 },
  { label: "12 months", days: 365 },
];

const SOURCES = ["Website", "Instagram", "Facebook", "Referral", "Direct", "Other"];

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState(30);

  const properties = getProperties();
  const inquiries = getInquiries();
  const inspections = getInspections();
  const clients = getClients();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - timeFilter);

  const filteredInquiries = useMemo(
    () => inquiries.filter((i) => new Date(i.createdAt) >= cutoff),
    [inquiries, timeFilter]
  );
  const filteredInspections = useMemo(
    () => inspections.filter((i) => new Date(i.date) >= cutoff),
    [inspections, timeFilter]
  );

  const available = properties.filter((p) => p.status === "Available").length;
  const closed = properties.filter((p) => p.status === "Closed" || p.status === "Sold").length;
  const newInquiries = filteredInquiries.filter((i) => i.status === "New").length;
  const convertedClients = clients.filter((c) => c.status === "Purchased").length;

  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SOURCES.forEach((s) => (counts[s] = 0));
    filteredInquiries.forEach((i) => {
      const src = SOURCES.includes(i.source) ? i.source : "Other";
      counts[src] = (counts[src] ?? 0) + 1;
    });
    return counts;
  }, [filteredInquiries]);

  const propertyStats = useMemo(() => {
    return properties.map((p) => {
      const pInquiries = inquiries.filter((i) => i.propertyId === p.id).length;
      const pInspections = inspections.filter((i) => i.propertyId === p.id).length;
      const pConversions = clients.filter((c) => c.interestedPropertyIds.includes(p.id) && c.status === "Purchased").length;
      const conversionRate = pInquiries > 0 ? ((pConversions / pInquiries) * 100).toFixed(1) : "0.0";
      return { ...p, inquiries: pInquiries, inspections: pInspections, conversions: pConversions, conversionRate };
    });
  }, [properties, inquiries, inspections, clients]);

  const hasData = properties.length > 0 || filteredInquiries.length > 0 || filteredInspections.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#09123c]">Analytics</h2>
          <p className="mt-1 text-[14px] text-[#6b8aa0]">Performance insights derived from your data.</p>
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-full border border-[#e3e9f0] bg-white p-1">
          {TIME_FILTERS.map((t) => (
            <button
              key={t.days}
              onClick={() => setTimeFilter(t.days)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors ${
                timeFilter === t.days ? "bg-[#09123c] text-white" : "text-[#6b8aa0] hover:text-[#09123c]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Properties" value={String(properties.length)} />
        <StatCard label="Available" value={String(available)} />
        <StatCard label="Closed / Sold" value={String(closed)} />
        <StatCard label="Total Clients" value={String(clients.length)} />
        <StatCard label="New Inquiries" value={String(newInquiries)} />
        <StatCard label="Inspections" value={String(filteredInspections.length)} />
        <StatCard label="Converted Clients" value={String(convertedClients)} />
        <StatCard label="Total Inquiries" value={String(filteredInquiries.length)} />
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-12 text-center ">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf4fc]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#09123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 15l4-6 4 3 5-8" />
            </svg>
          </div>
          <h3 className="mt-4 text-[16px] font-bold text-[#09123c]">No data available</h3>
          <p className="mx-auto mt-2 max-w-sm text-[14px] text-[#6b8aa0]">
            Add properties, clients, and inquiries to see analytics here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
              <h3 className="text-[16px] font-bold text-[#09123c]">Lead Sources</h3>
              <div className="mt-4 space-y-3">
                {SOURCES.map((source) => {
                  const count = sourceCounts[source] ?? 0;
                  const max = Math.max(...Object.values(sourceCounts), 1);
                  const pct = Math.round((count / max) * 100);
                  return (
                    <div key={source}>
                      <div className="flex justify-between text-[13px]">
                        <span className="font-medium text-[#09123c]">{source}</span>
                        <span className="text-[#6b8aa0]">{count}</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-[#e2e8f0]">
                        <div className="h-2 rounded-full bg-[#cc091b]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
              <h3 className="text-[16px] font-bold text-[#09123c]">Inquiry Status Funnel</h3>
              <div className="mt-4 space-y-3">
                {["New", "Contacted", "Qualified", "Inspection Scheduled", "Converted", "Closed"].map((status) => {
                  const count = filteredInquiries.filter((i) => i.status === status).length;
                  const total = filteredInquiries.length || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-[13px]">
                        <span className="font-medium text-[#09123c]">{status}</span>
                        <span className="text-[#6b8aa0]">{count} ({pct}%)</span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-[#e2e8f0]">
                        <div className="h-2 rounded-full bg-[#09123c]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
            <h3 className="text-[16px] font-bold text-[#09123c]">Property Performance</h3>
            {propertyStats.length === 0 ? (
              <p className="mt-4 text-[14px] text-[#6b8aa0]">No properties to analyze.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#e3e9f0]">
                      <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Property</th>
                      <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Views</th>
                      <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Inquiries</th>
                      <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Inspections</th>
                      <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Conversions</th>
                      <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {propertyStats.map((p) => (
                      <tr key={p.id} className="hover:bg-[#f8fafc]">
                        <td className="px-4 py-3 font-semibold text-[#09123c]">{p.name}</td>
                        <td className="px-4 py-3 text-[#4a556a]">{p.views}</td>
                        <td className="px-4 py-3 text-[#4a556a]">{p.inquiries}</td>
                        <td className="px-4 py-3 text-[#4a556a]">{p.inspections}</td>
                        <td className="px-4 py-3 text-[#4a556a]">{p.conversions}</td>
                        <td className="px-4 py-3 text-[#4a556a]">{p.conversionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
            <h3 className="text-[16px] font-bold text-[#09123c]">Recent Inquiries</h3>
            {filteredInquiries.length === 0 ? (
              <p className="mt-4 text-[14px] text-[#6b8aa0]">No inquiries in this period.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {filteredInquiries.slice(0, 5).map((i) => (
                  <div key={i.id} className="flex items-center justify-between rounded-lg border border-[#e3e9f0] p-3">
                    <div>
                      <div className="text-[13px] font-bold text-[#09123c]">{i.source}</div>
                      <div className="text-[12px] text-[#6b8aa0]">{formatDate(i.createdAt)}</div>
                    </div>
                    <span className="rounded-full bg-[#eaf4fc] px-2.5 py-0.5 text-[11px] font-bold text-[#09123c]">{i.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

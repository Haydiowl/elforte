import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getClient, getInquiries, getInspections, updateClient } from "../../lib/db";
import type { Client } from "../../lib/types";

const STATUSES: Client["status"][] = ["New", "Contacted", "Interested", "Inspection Scheduled", "Purchased", "Not Interested", "Lost"];

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = getClient(id!);
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [editingNotes, setEditingNotes] = useState(false);

  if (!client) {
    return (
      <div className="space-y-6">
        <Link to="/admin/clients" className="text-[13px] font-semibold text-[#09123c] hover:text-[#cc091b]">
          ← Back to clients
        </Link>
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-12 text-center">
          <h2 className="text-[20px] font-bold text-[#09123c]">Client not found</h2>
          <p className="mt-2 text-[14px] text-[#6b8aa0]">This client may have been deleted.</p>
        </div>
      </div>
    );
  }

  const inquiries = getInquiries().filter((i) => i.clientId === client!.id);
  const inspections = getInspections().filter((i) => i.clientId === client!.id);

  function handleStatusChange(status: Client["status"]) {
    updateClient(client!.id, { status });
    navigate(`/admin/clients`);
  }

  function handleSaveNotes() {
    updateClient(client!.id, { notes });
    setEditingNotes(false);
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/clients" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#09123c] hover:text-[#cc091b]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to clients
      </Link>

      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-[24px] font-bold text-[#09123c]">{client.name}</h2>
            <p className="mt-1 text-[14px] text-[#6b8aa0]">{client.company || "Individual"}</p>
          </div>
          <select
            value={client.status}
            onChange={(e) => handleStatusChange(e.target.value as Client["status"])}
            className="rounded-full border border-[#e3e9f0] bg-white px-4 py-2 text-[13px] font-semibold text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6]"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Email</div>
            <div className="mt-1 text-[14px] text-[#09123c]">{client.email}</div>
          </div>
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Phone</div>
            <div className="mt-1 text-[14px] text-[#09123c]">{client.phone}</div>
          </div>
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Source</div>
            <div className="mt-1 text-[14px] text-[#09123c]">{client.source}</div>
          </div>
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Created</div>
            <div className="mt-1 text-[14px] text-[#09123c]">{formatDate(client.createdAt)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
          <h3 className="text-[16px] font-bold text-[#09123c]">Inquiry History</h3>
          {inquiries.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#6b8aa0]">No inquiries yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="rounded-lg border border-[#e3e9f0] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#09123c]">{inq.source}</span>
                    <span className="text-[12px] text-[#6b8aa0]">{formatDate(inq.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-[#4a556a]">{inq.message}</p>
                  <span className="mt-2 inline-block rounded-full bg-[#eaf4fc] px-2.5 py-0.5 text-[11px] font-bold text-[#09123c]">
                    {inq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
          <h3 className="text-[16px] font-bold text-[#09123c]">Inspection History</h3>
          {inspections.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#6b8aa0]">No inspections scheduled.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {inspections.map((insp) => (
                <div key={insp.id} className="rounded-lg border border-[#e3e9f0] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#09123c]">{formatDate(insp.date)}</span>
                    <span className="text-[12px] text-[#6b8aa0]">{insp.time}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-[#4a556a]">{insp.notes || "No notes"}</p>
                  <span className="mt-2 inline-block rounded-full bg-[#eaf4fc] px-2.5 py-0.5 text-[11px] font-bold text-[#09123c]">
                    {insp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#09123c]">Notes</h3>
          {!editingNotes && (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-[13px] font-bold text-[#cc091b] hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        {editingNotes ? (
          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-[#dce4ea] px-4 py-3 text-[14px] text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6] focus:ring-2 focus:ring-[#8ab5d6]/40"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSaveNotes}
                className="rounded-full bg-[#cc091b] px-5 py-2 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNotes(client.notes);
                  setEditingNotes(false);
                }}
                className="rounded-full border border-[#c8dce8] px-5 py-2 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-[14px] text-[#4a556a]">{client.notes || "No notes yet."}</p>
        )}
      </div>
    </div>
  );
}

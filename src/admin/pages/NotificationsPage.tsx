import { useState } from "react";
import { getNotifications, createNotification, markNotificationRead, markAllNotificationsRead } from "../../lib/db";
import { getClients, getStaff } from "../../lib/db";

const TYPES = ["General", "Property", "Inspection", "Follow-up", "Announcement", "Reminder"];

export default function NotificationsPage() {
  const [audience, setAudience] = useState<"Staff" | "Client">("Staff");
  const [recipientId, setRecipientId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("General");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterRead, setFilterRead] = useState<"All" | "Unread" | "Read">("All");
  const [, setRefresh] = useState(0);

  const clients = getClients();
  const staff = getStaff();
  const allNotifications = getNotifications("system").concat(getNotifications("admin@elforte.com")).filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);

  const filtered = allNotifications.filter((n) => {
    const q = search.trim().toLowerCase();
    return (!q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)) &&
      (filterType === "All" || n.type === filterType) &&
      (filterRead === "All" || (filterRead === "Unread" ? !n.read : n.read));
  });

  function handleSend() {
    const recipient =
      audience === "Staff"
        ? staff.find((s) => s.id === recipientId)?.email ?? recipientId
        : clients.find((c) => c.id === recipientId)?.email ?? recipientId;
    if (!recipient || !title.trim() || !message.trim()) return;
    createNotification({
      userId: recipient,
      type,
      title: title.trim(),
      message: message.trim(),
      entityType: audience.toLowerCase(),
      entityId: recipientId,
      read: false,
    });
    setTitle("");
    setMessage("");
    setRecipientId("");
    setRefresh((r) => r + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-bold text-[#09123c]">Notifications</h2>
        <p className="mt-1 text-[14px] text-[#6b8aa0]">Send and manage notifications for staff and clients.</p>
      </div>

      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6">
        <h3 className="text-[16px] font-bold text-[#09123c]">Create notification</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <select value={audience} onChange={(e) => setAudience(e.target.value as any)} className="admin-input rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px]">
            <option value="Staff">Staff</option>
            <option value="Client">Client</option>
          </select>
          <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} className="admin-input rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px]">
            <option value="">Select recipient</option>
            {audience === "Staff" &&
              staff.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            {audience === "Client" &&
              clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className="admin-input rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px]">
            {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="admin-input rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px]" />
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" rows={3} className="admin-input mt-4 w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px]" />
        <button onClick={handleSend} className="admin-btn mt-4 rounded-full bg-[#cc091b] px-6 py-2.5 text-[13px] font-bold text-white">
          Send Notification
        </button>
      </div>

      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[16px] font-bold text-[#09123c]">All notifications</h3>
          <div className="flex gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="admin-input rounded-full border border-[#e3e9f0] px-4 py-2 text-[13px]" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="admin-input rounded-full border border-[#e3e9f0] px-4 py-2 text-[13px]">
              <option value="All">All types</option>
              {TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
            <select value={filterRead} onChange={(e) => setFilterRead(e.target.value as any)} className="admin-input rounded-full border border-[#e3e9f0] px-4 py-2 text-[13px]">
              <option value="All">All</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
            </select>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <p className="text-[14px] text-[#6b8aa0]">No notifications found.</p>
          ) : (
            filtered.map((n) => (
              <div key={n.id} className={`flex justify-between rounded-xl border px-4 py-3 ${n.read ? "border-[#e3e9f0] bg-white" : "border-[#cfe4f5] bg-[#f8fbff]"}`}>
                <div>
                  <div className="text-[14px] font-bold text-[#09123c]">{n.title}</div>
                  <div className="mt-0.5 text-[13px] text-[#4a556a]">{n.message}</div>
                  <div className="mt-1 text-[12px] text-[#6b8aa0]">{n.type} · {new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => { markNotificationRead(n.id); setRefresh((r) => r + 1); }} className="admin-btn self-start text-[12px] font-bold text-[#cc091b] underline">
                  {n.read ? "Read" : "Mark read"}
                </button>
              </div>
            ))
          )}
        </div>
        <button onClick={() => { markAllNotificationsRead("admin@elforte.com"); setRefresh((r) => r + 1); }} className="admin-btn mt-4 rounded-full border border-[#c8dce8] px-4 py-2 text-[13px] font-bold text-[#09123c]">
          Mark all as read
        </button>
      </div>
    </div>
  );
}

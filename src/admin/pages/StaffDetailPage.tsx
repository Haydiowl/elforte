import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getStaffMember, updateStaffMember, deleteStaffMember, getRoles, getActivities } from "../../lib/db";
import { updateStaffAccountRole, removeStaffAccount, getCurrentUser } from "../../lib/auth";
import { can, isOwner, OWNER_EMAIL } from "../../lib/permissions";
import type { Staff } from "../../lib/types";

const STATUSES: Staff["status"][] = ["Active", "Invited", "Suspended"];

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function StaffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const staff = getStaffMember(id!);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: staff?.firstName ?? "",
    lastName: staff?.lastName ?? "",
    email: staff?.email ?? "",
    phone: staff?.phone ?? "",
    roleId: staff?.roleId ?? "",
    status: staff?.status ?? "Active",
  });

  if (!staff) {
    return (
      <div className="space-y-6">
        <Link to="/admin/staff" className="text-[13px] font-semibold text-[#09123c] hover:text-[#cc091b]">
          ← Back to staff
        </Link>
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-12 text-center">
          <h2 className="text-[20px] font-bold text-[#09123c]">Staff member not found</h2>
        </div>
      </div>
    );
  }

  const roles = getRoles();
  const role = roles.find((r) => r.id === staff.roleId);
  const activities = getActivities().filter((a) => a.userId === staff.id).slice(0, 5);
  const ownerRecord = staff.email.toLowerCase() === OWNER_EMAIL;
  const selfRecord = staff.email.toLowerCase() === (getCurrentUser()?.email.toLowerCase() ?? "");

  function handleSave() {
    if (ownerRecord && !isOwner()) return;
    if (selfRecord && !isOwner() && staff?.roleId !== (form.roleId || null)) return;
    updateStaffMember(staff!.id, { ...form, roleId: form.roleId || null });
    const roleName = roles.find((r) => r.id === form.roleId)?.name ?? "Staff";
    updateStaffAccountRole(form.email, roleName);
    setEditing(false);
  }

  function handleSuspend() {
    if (ownerRecord) return;
    updateStaffMember(staff!.id, { status: "Suspended" });
    navigate("/admin/staff");
  }

  function handleReactivate() {
    updateStaffMember(staff!.id, { status: "Active" });
    navigate("/admin/staff");
  }

  function handleResetAccess() {
    updateStaffMember(staff!.id, { lastLogin: null });
  }

  function handleDelete() {
    if (ownerRecord) return;
    removeStaffAccount(staff!.email);
    deleteStaffMember(staff!.id);
    navigate("/admin/staff");
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/staff" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#09123c] hover:text-[#cc091b]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to staff
      </Link>

      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h2 className="text-[24px] font-bold text-[#09123c]">{staff.firstName} {staff.lastName}</h2>
            <p className="mt-1 text-[14px] text-[#6b8aa0]">{role?.name ?? "No role assigned"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {can("staff", "edit") && !(selfRecord && !isOwner()) && (
            <button
              onClick={() => setEditing(!editing)}
              className="rounded-full border border-[#c8dce8] px-4 py-2 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
            >
              {editing ? "Cancel Edit" : "Edit"}
            </button>
            )}
            {can("staff", "edit") && !ownerRecord && (staff.status === "Suspended" ? (
              <button
                onClick={handleReactivate}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[13px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                Reactivate
              </button>
            ) : (
              <button
                onClick={handleSuspend}
                className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[13px] font-bold text-amber-700 transition-colors hover:bg-amber-100"
              >
                Suspend
              </button>
            ))}
            {can("staff", "edit") && (
            <button
              onClick={handleResetAccess}
              className="rounded-full border border-[#c8dce8] px-4 py-2 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
            >
              Reset Access
            </button>
            )}
            {can("staff", "delete") && !ownerRecord && (
            <button
              onClick={handleDelete}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[13px] font-bold text-red-700 transition-colors hover:bg-red-100"
            >
              Delete
            </button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="First name"
                className="rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
              />
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Last name"
                className="rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
              />
            </div>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
            />
            <select
              value={form.roleId}
              onChange={(e) => setForm({ ...form, roleId: e.target.value })}
              className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
            >
              <option value="">No role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Staff["status"] })}
              className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={handleSave}
              className="rounded-full bg-[#cc091b] px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Email</div>
              <div className="mt-1 text-[14px] text-[#09123c]">{staff.email}</div>
            </div>
            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Phone</div>
              <div className="mt-1 text-[14px] text-[#09123c]">{staff.phone || "—"}</div>
            </div>
            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Status</div>
              <div className="mt-1 text-[14px] text-[#09123c]">{staff.status}</div>
            </div>
            <div>
              <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Last Login</div>
              <div className="mt-1 text-[14px] text-[#09123c]">{formatDate(staff.lastLogin)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
          <h3 className="text-[16px] font-bold text-[#09123c]">Permissions</h3>
          {role ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {role.permissions.map((p) => (
                <span key={p} className="rounded-full bg-[#eaf4fc] px-3 py-1 text-[12px] font-medium text-[#09123c]">
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-[14px] text-[#6b8aa0]">No permissions assigned.</p>
          )}
        </div>

        <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
          <h3 className="text-[16px] font-bold text-[#09123c]">Recent Activity</h3>
          {activities.length === 0 ? (
            <p className="mt-4 text-[14px] text-[#6b8aa0]">No recent activity.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {activities.map((a) => (
                <div key={a.id} className="rounded-lg border border-[#e3e9f0] p-3">
                  <div className="text-[13px] font-bold text-[#09123c]">{a.action}</div>
                  <div className="text-[12px] text-[#6b8aa0]">{a.entityType} · {new Date(a.timestamp).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

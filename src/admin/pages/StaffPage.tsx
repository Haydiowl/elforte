import { useState } from "react";
import { Link } from "react-router-dom";
import AdminTable, { AdminTableEmpty } from "../components/AdminTable";
import { getStaff, createStaffMember, updateStaffMember, deleteStaffMember, getRoles } from "../../lib/db";
import { createStaffAccount, updateStaffAccountRole, removeStaffAccount, getCurrentUser } from "../../lib/auth";
import { can, isOwner, OWNER_EMAIL } from "../../lib/permissions";
import { PERMISSION_MODULES } from "../../lib/permissionDefs";
import type { Staff } from "../../lib/types";

const STATUSES: Staff["status"][] = ["Active", "Invited", "Suspended"];
const PAGE_SIZE = 8;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Invited":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Suspended":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    assignedPropertyIds: [] as string[],
    status: "Active" as Staff["status"],
  });

  const allStaff = getStaff();
  const roles = getRoles();

  const filtered = allStaff
    .filter((s) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function openCreate() {
    setEditing(null);
    setShowPassword(false);
    setForm({ firstName: "", lastName: "", email: "", phone: "", password: "", roleId: "", assignedPropertyIds: [], status: "Active" });
    setShowForm(true);
  }

  function openEdit(staff: Staff) {
    setEditing(staff);
    setForm({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      password: "",
      roleId: staff.roleId ?? "",
      assignedPropertyIds: staff.assignedPropertyIds,
      status: staff.status,
    });
    setShowForm(true);
  }

  function roleNameFor(roleId: string): string {
    return roles.find((r) => r.id === roleId)?.name ?? "Staff";
  }

  function isOwnerRecord(staff: Staff): boolean {
    return staff.email.toLowerCase() === OWNER_EMAIL;
  }

  function isSelf(staff: Staff): boolean {
    return staff.email.toLowerCase() === (getCurrentUser()?.email.toLowerCase() ?? "");
  }

  function handleSave() {
    if (editing) {
      if (isOwnerRecord(editing) && !isOwner()) return;
      // Staff cannot elevate their own permissions.
      if (isSelf(editing) && !isOwner() && editing.roleId !== (form.roleId || null)) return;
      updateStaffMember(editing.id, { ...form, roleId: form.roleId || null });
      updateStaffAccountRole(form.email, roleNameFor(form.roleId));
      if (form.password) {
        createStaffAccount(form.email, form.password, `${form.firstName} ${form.lastName}`, roleNameFor(form.roleId));
      }
    } else {
      createStaffMember({ ...form, roleId: form.roleId || null });
      if (form.password) {
        createStaffAccount(form.email, form.password, `${form.firstName} ${form.lastName}`, roleNameFor(form.roleId));
      } else {
        updateStaffAccountRole(form.email, roleNameFor(form.roleId));
      }
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    const target = getStaff().find((s) => s.id === id);
    if (target && isOwnerRecord(target)) return;
    if (target) removeStaffAccount(target.email);
    deleteStaffMember(id);
    setDeleteConfirm(null);
  }

  function handleSuspend(id: string) {
    const target = getStaff().find((s) => s.id === id);
    if (!target || isOwnerRecord(target)) return;
    updateStaffMember(id, { status: "Suspended" });
  }

  function handleReactivate(id: string) {
    updateStaffMember(id, { status: "Active" });
  }

  const roleName = (roleId: string | null) => roles.find((r) => r.id === roleId)?.name ?? "—";

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "properties", label: "Assigned Properties" },
    { key: "lastLogin", label: "Last Login" },
    { key: "createdAt", label: "Created" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#09123c]">Staff</h2>
          <p className="mt-1 text-[14px] text-[#6b8aa0]">{allStaff.length} total members</p>
        </div>
        {can("staff", "create") && (
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-full bg-[#cc091b] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
          >
            Add Staff
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9db4c4]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search staff…"
            className="w-full rounded-full border border-[#e3e9f0] bg-white py-2.5 pl-9 pr-4 text-[13px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-full border border-[#e3e9f0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6]"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <AdminTable columns={columns}>
        {paginated.length === 0 ? (
          <AdminTableEmpty message="No staff members found." colSpan={8} />
        ) : (
          paginated.map((staff) => (
            <tr key={staff.id} className="transition-colors hover:bg-[#f8fafc]">
              <td className="px-5 py-4">
                <Link to={`/admin/staff/${staff.id}`} className="text-[14px] font-bold text-[#09123c] hover:text-[#cc091b]">
                  {staff.firstName} {staff.lastName}
                </Link>
              </td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{staff.email}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{roleName(staff.roleId)}</td>
              <td className="px-5 py-4">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusColor(staff.status)}`}>
                  {staff.status}
                </span>
              </td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{staff.assignedPropertyIds.length}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(staff.lastLogin)}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(staff.createdAt)}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <Link
                    to={`/admin/staff/${staff.id}`}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                    title="View"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Link>
                  {can("staff", "edit") && !(isSelf(staff) && !isOwner()) && (
                  <button
                    onClick={() => openEdit(staff)}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                    title="Edit"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                  )}
                  {can("staff", "edit") && !isOwnerRecord(staff) && (staff.status === "Suspended" ? (
                    <button
                      onClick={() => handleReactivate(staff.id)}
                      className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                      title="Reactivate"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 14l6-6" />
                        <path d="M9 10h6v6" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(staff.id)}
                      className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-amber-50 hover:text-amber-600"
                      title="Suspend"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M4.93 4.93l14.14 14.14" />
                      </svg>
                    </button>
                  ))}
                  {can("staff", "delete") && !isOwnerRecord(staff) && (
                  <button
                    onClick={() => setDeleteConfirm(staff.id)}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-red-50 hover:text-[#cc091b]"
                    title="Delete"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-[13px] text-[#6b8aa0]">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full border border-[#e3e9f0] px-4 py-2 text-[13px] font-semibold text-[#09123c] transition-colors hover:bg-[#f8fafc] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full border border-[#e3e9f0] px-4 py-2 text-[13px] font-semibold text-[#09123c] transition-colors hover:bg-[#f8fafc] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-[18px] font-bold text-[#09123c]">{editing ? "Edit Staff" : "Add Staff"}</h3>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="First name"
                    className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                />
              </div>
              <div>
                <label htmlFor="staff-password" className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">{editing ? "New Password (leave blank to keep)" : "Password"}</label>
                <div className="relative">
                  <input
                    id="staff-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editing ? "Optional new password" : "Set password for staff login"}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-[#dce4ea] py-2.5 pl-4 pr-11 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#9db4c4] transition-colors hover:bg-[#f1f5f9] hover:text-[#09123c] focus-visible:outline-2 focus-visible:outline-[#8ab5d6]"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <path d="M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Role</label>
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
              </div>
              <div className="rounded-lg border border-[#e3e9f0] bg-[#f8fafc] p-4">
                {(() => {
                  const selected = roles.find((r) => r.id === form.roleId);
                  if (!selected) {
                    return <p className="text-[13px] text-[#6b8aa0]">Select a role to preview inherited permissions.</p>;
                  }
                  const perms = selected.permissions;
                  return (
                    <div>
                      <p className="text-[13px] font-bold text-[#09123c]">
                        Permissions inherited from {selected.name}
                      </p>
                      {perms.includes("*") ? (
                        <p className="mt-2 text-[13px] font-semibold text-[#09123c]">✓ Full access (all permissions)</p>
                      ) : perms.length === 0 ? (
                        <p className="mt-2 text-[13px] text-[#6b8aa0]">This role has no permissions yet.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {PERMISSION_MODULES.filter((m) =>
                            m.actions.some((a) => perms.includes(`${m.module}.${a}`))
                          ).map((m) => (
                            <div key={m.module}>
                              <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">{m.label}</div>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {m.actions
                                  .filter((a) => perms.includes(`${m.module}.${a}`))
                                  .map((a) => (
                                    <span key={a} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#09123c] ring-1 ring-[#c8dce8]">
                                      <span aria-hidden="true">✓</span> {a}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Status</label>
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
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-full border border-[#c8dce8] py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-full bg-[#cc091b] py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
              >
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 ">
            <h3 className="text-[18px] font-bold text-[#09123c]">Delete Staff</h3>
            <p className="mt-2 text-[14px] text-[#6b8aa0]">
              Are you sure you want to permanently delete this staff member? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-full border border-[#c8dce8] py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 rounded-full bg-[#cc091b] py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

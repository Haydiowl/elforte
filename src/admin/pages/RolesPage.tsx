import { useState } from "react";
import AdminTable, { AdminTableEmpty } from "../components/AdminTable";
import { getRoles, createRole, updateRole, deleteRole } from "../../lib/db";
import { PERMISSION_MODULES } from "../../lib/permissionDefs";
import { isOwner, can } from "../../lib/permissions";
import type { Role } from "../../lib/types";

export default function RolesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", permissions: [] as string[] });

  const allRoles = getRoles();
  const owner = isOwner();
  const editingAdminRole = editing?.id === "role_admin";
  const adminLocked = Boolean(editingAdminRole && !owner);

  function togglePermission(perm: string) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", permissions: [] });
    setShowForm(true);
  }

  function openEdit(role: Role) {
    setEditing(role);
    setForm({ name: role.name, description: role.description, permissions: [...role.permissions] });
    setShowForm(true);
  }

  function openDuplicate(role: Role) {
    setEditing(null);
    setForm({ name: `${role.name} (Copy)`, description: role.description, permissions: [...role.permissions] });
    setShowForm(true);
  }

  function handleSave() {
    if (editing && editing.id === "role_admin" && !isOwner()) return;
    if (editing) {
      updateRole(editing.id, { ...form });
    } else {
      createRole({ ...form, isSystemRole: false });
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    deleteRole(id);
    setDeleteConfirm(null);
  }

  const columns = [
    { key: "name", label: "Role" },
    { key: "description", label: "Description" },
    { key: "permissions", label: "Permissions" },
    { key: "type", label: "Type" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#09123c]">Roles & Permissions</h2>
          <p className="mt-1 text-[14px] text-[#6b8aa0]">{allRoles.length} total roles</p>
        </div>
        {can("roles", "create") && (
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-full bg-[#cc091b] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
        >
          Create Role
        </button>
        )}
      </div>

      <AdminTable columns={columns}>
        {allRoles.length === 0 ? (
          <AdminTableEmpty message="No roles yet." colSpan={5} />
        ) : (
          allRoles.map((role) => (
            <tr key={role.id} className="transition-colors hover:bg-[#f8fafc]">
              <td className="px-5 py-4 text-[14px] font-bold text-[#09123c]">{role.name}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{role.description}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">
                {role.permissions.includes("*") ? "All" : role.permissions.length}
              </td>
              <td className="px-5 py-4">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${role.isSystemRole ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                  {role.isSystemRole ? "System" : "Custom"}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  {can("roles", "edit") && (
                  <button
                    onClick={() => openEdit(role)}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                    title="Edit"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                  )}
                  {can("roles", "create") && (
                  <button
                    onClick={() => openDuplicate(role)}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                    title="Duplicate"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                  )}
                  {can("roles", "delete") && !role.isSystemRole && (
                    <button
                      onClick={() => setDeleteConfirm(role.id)}
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

      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
        <h3 className="text-[16px] font-bold text-[#09123c]">Permission Matrix</h3>
        <p className="mt-1 text-[13px] text-[#6b8aa0]">
          Open a role to toggle its permissions. Changes persist on save.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#e3e9f0]">
                <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Role</th>
                <th className="px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {allRoles.map((role) => (
                <tr key={role.id} className="hover:bg-[#f8fafc]">
                  <td className="px-4 py-3 font-semibold text-[#09123c]">{role.name}</td>
                  <td className="px-4 py-3">
                    {role.permissions.includes("*") ? (
                      <span className="text-[13px] font-semibold text-[#09123c]">Full access</span>
                    ) : role.permissions.length === 0 ? (
                      <span className="text-[13px] text-[#9db4c4]">No permissions</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions.map((p) => (
                          <span key={p} className="inline-flex items-center rounded-full bg-[#eaf4fc] px-2.5 py-0.5 text-[11px] font-semibold text-[#09123c]">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 ">
            <h3 className="text-[18px] font-bold text-[#09123c]">{editing ? "Edit Role" : "Create Role"}</h3>
            {adminLocked && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] font-medium text-amber-700">
                The Administrator role can only be changed by the owner account.
              </p>
            )}
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Role Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sales Manager"
                  disabled={adminLocked}
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6] disabled:opacity-60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="What can this role do?"
                  disabled={adminLocked}
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6] disabled:opacity-60"
                />
              </div>
              <div>
                <div className="mb-1.5 text-[13px] font-semibold text-[#09123c]">Permissions</div>
                <div className="max-h-64 space-y-4 overflow-y-auto rounded-lg border border-[#e3e9f0] p-4">
                  {PERMISSION_MODULES.map((mod) => (
                    <div key={mod.module}>
                      <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">{mod.label}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {mod.actions.map((action) => {
                          const perm = `${mod.module}.${action}`;
                          const checked = form.permissions.includes(perm);
                          return (
                            <label
                              key={perm}
                              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                                checked
                                  ? "border-[#cc091b] bg-[#cc091b] text-white"
                                  : "border-[#c8dce8] bg-white text-[#4a556a] hover:border-[#8ab5d6]"
                              } ${adminLocked ? "cursor-not-allowed opacity-60" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={adminLocked}
                                onChange={() => togglePermission(perm)}
                                className="sr-only"
                              />
                              <span aria-hidden="true">{checked ? "✓ " : ""}</span>
                              {action}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[12px] text-[#6b8aa0]">
                  {form.permissions.length} permission{form.permissions.length === 1 ? "" : "s"} selected.
                </p>
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
                disabled={adminLocked}
                className="flex-1 rounded-full bg-[#cc091b] py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818] disabled:opacity-60"
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
            <h3 className="text-[18px] font-bold text-[#09123c]">Delete Role</h3>
            <p className="mt-2 text-[14px] text-[#6b8aa0]">
              Are you sure you want to permanently delete this role? This action cannot be undone.
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

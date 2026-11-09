import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../lib/auth";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../lib/db";
import { canAccessRoute } from "../../lib/permissions";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: "dashboard" }],
  },
  {
    label: "Property",
    items: [
      { label: "Properties", href: "/admin/properties", icon: "building" },
      { label: "Inquiries", href: "/admin/inquiries", icon: "message" },
      { label: "Inspections", href: "/admin/inspections", icon: "calendar" },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog", href: "/admin/blog", icon: "document" },
      { label: "Media", href: "/admin/media", icon: "image" },
    ],
  },
  {
    label: "Clients",
    items: [{ label: "Clients", href: "/admin/clients", icon: "users" }],
  },
  {
    label: "Analytics",
    items: [{ label: "Overview", href: "/admin/analytics", icon: "chart" }],
  },
  {
    label: "Team",
    items: [
      { label: "Staff", href: "/admin/staff", icon: "user" },
      { label: "Roles & Permissions", href: "/admin/roles", icon: "shield" },
      { label: "Activity Log", href: "/admin/activity", icon: "history" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", href: "/admin/notifications", icon: "bell" },
      { label: "Settings", href: "/admin/settings", icon: "settings" },
    ],
  },
];

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const common: React.SVGProps<SVGSVGElement> = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "dashboard": return <svg {...common} fill={active ? "currentColor" : "none"}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "building": return <svg {...common} fill={active ? "currentColor" : "none"}><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></svg>;
    case "message": return <svg {...common} fill={active ? "currentColor" : "none"}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>;
    case "calendar": return <svg {...common} fill={active ? "currentColor" : "none"}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>;
    case "document": return <svg {...common} fill={active ? "currentColor" : "none"}><path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>;
    case "image": return <svg {...common} fill={active ? "currentColor" : "none"}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
    case "users": return <svg {...common} fill={active ? "currentColor" : "none"}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
    case "chart": return <svg {...common} fill={active ? "currentColor" : "none"}><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>;
    case "user": return <svg {...common} fill={active ? "currentColor" : "none"}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case "shield": return <svg {...common} fill={active ? "currentColor" : "none"}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>;
    case "history": return <svg {...common} fill={active ? "currentColor" : "none"}><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 106 5.3L3 8" /></svg>;
    case "bell": return <svg {...common} fill={active ? "currentColor" : "none"}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></svg>;
    case "settings": return <svg {...common} fill={active ? "currentColor" : "none"}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
    default: return null;
  }
}

function formatRoleLabel(role: string | undefined): string {
  if (!role) return "Staff";
  return role
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function SidebarContent({ onNavigate, collapsed, onToggleCollapse }: { onNavigate?: () => void; collapsed?: boolean; onToggleCollapse?: () => void }) {
  const location = useLocation();
  const user = getCurrentUser();

  return (
    <div className="flex h-full flex-col">
      {collapsed ? (
        <div className="flex h-16 items-center justify-center border-b border-white/10 px-2">
          {onToggleCollapse ? (
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/60"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M13 17l5-5-5-5" />
                <path d="M6 17l5-5-5-5" />
              </svg>
            </button>
          ) : (
            <img src="/images/elforte-logo.png" alt="Elforte" className="h-auto w-[40px]" />
          )}
        </div>
      ) : (
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <img src="/images/elforte-logo.png" alt="Elforte" className="h-auto w-[90px]" />
          <div className="min-w-0">
            <div className="truncate text-[11px] font-medium tracking-wide text-white/70">{formatRoleLabel(user?.role)}</div>
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="ml-auto rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white/60"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M11 17l-5-5 5-5" />
                <path d="M18 17l-5-5 5-5" />
              </svg>
            </button>
          )}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, sectionIndex) => {
          const visibleItems = section.items.filter((item) => canAccessRoute(item.href));
          if (visibleItems.length === 0) return null;
          return (
          <div key={section.label} className={sectionIndex > 0 ? "mt-3 pt-3" : ""}>
            {sectionIndex > 0 && !collapsed && (
              <div className="mx-6 mb-3 border-t border-white/10" aria-hidden="true" />
            )}
            {!collapsed && (
              <div className="mb-1.5 px-3 text-[12px] font-medium text-white/40">
                {section.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {visibleItems.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname === item.href || location.pathname.startsWith(item.href + "/");
                return (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-white text-[#131315]"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <NavIcon name={item.icon} active={isActive} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          to="/"
          title={collapsed ? "Back to website" : undefined}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[11px] font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          {!collapsed && <span>Back to website</span>}
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const notifications = getNotifications(user?.email ?? "system");
  const unreadCount = notifications.filter((n) => !n.read).length;

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  const pageTitle = location.pathname
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

  return (
    <div className="flex min-h-screen bg-[var(--admin-bg)]">
      {/* Desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 hidden bg-[#1C1E23] transition-all lg:block ${sidebarCollapsed ? "w-[68px]" : "w-60"}`}>
        <SidebarContent collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-[#1C1E23]">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className={`admin-theme flex min-w-0 flex-1 flex-col transition-all ${sidebarCollapsed ? "lg:pl-[68px]" : "lg:pl-60"}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e3e9f0] bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3e9f0] text-[#09123c] lg:hidden"
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <h1 className="text-[16px] font-bold capitalize text-[#09123c]">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
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
                placeholder="Search…"
                className="w-56 rounded-full border border-[#e3e9f0] bg-[#f8fafc] py-2 pl-9 pr-4 text-[13px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6] focus:bg-white"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3e9f0] text-[#09123c] transition-colors hover:bg-[#f8fafc]"
                aria-label="Notifications"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.7 21a2 2 0 01-3.4 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#cc091b] text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-[#e3e9f0] bg-white ">
                    <div className="flex items-center justify-between border-b border-[#f1f5f9] px-4 py-3">
                      <div className="text-[14px] font-bold text-[#09123c]">Notifications</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            markAllNotificationsRead(user?.email ?? "system");
                            setNotifOpen(false);
                          }}
                          className="text-[12px] font-bold text-[#cc091b] hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-center text-[13px] text-[#6b8aa0]">No notifications.</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              setNotifOpen(false);
                            }}
                            className={`block w-full px-4 py-3 text-left transition-colors hover:bg-[#f8fafc] ${!n.read ? "bg-[#eaf4fc]" : ""}`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#cc091b]" />}
                              <div>
                                <div className="text-[13px] font-bold text-[#09123c]">{n.title}</div>
                                <div className="mt-0.5 text-[12px] text-[#6b8aa0]">{n.message}</div>
                                <div className="mt-1 text-[11px] text-[#9db4c4]">{new Date(n.createdAt).toLocaleString()}</div>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#09123c] text-[12px] font-bold text-white transition-colors hover:bg-[#1a2a5e]"
                aria-label="User menu"
              >
                {user?.name?.charAt(0) ?? "A"}
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-[#e3e9f0] bg-white py-1.5 ">
                    <div className="border-b border-[#f1f5f9] px-4 py-2.5">
                      <div className="text-[13px] font-bold text-[#09123c]">{user?.name ?? "Admin"}</div>
                      <div className="text-[11px] text-[#6b8aa0]">{user?.role ?? "Administrator"}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium text-[#cc091b] transition-colors hover:bg-[#f8fafc]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <path d="M16 17l5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {!location.pathname.startsWith("/admin/login") && (
            <nav className="mb-4 flex items-center gap-2 text-[13px] text-[#6b8aa0]" aria-label="Breadcrumb">
              <Link to="/admin" className="hover:text-[#cc091b]">Dashboard</Link>
              {location.pathname !== "/admin" && (
                <>
                  <span>/</span>
                  <span className="capitalize text-[#09123c]">
                    {location.pathname.split("/").filter(Boolean).slice(1).join("/").replace(/-/g, " ")}
                  </span>
                </>
              )}
            </nav>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

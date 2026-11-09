const SESSION_KEY = "elforte_admin_session";

const DEMO_EMAIL = "admin@elforte.com";
const DEMO_PASSWORD = "admin123";

const STAFF_ACCOUNTS_KEY = "elforte_staff_accounts";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Session {
  user: AdminUser;
  loginAt: string;
}

interface StaffAccount {
  email: string;
  password: string;
  name: string;
  role: string;
}

function safeGetSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function safeSetSession(session: Session): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // storage unavailable
  }
}

function getStaffAccounts(): StaffAccount[] {
  try {
    const raw = localStorage.getItem(STAFF_ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StaffAccount[]) : [];
  } catch {
    return [];
  }
}

function saveStaffAccounts(accounts: StaffAccount[]): void {
  try {
    localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // storage unavailable
  }
}

export function createStaffAccount(email: string, password: string, name: string, role: string): void {
  const accounts = getStaffAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    existing.password = password;
    existing.name = name;
    existing.role = role;
  } else {
    accounts.push({ email: email.toLowerCase(), password, name, role });
  }
  saveStaffAccounts(accounts);
}

export function removeStaffAccount(email: string): void {
  const accounts = getStaffAccounts().filter((a) => a.email.toLowerCase() !== email.toLowerCase());
  saveStaffAccounts(accounts);
}

export function updateStaffAccountRole(email: string, role: string): void {
  const accounts = getStaffAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (account) {
    account.role = role;
    saveStaffAccounts(accounts);
  }
}

export function isAuthenticated(): boolean {
  return safeGetSession() !== null;
}

import { createActivity, getStaff } from "./db";

export function login(email: string, password: string): { ok: boolean; error?: string } {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    return { ok: false, error: "Please enter both email and password." };
  }

  const isAdmin = trimmedEmail === DEMO_EMAIL && password === DEMO_PASSWORD;
  const staffAccount = getStaffAccounts().find(
    (a) => a.email.toLowerCase() === trimmedEmail && a.password === password
  );

  if (!isAdmin && !staffAccount) {
    return { ok: false, error: "Incorrect email or password." };
  }

  if (!isAdmin && staffAccount) {
    try {
      const record = getStaff().find((s) => s.email.toLowerCase() === trimmedEmail);
      if (record && record.status === "Suspended") {
        return { ok: false, error: "This account has been suspended. Contact an administrator." };
      }
    } catch {
      // storage unavailable — allow login attempt to proceed
    }
  }

  const roleName = isAdmin ? "Administrator" : staffAccount?.role ?? "Staff";
  const displayName = isAdmin ? "Admin" : staffAccount?.name ?? "Staff";

  const session: Session = {
    user: {
      id: isAdmin ? "admin_1" : staffAccount?.email ?? "staff",
      email: trimmedEmail,
      name: displayName,
      role: roleName,
    },
    loginAt: new Date().toISOString(),
  };

  safeSetSession(session);
  createActivity({ userId: trimmedEmail, action: "login", entityType: "auth", entityId: "session", metadata: {} });
  return { ok: true };
}

export function logout(): void {
  try {
    createActivity({ userId: getCurrentUser()?.email ?? "unknown", action: "logout", entityType: "auth", entityId: "session", metadata: {} });
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // storage unavailable
  }
}

export function getCurrentUser(): AdminUser | null {
  return safeGetSession()?.user ?? null;
}

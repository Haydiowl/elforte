import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, login } from "../../lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    const from = (location.state as { from?: string } | null)?.from ?? "/admin";
    navigate(from, { replace: true });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);

      if (result.ok) {
        const from = (location.state as { from?: string } | null)?.from ?? "/admin";
        navigate(from, { replace: true });
      } else {
        setError(result.error ?? "Login failed.");
      }
    }, 600);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9] p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-8 ">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#09123c] text-[18px] font-black text-white">
              E
            </div>
            <h1 className="mt-4 text-[20px] font-bold text-[#09123c]">Elforte Admin</h1>
            <p className="mt-1 text-[13px] text-[#6b8aa0]">Sign in to manage your properties</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="admin@elforte.com"
                autoComplete="email"
                className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6] focus:ring-2 focus:ring-[#8ab5d6]/40"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 pr-11 text-[14px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6] focus:ring-2 focus:ring-[#8ab5d6]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9db4c4] transition-colors hover:text-[#09123c]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-[#cc091b]/30 bg-[#cc091b]/5 px-4 py-2.5 text-[13px] font-medium text-[#cc091b]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#cc091b] py-3 text-[14px] font-bold text-white transition-all hover:bg-[#b50818] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
            >
              {loading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[12px] text-[#9db4c4]">
          Demo credentials: <span className="font-mono">admin@elforte.com</span> / <span className="font-mono">admin123</span>
        </p>
      </div>
    </div>
  );
}

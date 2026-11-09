import { useState } from "react";
import { AdminField, inputCls } from "../components/AdminForm";
import { getSettings, saveSettings } from "../../lib/db";
import type { Settings } from "../../lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(getSettings());
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-[24px] font-bold text-[#09123c]">Settings</h2>
        <p className="mt-1 text-[14px] text-[#6b8aa0]">Configure your site and admin preferences.</p>
      </div>

      {/* GENERAL */}
      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
        <h3 className="text-[16px] font-bold text-[#09123c]">General</h3>
        <div className="mt-5 space-y-4">
          <AdminField label="Company Name">
            <input
              value={settings.siteName}
              onChange={(e) => update("siteName", e.target.value)}
              placeholder="Elforte"
              className={inputCls}
            />
          </AdminField>
          <AdminField label="Company Email">
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="hello@elforte.com"
              className={inputCls}
            />
          </AdminField>
          <AdminField label="Phone">
            <input
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              placeholder="+234 81234567879"
              className={inputCls}
            />
          </AdminField>
          <AdminField label="Address">
            <input
              value={settings.contactAddress}
              onChange={(e) => update("contactAddress", e.target.value)}
              placeholder="Ijebu Ode, Ogun State"
              className={inputCls}
            />
          </AdminField>
          <AdminField label="Logo URL">
            <input
              value="/images/elforte-logo.png"
              readOnly
              className={inputCls}
            />
            <p className="mt-1.5 text-[12px] text-[#6b8aa0]">To change the logo, replace the file at public/images/elforte-logo.png</p>
          </AdminField>
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label="Twitter / X">
              <input
                value={settings.socialLinks.twitter}
                onChange={(e) => update("socialLinks", { ...settings.socialLinks, twitter: e.target.value })}
                placeholder="https://x.com/elforte"
                className={inputCls}
              />
            </AdminField>
            <AdminField label="LinkedIn">
              <input
                value={settings.socialLinks.linkedin}
                onChange={(e) => update("socialLinks", { ...settings.socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/company/elforte"
                className={inputCls}
              />
            </AdminField>
            <AdminField label="Instagram">
              <input
                value={settings.socialLinks.instagram}
                onChange={(e) => update("socialLinks", { ...settings.socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/elforte"
                className={inputCls}
              />
            </AdminField>
          </div>
        </div>
      </div>

      {/* WEBSITE */}
      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
        <h3 className="text-[16px] font-bold text-[#09123c]">Website</h3>
        <div className="mt-5 space-y-4">
          <AdminField label="Default SEO Title">
            <input
              value={settings.seoDefaults.titleSuffix}
              onChange={(e) => update("seoDefaults", { ...settings.seoDefaults, titleSuffix: e.target.value })}
              placeholder="— Elforte"
              className={inputCls}
            />
          </AdminField>
          <AdminField label="Default Meta Description">
            <textarea
              value={settings.seoDefaults.defaultDescription}
              onChange={(e) => update("seoDefaults", { ...settings.seoDefaults, defaultDescription: e.target.value })}
              rows={3}
              placeholder="Default description for search engines"
              className={inputCls}
            />
          </AdminField>
          <AdminField label="Default Social Image URL">
            <input
              value="/images/hero-signature-city.png"
              readOnly
              className={inputCls}
            />
            <p className="mt-1.5 text-[12px] text-[#6b8aa0]">Default image used when sharing pages on social media</p>
          </AdminField>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
        <h3 className="text-[16px] font-bold text-[#09123c]">Notifications</h3>
        <div className="mt-5 space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-[#c8dce8] text-[#cc091b] focus:ring-[#cc091b]" />
            <span className="text-[14px] text-[#09123c]">Email me when a new inquiry arrives</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-[#c8dce8] text-[#cc091b] focus:ring-[#cc091b]" />
            <span className="text-[14px] text-[#09123c]">Email me when an inspection is scheduled</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4 rounded border-[#c8dce8] text-[#cc091b] focus:ring-[#cc091b]" />
            <span className="text-[14px] text-[#09123c]">Email me when a property is published</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-[#c8dce8] text-[#cc091b] focus:ring-[#cc091b]" />
            <span className="text-[14px] text-[#09123c]">Email me when a blog post is published</span>
          </label>
        </div>
      </div>

      {/* ACCOUNT */}
      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 ">
        <h3 className="text-[16px] font-bold text-[#09123c]">Account</h3>
        <div className="mt-5 space-y-4">
          <AdminField label="Profile Name">
            <input
              value="Admin"
              readOnly
              className={inputCls}
            />
          </AdminField>
          <AdminField label="Profile Email">
            <input
              value="admin@elforte.com"
              readOnly
              className={inputCls}
            />
          </AdminField>
          <AdminField label="Password">
            <input
              type="password"
              placeholder="••••••••"
              disabled
              className={inputCls}
            />
            <p className="mt-1.5 text-[12px] text-[#6b8aa0]">Password changes must be made through the secure auth provider in production.</p>
          </AdminField>
          <AdminField label="Active Sessions">
            <div className="rounded-lg border border-[#e3e9f0] bg-[#f8fafc] px-4 py-3 text-[14px] text-[#09123c]">
              1 active session (current browser tab)
            </div>
          </AdminField>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="rounded-full bg-[#cc091b] px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818] active:scale-95"
        >
          Save Settings
        </button>
        {saved && (
          <span className="text-[13px] font-medium text-emerald-600">Settings saved successfully.</span>
        )}
      </div>
    </div>
  );
}

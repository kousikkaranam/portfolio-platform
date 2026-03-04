"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

interface Settings {
  siteTitle: string;
  tagline: string;
  bio: string;
  location: string;
  availableForHire: boolean;
  theme: string;
  accentColor: string;
  heroImageUrl: string;
  resumeUrl: string;
  metaTitle: string;
  metaDescription: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    email: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    siteTitle: "",
    tagline: "",
    bio: "",
    location: "",
    availableForHire: false,
    theme: "dark",
    accentColor: "#5eead4",
    heroImageUrl: "",
    resumeUrl: "",
    metaTitle: "",
    metaDescription: "",
    socialLinks: { github: "", linkedin: "", twitter: "", email: "" },
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            ...data.settings,
            socialLinks: data.settings.socialLinks ?? {
              github: "",
              linkedin: "",
              twitter: "",
              email: "",
            },
          });
        }
        if (data.user) {
          setSlug(data.user.slug ?? "");
          setName(data.user.name ?? "");
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, slug, name }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSocial = (key: string, value: string) => {
    setSettings((s) => ({
      ...s,
      socialLinks: { ...s.socialLinks, [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[#5eead4] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">
            Configure your portfolio profile and appearance.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#4fd1b8] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section className="bg-[#121826] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">URL Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">yoursite.com/{slug}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Site Title</label>
              <input
                type="text"
                value={settings.siteTitle ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, siteTitle: e.target.value }))}
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Tagline</label>
              <input
                type="text"
                value={settings.tagline ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
                placeholder="e.g. Backend Engineer — Building Scalable Systems"
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Bio</label>
              <textarea
                rows={4}
                value={settings.bio ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, bio: e.target.value }))}
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Location</label>
                <input
                  type="text"
                  value={settings.location ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, location: e.target.value }))}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.availableForHire}
                    onChange={(e) => setSettings((s) => ({ ...s, availableForHire: e.target.checked }))}
                    className="w-4 h-4 accent-[#5eead4]"
                  />
                  <span className="text-sm text-gray-300">Available for hire</span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-[#121826] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Social Links</h2>
          <div className="space-y-4">
            {["github", "linkedin", "twitter", "email"].map((key) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-1.5 capitalize">{key}</label>
                <input
                  type="text"
                  value={(settings.socialLinks as Record<string, string>)?.[key] ?? ""}
                  onChange={(e) => updateSocial(key, e.target.value)}
                  placeholder={key === "email" ? "you@example.com" : `https://${key}.com/...`}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-[#121826] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings((s) => ({ ...s, theme: e.target.value }))}
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings((s) => ({ ...s, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={(e) => setSettings((s) => ({ ...s, accentColor: e.target.value }))}
                  className="flex-1 bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SEO */}
        <section className="bg-[#121826] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Meta Title</label>
              <input
                type="text"
                value={settings.metaTitle ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, metaTitle: e.target.value }))}
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Meta Description</label>
              <textarea
                rows={2}
                value={settings.metaDescription ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, metaDescription: e.target.value }))}
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors resize-none"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
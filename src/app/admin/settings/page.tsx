"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Save, Loader2, Camera, X, Check, ZoomIn, ZoomOut } from "lucide-react";
import { COUNTRY_DIAL_CODES } from "@/lib/country-codes";
import { getCroppedImg } from "@/lib/cropImage";

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
    instagram: string;
    youtube: string;
    email: string;
    phone: string;
    phoneCode: string;
    customLinkLabel: string;
    customLinkUrl: string;
    contactTitle: string;
    contactMessage: string;
    heroImageShape: "circle" | "rounded" | "square";
    heroImageSize: "sm" | "md" | "lg";
    heroImageEffect: "none" | "glow" | "spin-ring";
    darkBg: string;
    lightBg: string;
    lightAccent: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Crop state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const onCropComplete = useCallback((_: unknown, pixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(pixels);
  }, []);
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
    socialLinks: { github: "", linkedin: "", twitter: "", instagram: "", youtube: "", email: "", phone: "", phoneCode: "+1", customLinkLabel: "", customLinkUrl: "", contactTitle: "", contactMessage: "", heroImageShape: "circle", heroImageSize: "md", heroImageEffect: "none", darkBg: "#0a0a0a", lightBg: "#ffffff", lightAccent: "" },
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            ...data.settings,
            socialLinks: {
              github: "", linkedin: "", twitter: "", instagram: "", youtube: "", email: "", phone: "", phoneCode: "+1", customLinkLabel: "", customLinkUrl: "", contactTitle: "", contactMessage: "", heroImageShape: "circle", heroImageSize: "md", heroImageEffect: "none", darkBg: "#0a0a0a", lightBg: "#ffffff", lightAccent: "",
              ...data.settings.socialLinks,
            },
          });
        }
        if (data.user) {
          setSlug(data.user.slug ?? "");
          setName(data.user.name ?? "");
          setCustomDomain(data.user.customDomain ?? "");
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, slug, name, customDomain: customDomain || null }),
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

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleCropConfirm = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    setUploading(true);
    setCropSrc(null);
    const blob = await getCroppedImg(cropSrc, croppedAreaPixels);
    const fd = new FormData();
    fd.append("file", blob, "avatar.jpg");
    fd.append("folder", "avatar");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setSettings((s) => ({ ...s, heroImageUrl: url }));
    }
    setUploading(false);
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

            {/* Avatar upload + style */}
            <div className="space-y-4">
              <div className="flex items-start gap-5">
                {/* Preview */}
                <div className="flex-shrink-0">
                  <AvatarPreview
                    src={settings.heroImageUrl || null}
                    name={name}
                    shape={settings.socialLinks.heroImageShape}
                    size={settings.socialLinks.heroImageSize}
                    effect={settings.socialLinks.heroImageEffect}
                    accent={settings.accentColor}
                    uploading={uploading}
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm text-gray-300 font-medium">Profile Photo</p>
                    <p className="text-xs text-gray-500 mt-0.5">Overrides your GitHub avatar on the portfolio</p>
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileSelect} />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Camera size={13} />
                      {uploading ? "Uploading…" : "Upload & Crop"}
                    </button>
                    {settings.heroImageUrl && (
                      <button
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, heroImageUrl: "" }))}
                        className="text-xs text-gray-600 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Shape */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Shape</p>
                    <div className="flex gap-2">
                      {(["circle", "rounded", "square"] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateSocial("heroImageShape", s)}
                          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                            settings.socialLinks.heroImageShape === s
                              ? "border-[#5eead4] text-[#5eead4] bg-[#5eead4]/10"
                              : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                          }`}
                        >
                          <ShapeIcon shape={s} />
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Size</p>
                    <div className="flex gap-2">
                      {([["sm", "Small"], ["md", "Medium"], ["lg", "Large"]] as const).map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateSocial("heroImageSize", val)}
                          className={`px-4 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            settings.socialLinks.heroImageSize === val
                              ? "border-[#5eead4] text-[#5eead4] bg-[#5eead4]/10"
                              : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Effect */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Effect</p>
                    <div className="flex gap-2">
                      {([["none", "None"], ["glow", "Glow"], ["spin-ring", "Spin Ring"]] as const).map(([val, label]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateSocial("heroImageEffect", val)}
                          className={`px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            settings.socialLinks.heroImageEffect === val
                              ? "border-[#5eead4] text-[#5eead4] bg-[#5eead4]/10"
                              : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crop modal */}
            {cropSrc && (
              <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
                <div className="flex items-center justify-between px-5 py-3 bg-[#121826] border-b border-gray-800 flex-shrink-0">
                  <p className="text-white text-sm font-medium">Crop Photo</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCropSrc(null)} className="text-gray-400 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-white/5">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="relative flex-1">
                  <Cropper
                    image={cropSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape={settings.socialLinks.heroImageShape === "circle" ? "round" : "rect"}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    style={{ containerStyle: { background: "#0b0f19" } }}
                  />
                </div>
                <div className="flex items-center justify-between px-5 py-3 bg-[#121826] border-t border-gray-800 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <ZoomOut size={14} className="text-gray-400" />
                    <input
                      type="range" min={1} max={3} step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-32 accent-[#5eead4]"
                    />
                    <ZoomIn size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
                  </div>
                  <button
                    onClick={handleCropConfirm}
                    className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2 rounded-lg text-sm hover:bg-[#4fd1b8] transition-colors cursor-pointer"
                  >
                    <Check size={15} />
                    Apply & Upload
                  </button>
                </div>
              </div>
            )}

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

            {/* Custom Domain */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Custom Domain <span className="text-gray-600">(optional)</span></label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ""))}
                placeholder="vedansh.is-a.dev"
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                Point your domain&apos;s CNAME to your Vercel deployment, then enter it here. Your portfolio will be served at the root of this domain.
              </p>
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
          <h2 className="text-lg font-semibold text-white mb-4">Social Links & Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input type="email" value={settings.socialLinks.email} onChange={(e) => updateSocial("email", e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600" />
            </div>

            {/* Phone with country code */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
              <div className="flex gap-2">
                <select
                  value={settings.socialLinks.phoneCode}
                  onChange={(e) => updateSocial("phoneCode", e.target.value)}
                  className="bg-[#0b0f19] border border-gray-700 rounded-lg px-2 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors w-24 flex-shrink-0"
                >
                  {COUNTRY_DIAL_CODES.map(({ code, name, dial }) => (
                    <option key={code} value={dial}>{dial} {name}</option>
                  ))}
                </select>
                <input type="tel" value={settings.socialLinks.phone} onChange={(e) => updateSocial("phone", e.target.value)}
                  placeholder="234 567 8900"
                  className="flex-1 bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600" />
              </div>
            </div>

            {/* Standard social links */}
            {[
              { key: "github",    label: "GitHub",      placeholder: "https://github.com/username"      },
              { key: "linkedin",  label: "LinkedIn",    placeholder: "https://linkedin.com/in/username" },
              { key: "twitter",   label: "Twitter / X", placeholder: "https://x.com/username"           },
              { key: "instagram", label: "Instagram",   placeholder: "https://instagram.com/username"   },
              { key: "youtube",   label: "YouTube",     placeholder: "https://youtube.com/@channel"     },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                <input type="url" value={(settings.socialLinks as Record<string, string>)[key]} onChange={(e) => updateSocial(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600" />
              </div>
            ))}

            {/* Custom link */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Custom Link — Label <span className="text-gray-600">(e.g. Medium, Dribbble, Behance)</span></label>
              <input type="text" value={settings.socialLinks.customLinkLabel} onChange={(e) => updateSocial("customLinkLabel", e.target.value)}
                placeholder="Medium"
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Custom Link — URL</label>
              <input type="url" value={settings.socialLinks.customLinkUrl} onChange={(e) => updateSocial("customLinkUrl", e.target.value)}
                placeholder="https://medium.com/@username"
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600" />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-[#121826] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Contact Section</h2>
          <p className="text-xs text-gray-500 mb-4">Customize the heading and message shown in your contact section.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Section Title <span className="text-gray-600">(default: "Get In Touch")</span>
              </label>
              <input type="text" value={settings.socialLinks.contactTitle} onChange={(e) => updateSocial("contactTitle", e.target.value)}
                placeholder="Get In Touch"
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Contact Message <span className="text-gray-600">(shown below the title)</span>
              </label>
              <textarea rows={3} value={settings.socialLinks.contactMessage} onChange={(e) => updateSocial("contactMessage", e.target.value)}
                placeholder="I'm currently open to new opportunities. Whether you have a question or just want to say hi, my inbox is always open."
                className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors resize-none placeholder:text-gray-600" />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-[#121826] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Appearance</h2>
          <p className="text-xs text-gray-500 mb-5">Visitors can toggle dark/light mode on your portfolio. Set colors for both.</p>

          {/* Dark theme */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dark Theme</p>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Background</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.socialLinks.darkBg}
                  onChange={(e) => updateSocial("darkBg", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
                <input type="text" value={settings.socialLinks.darkBg}
                  onChange={(e) => updateSocial("darkBg", e.target.value)}
                  className="flex-1 bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] font-mono" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Default: #0a0a0a (near-black)</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.accentColor}
                  onChange={(e) => setSettings((s) => ({ ...s, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
                <input type="text" value={settings.accentColor}
                  onChange={(e) => setSettings((s) => ({ ...s, accentColor: e.target.value }))}
                  className="flex-1 bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] font-mono" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Buttons, links, highlights</p>
            </div>
          </div>

          {/* Light theme */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Light Theme</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Background</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.socialLinks.lightBg}
                  onChange={(e) => updateSocial("lightBg", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
                <input type="text" value={settings.socialLinks.lightBg}
                  onChange={(e) => updateSocial("lightBg", e.target.value)}
                  className="flex-1 bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] font-mono" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Default: #ffffff (white)</p>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Accent Color <span className="text-gray-600">(optional)</span></label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.socialLinks.lightAccent || settings.accentColor}
                  onChange={(e) => updateSocial("lightAccent", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
                <input type="text" value={settings.socialLinks.lightAccent}
                  onChange={(e) => updateSocial("lightAccent", e.target.value)}
                  placeholder={settings.accentColor}
                  className="flex-1 bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] font-mono placeholder:text-gray-600" />
              </div>
              <p className="text-xs text-gray-600 mt-1">Leave blank to use same accent as dark</p>
            </div>
          </div>
        </section>

        {/* Resume */}
        <section className="bg-[#121826] border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Resume</h2>
          <p className="text-xs text-gray-500 mb-4">
            Paste a public link to your resume (e.g. Google Drive, Dropbox). A &ldquo;Download Resume&rdquo; button will appear on your portfolio.
          </p>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Resume URL</label>
            <input
              type="url"
              value={settings.resumeUrl ?? ""}
              onChange={(e) => setSettings((s) => ({ ...s, resumeUrl: e.target.value }))}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600"
            />
            <p className="text-xs text-gray-600 mt-1.5">
              For Google Drive: open the file → Share → &ldquo;Anyone with the link&rdquo; → Copy link.
            </p>
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

// ─── Helper Components ─────────────────────────────────────────────────────

function ShapeIcon({ shape }: { shape: "circle" | "rounded" | "square" }) {
  if (shape === "circle") return <div className="w-5 h-5 rounded-full bg-current opacity-60" />;
  if (shape === "rounded") return <div className="w-5 h-5 rounded-lg bg-current opacity-60" />;
  return <div className="w-5 h-5 rounded-none bg-current opacity-60" />;
}

function AvatarPreview({
  src, name, shape, size, effect, accent, uploading,
}: {
  src: string | null;
  name: string;
  shape: "circle" | "rounded" | "square";
  size: "sm" | "md" | "lg";
  effect: "none" | "glow" | "spin-ring";
  accent: string;
  uploading: boolean;
}) {
  const px = size === "sm" ? 64 : size === "md" ? 96 : 128;
  const radiusClass = shape === "circle" ? "rounded-full" : shape === "rounded" ? "rounded-2xl" : "rounded-none";

  const boxShadow = effect === "glow" ? `0 0 24px 6px ${accent}55` : undefined;

  return (
    <div className="relative flex items-center justify-center" style={{ width: px + 16, height: px + 16 }}>
      {/* Spinning ring */}
      {effect === "spin-ring" && (
        <div
          className="absolute inset-0 animate-spin"
          style={{
            borderRadius: shape === "circle" ? "9999px" : shape === "rounded" ? "1rem" : "0.25rem",
            border: `2px dashed ${accent}`,
            animationDuration: "8s",
          }}
        />
      )}
      <div className="relative" style={{ width: px, height: px, boxShadow }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="Avatar" className={`w-full h-full object-cover ${radiusClass}`} />
        ) : (
          <div className={`w-full h-full bg-[#0b0f19] border border-gray-700 flex items-center justify-center text-gray-500 font-bold ${radiusClass}`}
            style={{ fontSize: px * 0.35 }}>
            {name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        {uploading && (
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center ${radiusClass}`}>
            <Loader2 size={18} className="text-[#5eead4] animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Loader2,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  AlertCircle,
  LayoutTemplate,
  Zap,
  Globe,
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Pencil,
  PanelRight,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Template {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

interface GalleryEntry {
  name: string;
  url: string;
  tagline?: string;
}

// ─── Generate Modal ───────────────────────────────────────

function GenerateModal({
  onClose,
  onGenerated,
  initialPrompt = "",
}: {
  onClose: () => void;
  onGenerated: (html: string, name: string) => void;
  initialPrompt?: string;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      onGenerated(json.html, name || "AI Template");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const presets = [
    "Dark, minimal single-page portfolio with a hero section, animated skill bars, and timeline experience",
    "Clean light theme portfolio, magazine-style layout with card grid for projects and blog",
    "Cyberpunk neon dark theme with glowing borders, monospace font, and terminal-style hero",
    "Elegant brutalist portfolio with bold typography, off-white background, and strong grid layout",
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121826] border border-gray-800 rounded-2xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#5eead4]" />
            Generate with AI
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dark Minimal, Neon Cyberpunk"
              className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Describe your portfolio style</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the visual style, color scheme, layout, typography, animations, and mood..."
              className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] resize-none placeholder:text-gray-600"
            />
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-2">Quick presets</p>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="text-left text-xs text-gray-400 hover:text-white bg-[#0b0f19] border border-gray-800 hover:border-gray-600 rounded-lg px-3 py-2 transition-colors cursor-pointer line-clamp-2"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-[#4fd1b8] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {loading ? "Generating…" : "Generate Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────

function PreviewModal({ templateId, onClose }: { templateId: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col z-50">
      <div className="flex items-center justify-between px-5 py-3 bg-[#121826] border-b border-gray-800">
        <p className="text-sm text-white font-medium">Template Preview</p>
        <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
          <X size={20} />
        </button>
      </div>
      <iframe
        src={`/api/admin/templates/preview?id=${templateId}`}
        className="flex-1 w-full bg-white"
        sandbox="allow-same-origin allow-scripts"
        title="Template preview"
      />
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────

function EditModal({
  templateId,
  templateName,
  onClose,
  onSaved,
}: {
  templateId: string;
  templateName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [html, setHtml] = useState<string | null>(null);
  const [name, setName] = useState(templateName);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    fetch(`/api/admin/templates/detail?id=${templateId}`)
      .then((r) => r.json())
      .then((d) => { setHtml(d.html); setLoading(false); });
  }, [templateId]);

  const handlePreview = async () => {
    if (!html) return;
    setShowPreview(true);
    const res = await fetch("/api/admin/templates/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });
    const rendered = await res.text();
    if (iframeRef.current) iframeRef.current.srcdoc = rendered;
  };

  const handleSave = async () => {
    if (!html) return;
    setSaving(true);
    await fetch("/api/admin/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: templateId, name, html }),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#121826] border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Pencil size={15} className="text-[#5eead4]" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent text-white text-sm font-medium focus:outline-none border-b border-transparent focus:border-gray-600 pb-0.5 w-56"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={showPreview ? () => setShowPreview(false) : handlePreview}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              showPreview
                ? "text-[#5eead4] border-[#5eead4]/40 bg-[#5eead4]/10"
                : "text-gray-400 border-gray-700 hover:text-white hover:border-gray-500"
            }`}
          >
            <PanelRight size={13} />
            {showPreview ? "Hide Preview" : "Live Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-1.5 bg-[#5eead4] text-black text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-[#4fd1b8] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Save
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer ml-1">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-[#5eead4] animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className={showPreview ? "w-1/2" : "w-full"}>
            <MonacoEditor
              height="100%"
              language="html"
              theme="vs-dark"
              value={html ?? ""}
              onChange={(val) => setHtml(val ?? "")}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                wordWrap: "on",
                scrollBeyondLastLine: false,
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Preview pane */}
          {showPreview && (
            <div className="w-1/2 border-l border-gray-800 flex flex-col">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0b0f19] border-b border-gray-800">
                <span className="text-xs text-gray-600">Preview</span>
                <button
                  onClick={handlePreview}
                  className="text-xs text-gray-500 hover:text-[#5eead4] cursor-pointer transition-colors"
                >
                  Refresh
                </button>
              </div>
              <iframe
                ref={iframeRef}
                className="flex-1 w-full bg-white"
                sandbox="allow-same-origin allow-scripts"
                title="Live preview"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Create Similar Modal ────────────────────────────────

const STYLE_CHIPS = ["Dark bg", "Light bg", "Glassmorphism", "Gradient", "Minimal", "Bold typography", "Sidebar layout", "Fullpage scroll", "Neon / Glow", "Monospace font"];

function CreateSimilarModal({
  entry,
  onClose,
  onGenerated,
}: {
  entry: GalleryEntry;
  onClose: () => void;
  onGenerated: (html: string, name: string) => void;
}) {
  const [description, setDescription] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const toggleChip = (chip: string) =>
    setChips((prev) => prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]);

  const fullPrompt = [
    `Create a developer portfolio inspired by the visual style of ${entry.name}'s portfolio (${entry.url}).`,
    chips.length ? `Key style traits: ${chips.join(", ")}.` : "",
    description.trim() ? `User description: ${description.trim()}` : "",
  ].filter(Boolean).join(" ");

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      onGenerated(json.html, `${entry.name} Style`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = chips.length > 0 || description.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121826] border border-gray-800 rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-[#5eead4]" />
              Create Similar to {entry.name}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Visit the site → describe what you see → AI generates it
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Screenshot + visit link */}
          <div className="relative mx-6 mt-5 rounded-xl overflow-hidden border border-gray-800 bg-[#0b0f19] h-44">
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={18} className="text-gray-600 animate-spin" />
              </div>
            )}
            <img
              src={`https://image.thum.io/get/width/900/crop/528/noanimate/${entry.url}`}
              alt={entry.name}
              className="w-full h-full object-cover object-top"
              onLoad={() => setImgLoaded(true)}
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent px-3 py-2 flex items-end justify-between">
              <div>
                <p className="text-xs text-white font-medium">{entry.name}</p>
                {entry.tagline && <p className="text-xs text-gray-400">{entry.tagline}</p>}
              </div>
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#5eead4] hover:text-white border border-[#5eead4]/30 hover:border-[#5eead4]/60 px-2 py-1 rounded-lg bg-black/40 transition-colors"
              >
                <ExternalLink size={10} />
                Visit site
              </a>
            </div>
          </div>

          {/* Style chips */}
          <div className="px-6 mt-4">
            <p className="text-xs text-gray-400 mb-2">Pick styles you see <span className="text-gray-600">(select all that apply)</span></p>
            <div className="flex flex-wrap gap-2">
              {STYLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    chips.includes(chip)
                      ? "bg-[#5eead4]/15 border-[#5eead4]/50 text-[#5eead4]"
                      : "bg-transparent border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="px-6 mt-4">
            <label className="block text-xs text-gray-400 mb-1.5">
              Describe what you see <span className="text-gray-600">(colors, fonts, layout, effects…)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='e.g. "dark navy background, coral accent, Space Grotesk font, floating cards with blur, hero with large name and subtitle, sticky navbar"'
              className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] resize-none placeholder:text-gray-600"
            />
          </div>

          {error && (
            <div className="mx-6 mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-[#4fd1b8] transition-colors disabled:opacity-40 cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? "Generating…" : "Generate Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Save Generated Modal ─────────────────────────────────

function SaveGeneratedModal({
  html,
  initialName,
  onClose,
  onSaved,
}: {
  html: string;
  initialName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadPreview = async () => {
    setShowPreview(true);
    const res = await fetch("/api/admin/templates/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html }),
    });
    const rendered = await res.text();
    if (iframeRef.current) {
      iframeRef.current.srcdoc = rendered;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, html }),
    });
    if (res.ok) onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121826] border border-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">Template Generated</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 p-6">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4]"
              placeholder="Template name"
            />
            <button
              onClick={loadPreview}
              className="flex items-center gap-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
            >
              <Eye size={14} />
              Preview
            </button>
          </div>

          {showPreview ? (
            <iframe
              ref={iframeRef}
              className="flex-1 w-full rounded-xl border border-gray-800 bg-white min-h-[400px]"
              sandbox="allow-same-origin allow-scripts"
              title="Generated template preview"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center min-h-[200px] border border-dashed border-gray-800 rounded-xl text-gray-600 text-sm">
              Click &quot;Preview&quot; to see your template rendered with your portfolio data
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer">
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-[#4fd1b8] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────

function GalleryTab({ onCreateSimilar }: { onCreateSimilar: (entry: GalleryEntry) => void }) {
  const [items, setItems] = useState<GalleryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGallery = useCallback(async (p: number, q: string) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), search: q });
    const res = await fetch(`/api/admin/templates/gallery?${params}`);
    const json = await res.json();
    setItems(json.items || []);
    setTotalPages(json.totalPages || 1);
    setTotal(json.total || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGallery(page, debouncedSearch);
  }, [page, debouncedSearch, fetchGallery]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(val);
    }, 400);
  };

  return (
    <div>
      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name or role (e.g. Full Stack, React)…"
          className="w-full bg-[#0b0f19] border border-gray-800 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] placeholder:text-gray-600"
        />
        {search && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-600 mb-4">
        {total.toLocaleString()} portfolios — browse for inspiration, then recreate a similar style with AI
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={24} className="text-[#5eead4] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {items.map((entry, i) => (
              <div
                key={i}
                className="group bg-[#0b0f19] border border-gray-800 hover:border-gray-600 rounded-xl overflow-hidden flex flex-col transition-colors"
              >
                {/* Screenshot thumbnail */}
                <div className="relative w-full h-44 bg-[#121826] overflow-hidden">
                  <img
                    src={`https://image.thum.io/get/width/600/crop/440/noanimate/${entry.url}`}
                    alt={entry.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      (e.currentTarget.nextSibling as HTMLElement).style.display = "flex";
                    }}
                  />
                  {/* Fallback when screenshot fails */}
                  <div className="absolute inset-0 hidden items-center justify-center text-gray-700 text-xs flex-col gap-2">
                    <Globe size={24} className="text-gray-700" />
                    <span>{entry.url.replace(/^https?:\/\//, "")}</span>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-lg backdrop-blur-sm transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                      Visit
                    </a>
                    <button
                      onClick={() => onCreateSimilar(entry)}
                      className="flex items-center gap-1.5 text-xs text-black bg-[#5eead4] hover:bg-[#4fd1b8] px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      <Sparkles size={12} />
                      Create Similar
                    </button>
                  </div>
                </div>

                {/* Info footer */}
                <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{entry.name}</p>
                    {entry.tagline && (
                      <p className="text-gray-500 text-xs truncate">{entry.tagline}</p>
                    )}
                  </div>
                  <button
                    onClick={() => onCreateSimilar(entry)}
                    className="flex-shrink-0 flex items-center gap-1 text-xs text-[#5eead4] hover:text-white border border-[#5eead4]/20 hover:border-[#5eead4]/50 bg-[#5eead4]/5 hover:bg-[#5eead4]/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Sparkles size={11} />
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ChevronLeft size={15} />
                Prev
              </button>
              <span className="text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-default border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

type Tab = "my-templates" | "gallery";

export default function TemplatesPage() {
  const [tab, setTab] = useState<Tab>("my-templates");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generateInitialPrompt, setGenerateInitialPrompt] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState<{ html: string; name: string } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [editTemplate, setEditTemplate] = useState<{ id: string; name: string } | null>(null);
  const [createSimilarEntry, setCreateSimilarEntry] = useState<GalleryEntry | null>(null);

  const fetchTemplates = async () => {
    const res = await fetch("/api/admin/templates");
    setTemplates(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleActivate = async (id: string | null) => {
    await fetch("/api/admin/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { action: "activate", id } : { action: "deactivate" }),
    });
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/admin/templates?id=${id}`, { method: "DELETE" });
    fetchTemplates();
  };

  const handleDuplicate = async (id: string) => {
    setDuplicating(id);
    const detailRes = await fetch(`/api/admin/templates/detail?id=${id}`);
    if (detailRes.ok) {
      const { name, html } = await detailRes.json();
      await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${name} (copy)`, html }),
      });
      fetchTemplates();
    }
    setDuplicating(null);
  };

  const openGenerateFromGallery = (entry: GalleryEntry) => {
    setCreateSimilarEntry(entry);
  };

  const activeTemplate = templates.find((t) => t.isActive);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutTemplate size={22} />
            Templates
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Browse portfolio inspiration, generate AI templates, and manage your layouts.
          </p>
        </div>
        <button
          onClick={() => { setGenerateInitialPrompt(""); setShowGenerate(true); }}
          className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#4fd1b8] transition-colors cursor-pointer"
        >
          <Sparkles size={16} />
          Generate with AI
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0b0f19] border border-gray-800 rounded-xl p-1 mb-6 w-fit">
        {(
          [
            { key: "my-templates", label: "My Templates", icon: LayoutTemplate },
            { key: "gallery", label: "Portfolio Gallery", icon: Globe },
          ] as { key: Tab; label: string; icon: React.ElementType }[]
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === key
                ? "bg-[#121826] text-white border border-gray-700"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── MY TEMPLATES TAB ── */}
      {tab === "my-templates" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 text-[#5eead4] animate-spin" />
            </div>
          ) : (
            <>
              {/* Active template banner */}
              {activeTemplate && (
                <div className="mb-6 flex items-center justify-between bg-[#5eead4]/10 border border-[#5eead4]/20 rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#5eead4]" />
                    <div>
                      <p className="text-sm text-white font-medium">
                        Active: <span className="text-[#5eead4]">{activeTemplate.name}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Your public portfolio is using this custom template
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleActivate(null)}
                    className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Use Default
                  </button>
                </div>
              )}

              {/* Default template card */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Built-in</p>
                <div
                  className={`bg-[#121826] border rounded-xl p-5 flex items-center justify-between ${
                    !activeTemplate ? "border-[#5eead4]/40" : "border-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0b0f19] border border-gray-700 flex items-center justify-center">
                      <LayoutTemplate size={20} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Default Template</p>
                      <p className="text-gray-500 text-xs mt-0.5">Dark, minimal developer portfolio (built-in)</p>
                    </div>
                  </div>
                  {!activeTemplate ? (
                    <span className="flex items-center gap-1.5 text-xs text-[#5eead4]">
                      <CheckCircle2 size={14} />
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActivate(null)}
                      className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Use this
                    </button>
                  )}
                </div>
              </div>

              {/* Custom templates */}
              {templates.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Your Templates</p>
                  <div className="space-y-3">
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        className={`bg-[#121826] border rounded-xl p-5 flex items-center justify-between gap-4 ${
                          t.isActive ? "border-[#5eead4]/40" : "border-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#5eead4]/20 to-purple-500/20 border border-gray-700 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={18} className="text-[#5eead4]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">{t.name}</p>
                            {t.description && (
                              <p className="text-gray-500 text-xs mt-0.5 truncate">{t.description}</p>
                            )}
                            <p className="text-gray-700 text-xs mt-0.5">
                              Created{" "}
                              {new Date(t.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setPreviewId(t.id)}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye size={13} />
                            Preview
                          </button>
                          <button
                            onClick={() => setEditTemplate({ id: t.id, name: t.name })}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(t.id)}
                            disabled={duplicating === t.id}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {duplicating === t.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Copy size={13} />
                            )}
                            Duplicate
                          </button>
                          {t.isActive ? (
                            <span className="flex items-center gap-1.5 text-xs text-[#5eead4] px-3 py-1.5">
                              <CheckCircle2 size={13} />
                              Active
                            </span>
                          ) : (
                            <button
                              onClick={() => handleActivate(t.id)}
                              className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Use this
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-gray-600 hover:text-red-400 cursor-pointer p-1.5"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {templates.length === 0 && (
                <div className="mt-4 bg-[#121826] border border-dashed border-gray-800 rounded-xl p-12 text-center">
                  <Sparkles size={32} className="mx-auto text-gray-700 mb-3" />
                  <p className="text-gray-400 font-medium mb-1">No custom templates yet</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Generate with AI or browse the Portfolio Gallery for inspiration
                  </p>
                  <button
                    onClick={() => setTab("gallery")}
                    className="inline-flex items-center gap-2 text-sm text-[#5eead4] hover:text-white border border-[#5eead4]/30 hover:border-[#5eead4]/60 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <Globe size={14} />
                    Browse Portfolio Gallery
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── GALLERY TAB ── */}
      {tab === "gallery" && (
        <GalleryTab onCreateSimilar={(entry) => openGenerateFromGallery(entry)} />
      )}

      {/* Modals */}
      {showGenerate && (
        <GenerateModal
          initialPrompt={generateInitialPrompt}
          onClose={() => setShowGenerate(false)}
          onGenerated={(html, name) => {
            setShowGenerate(false);
            setGeneratedHtml({ html, name });
          }}
        />
      )}

      {generatedHtml && (
        <SaveGeneratedModal
          html={generatedHtml.html}
          initialName={generatedHtml.name}
          onClose={() => setGeneratedHtml(null)}
          onSaved={() => {
            setGeneratedHtml(null);
            fetchTemplates();
            setTab("my-templates");
          }}
        />
      )}

      {previewId && <PreviewModal templateId={previewId} onClose={() => setPreviewId(null)} />}

      {createSimilarEntry && (
        <CreateSimilarModal
          entry={createSimilarEntry}
          onClose={() => setCreateSimilarEntry(null)}
          onGenerated={(html, name) => {
            setCreateSimilarEntry(null);
            setGeneratedHtml({ html, name });
          }}
        />
      )}

      {editTemplate && (
        <EditModal
          templateId={editTemplate.id}
          templateName={editTemplate.name}
          onClose={() => setEditTemplate(null)}
          onSaved={() => { setEditTemplate(null); fetchTemplates(); }}
        />
      )}
    </div>
  );
}

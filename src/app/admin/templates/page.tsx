"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Loader2,
  Trash2,
  CheckCircle2,
  Eye,
  X,
  Plus,
  AlertCircle,
  LayoutTemplate,
  Zap,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

// ─── Generate Modal ───────────────────────────────────────

function GenerateModal({ onClose, onGenerated }: { onClose: () => void; onGenerated: (html: string, name: string) => void }) {
  const [prompt, setPrompt] = useState("");
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

// ─── Save Generated Modal (name + preview before saving) ─

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
    // fetch rendered HTML and set as srcdoc
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

// ─── Main Page ────────────────────────────────────────────

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<{ html: string; name: string } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    const res = await fetch("/api/admin/templates");
    setTemplates(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

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

  const activeTemplate = templates.find((t) => t.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[#5eead4] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutTemplate size={22} />
            Templates
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Generate and manage custom portfolio templates using AI.</p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#4fd1b8] transition-colors cursor-pointer"
        >
          <Sparkles size={16} />
          Generate with AI
        </button>
      </div>

      {/* Active template banner */}
      {activeTemplate && (
        <div className="mb-6 flex items-center justify-between bg-[#5eead4]/10 border border-[#5eead4]/20 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#5eead4]" />
            <div>
              <p className="text-sm text-white font-medium">Active: <span className="text-[#5eead4]">{activeTemplate.name}</span></p>
              <p className="text-xs text-gray-500 mt-0.5">Your public portfolio is using this custom template</p>
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
        <div className={`bg-[#121826] border rounded-xl p-5 flex items-center justify-between ${!activeTemplate ? "border-[#5eead4]/40" : "border-gray-800"}`}>
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
                className={`bg-[#121826] border rounded-xl p-5 flex items-center justify-between gap-4 ${t.isActive ? "border-[#5eead4]/40" : "border-gray-800"}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#5eead4]/20 to-purple-500/20 border border-gray-700 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={18} className="text-[#5eead4]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{t.name}</p>
                    {t.description && <p className="text-gray-500 text-xs mt-0.5 truncate">{t.description}</p>}
                    <p className="text-gray-700 text-xs mt-0.5">
                      Created {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
          <p className="text-gray-600 text-sm">Click &quot;Generate with AI&quot; to create your first custom template</p>
        </div>
      )}

      {/* Modals */}
      {showGenerate && (
        <GenerateModal
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
          onSaved={() => { setGeneratedHtml(null); fetchTemplates(); }}
        />
      )}

      {previewId && <PreviewModal templateId={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  );
}

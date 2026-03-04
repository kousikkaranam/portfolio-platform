"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Plus, Loader2, Trash2, Pencil, X, Eye, EyeOff, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";

interface CustomSection {
  id: string;
  title: string;
  content: string | null;
  isVisible: boolean;
  displayOrder: number;
}

// ─── Edit / Create Modal ──────────────────────────────────

function SectionModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: CustomSection;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    if (initial) {
      await fetch("/api/admin/custom-sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: initial.id, title, content }),
      });
    } else {
      await fetch("/api/admin/custom-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
    }
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Section title…"
            className="bg-transparent text-white text-sm font-medium focus:outline-none border-b border-transparent focus:border-gray-600 pb-0.5 w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              preview
                ? "text-[#5eead4] border-[#5eead4]/40 bg-[#5eead4]/10"
                : "text-gray-400 border-gray-700 hover:text-white hover:border-gray-500"
            }`}
          >
            <Eye size={13} />
            {preview ? "Hide Preview" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
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
      <div className="flex-1 flex overflow-hidden">
        {/* Textarea */}
        <div className={preview ? "w-1/2 flex flex-col" : "w-full flex flex-col"}>
          <div className="px-3 py-1.5 bg-[#0b0f19] border-b border-gray-800 text-xs text-gray-600">
            Markdown supported
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your section content in Markdown…&#10;&#10;## Heading&#10;**Bold**, *italic*, - lists, [links](url)"
            className="flex-1 bg-[#0b0f19] text-gray-300 text-sm p-5 resize-none focus:outline-none font-mono leading-relaxed"
          />
        </div>

        {/* Preview pane */}
        {preview && (
          <div className="w-1/2 border-l border-gray-800 overflow-y-auto bg-[#0b0f19]">
            <div className="px-3 py-1.5 border-b border-gray-800 text-xs text-gray-600 bg-[#0b0f19]">
              Preview
            </div>
            <div className="p-5 prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-p:text-gray-400 prose-strong:text-white
              prose-a:text-[#5eead4] prose-ul:text-gray-400 prose-ol:text-gray-400
              prose-li:marker:text-gray-600 prose-blockquote:border-l-2 prose-blockquote:text-gray-500">
              <ReactMarkdown>{content || "*Start typing to see preview…*"}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

export default function CustomSectionsPage() {
  const [sections, setSections] = useState<CustomSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CustomSection | undefined>();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/custom-sections");
    setSections(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleVisible = async (s: CustomSection) => {
    await fetch("/api/admin/custom-sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: s.id, isVisible: !s.isVisible }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    setDeleting(id);
    await fetch(`/api/admin/custom-sections?id=${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= sections.length) return;
    const updated = [...sections];
    [updated[index], updated[next]] = [updated[next], updated[index]];
    // Persist new displayOrders
    await Promise.all(
      updated.map((s, i) =>
        fetch("/api/admin/custom-sections", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: s.id, displayOrder: i }),
        })
      )
    );
    load();
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Custom Sections</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Add your own sections to your portfolio (awards, publications, talks, etc.)
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-[#4fd1b8] transition-colors cursor-pointer"
        >
          <Plus size={16} />
          New Section
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={24} className="text-[#5eead4] animate-spin" />
        </div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-lg">No custom sections yet.</p>
          <p className="text-sm mt-1">Create one to add unique content to your portfolio.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-3 bg-[#121826] border border-gray-800 rounded-xl px-4 py-3"
            >
              {/* Order */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-600 hover:text-gray-400 disabled:opacity-20 cursor-pointer">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="text-gray-600 hover:text-gray-400 disabled:opacity-20 cursor-pointer">
                  <ChevronDown size={14} />
                </button>
              </div>

              {/* Title + excerpt */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{s.title}</p>
                {s.content && (
                  <p className="text-gray-500 text-xs truncate mt-0.5">{s.content.slice(0, 80)}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleVisible(s)}
                  title={s.isVisible ? "Visible" : "Hidden"}
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {s.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => setEditing(s)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deleting === s.id}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-400/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deleting === s.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600 mt-6">
        To add a custom section to your portfolio, go to <strong className="text-gray-500">Sections</strong> and drag it into place.
      </p>

      {creating && (
        <SectionModal
          onClose={() => setCreating(false)}
          onSaved={() => { setCreating(false); load(); }}
        />
      )}

      {editing && (
        <SectionModal
          initial={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => { setEditing(undefined); load(); }}
        />
      )}
    </div>
  );
}

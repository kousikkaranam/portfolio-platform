
"use client";
import { useState, useEffect } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { Field, FieldArea } from "@/components/admin/FormFields";

interface EngineeringItem {
  id?: string;
  title: string;
  summary: string;
  content?: string;
  techStack: string[];
  diagramUrl?: string;
  impact?: string;
  isFeatured: boolean;
  status: string;
}

const empty: EngineeringItem = {
  title: "", summary: "", content: "", techStack: [],
  diagramUrl: "", impact: "", isFeatured: false, status: "published",
};

export default function EngineeringAdmin() {
  const [items, setItems] = useState<EngineeringItem[]>([]);
  const [editing, setEditing] = useState<EngineeringItem | null>(null);
  const [techInput, setTechInput] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/engineering");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    await fetch("/api/admin/engineering", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/engineering?id=${id}`, { method: "DELETE" });
    load();
  };

  const addTech = () => {
    if (techInput.trim() && editing) {
      setEditing({ ...editing, techStack: [...editing.techStack, techInput.trim()] });
      setTechInput("");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#5eead4] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Engineering Highlights</h1>
          <p className="text-gray-400 text-sm mt-1">Deep dives, system designs, and technical case studies</p>
        </div>
        <button onClick={() => { setEditing({ ...empty }); setTechInput(""); }}
          className="px-4 py-2 bg-[#5eead4] text-[#0b0f19] rounded-lg text-sm font-medium hover:bg-[#5eead4]/90 transition-colors">
          + Add Highlight
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-[#121826] border border-gray-800 rounded-xl">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-white">{item.title}</h3>
                {item.isFeatured && <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">Featured</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-700 text-gray-400"}`}>{item.status}</span>
              </div>
              <p className="text-sm text-gray-400 truncate mt-0.5">{item.summary}</p>
              {item.impact && <p className="text-xs text-[#5eead4] mt-1">{item.impact}</p>}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => { setEditing({ ...item }); setTechInput(""); }} className="text-sm text-[#5eead4] hover:text-[#5eead4]/80">Edit</button>
              <button onClick={() => remove(item.id!)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-16 text-gray-500">No engineering highlights yet</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121826] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-white mb-5">{editing.id ? "Edit" : "New"} Engineering Highlight</h2>
            <div className="space-y-4">
              <Field label="Title *" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
              <FieldArea label="Summary *" value={editing.summary} onChange={(v) => setEditing({ ...editing, summary: v })} rows={2} placeholder="Brief overview shown in cards" />
              <FieldArea label="Full Content (Markdown)" value={editing.content || ""} onChange={(v) => setEditing({ ...editing, content: v })} rows={8} placeholder="Detailed write-up..." mono />
              <Field label="Impact" value={editing.impact || ""} onChange={(v) => setEditing({ ...editing, impact: v })} placeholder="e.g. Reduced query time from 20s to 200ms" />
              <ImageUpload value={editing.diagramUrl} onChange={(url) => setEditing({ ...editing, diagramUrl: url })} folder="engineering" label="Architecture / Diagram" />

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Tech Stack</label>
                <div className="flex gap-2">
                  <input className="flex-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:border-[#5eead4] focus:outline-none"
                    value={techInput} onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())} placeholder="Type and press Enter" />
                  <button onClick={addTech} className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">Add</button>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {editing.techStack.map((t, i) => (
                    <span key={i} className="text-xs bg-[#5eead4]/10 text-[#5eead4] px-2 py-1 rounded flex items-center gap-1">
                      {t}<button onClick={() => setEditing({ ...editing, techStack: editing.techStack.filter((_, j) => j !== i) })} className="text-[#5eead4]/50 hover:text-red-400">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1 block">Status</label>
                  <select className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-sm text-white focus:border-[#5eead4] focus:outline-none"
                    value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.isFeatured}
                      onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
                      className="rounded bg-[#0b0f19] border-gray-600 text-[#5eead4] focus:ring-[#5eead4]" />
                    <span className="text-sm text-gray-300">Featured</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800">Cancel</button>
              <button onClick={save} disabled={!editing.title || !editing.summary}
                className="px-4 py-2 text-sm bg-[#5eead4] text-[#0b0f19] font-medium rounded-lg disabled:opacity-40 hover:bg-[#5eead4]/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
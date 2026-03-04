
"use client";
import { useState, useEffect } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

interface EngineeringItem {
  id?: string;
  title: string;
  slug?: string;
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

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Engineering Highlights</h1>
          <p className="text-sm text-gray-500 mt-1">Deep dives, system designs, and technical case studies</p>
        </div>
        <button onClick={() => { setEditing({ ...empty }); setTechInput(""); }}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">+ Add Highlight</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{item.title}</h3>
                {item.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.status}</span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">{item.summary}</p>
              {item.impact && <p className="text-xs text-blue-600 mt-1">{item.impact}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditing({ ...item }); setTechInput(""); }} className="text-sm text-blue-600 hover:underline">Edit</button>
              <button onClick={() => remove(item.id!)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400 text-center py-12">No engineering highlights yet</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} Engineering Highlight</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>

              <div>
                <label className="text-sm font-medium">Summary *</label>
                <textarea className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" rows={2} value={editing.summary}
                  onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                  placeholder="Brief overview shown in cards" />
              </div>

              <div>
                <label className="text-sm font-medium">Full Content (Markdown)</label>
                <textarea className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono" rows={8}
                  value={editing.content || ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  placeholder="Detailed write-up..." />
              </div>

              <div>
                <label className="text-sm font-medium">Impact</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.impact || ""}
                  onChange={(e) => setEditing({ ...editing, impact: e.target.value })}
                  placeholder="e.g. Reduced query time from 20s to 200ms" />
              </div>

              <ImageUpload value={editing.diagramUrl} onChange={(url) => setEditing({ ...editing, diagramUrl: url })}
                folder="engineering" label="Architecture / Diagram" />

              <div>
                <label className="text-sm font-medium">Tech Stack</label>
                <div className="flex gap-2 mt-1">
                  <input className="flex-1 px-3 py-2 border rounded-lg text-sm" value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                    placeholder="Type and press Enter" />
                  <button onClick={addTech} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Add</button>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {editing.techStack.map((t, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                      {t}
                      <button onClick={() => setEditing({ ...editing, techStack: editing.techStack.filter((_, j) => j !== i) })}
                        className="text-gray-400 hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={editing.isFeatured}
                      onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })} className="rounded" />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={!editing.title || !editing.summary}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-40 hover:bg-gray-800">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

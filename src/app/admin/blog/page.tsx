
"use client";
import { useState, useEffect } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import { Field, FieldArea } from "@/components/admin/FormFields";

interface BlogPost {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  readTimeMin?: number;
  status: string;
  publishedAt?: string;
  createdAt?: string;
}

const empty: BlogPost = { title: "", excerpt: "", content: "", coverImageUrl: "", tags: [], status: "draft" };

export default function BlogAdmin() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => { const res = await fetch("/api/admin/blog"); setItems(await res.json()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    await fetch("/api/admin/blog", { method: editing.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    setEditing(null); load();
  };

  const remove = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" }); load(); };
  const addTag = () => { if (tagInput.trim() && editing) { setEditing({ ...editing, tags: [...editing.tags, tagInput.trim()] }); setTagInput(""); } };
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#5eead4] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-gray-400 text-sm mt-1">Write and publish articles</p>
        </div>
        <button onClick={() => { setEditing({ ...empty }); setTagInput(""); }}
          className="px-4 py-2 bg-[#5eead4] text-[#0b0f19] rounded-lg text-sm font-medium hover:bg-[#5eead4]/90 transition-colors">+ New Post</button>
      </div>

      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 bg-[#121826] border border-gray-800 rounded-xl">
            {p.coverImageUrl && <img src={p.coverImageUrl} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-white truncate">{p.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-700 text-gray-400"}`}>{p.status}</span>
                {p.readTimeMin && <span className="text-xs text-gray-500">{p.readTimeMin} min read</span>}
              </div>
              <p className="text-sm text-gray-400 truncate mt-0.5">{p.excerpt}</p>
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {p.tags.map((t) => <span key={t} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">{t}</span>)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex gap-3">
                <button onClick={() => { setEditing({ ...p }); setTagInput(""); }} className="text-sm text-[#5eead4] hover:text-[#5eead4]/80">Edit</button>
                <button onClick={() => remove(p.id!)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
              </div>
              <span className="text-xs text-gray-500">{fmtDate(p.createdAt)}</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-16 text-gray-500">No blog posts yet</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121826] border border-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-white mb-5">{editing.id ? "Edit" : "New"} Blog Post</h2>
            <div className="space-y-4">
              <ImageUpload value={editing.coverImageUrl} onChange={(url) => setEditing({ ...editing, coverImageUrl: url })} folder="blog" label="Cover Image" />
              <Field label="Title *" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Excerpt" value={editing.excerpt} onChange={(v) => setEditing({ ...editing, excerpt: v })} placeholder="Brief summary for cards (max 500 chars)" />
              <div>
                <FieldArea label="Content * (Markdown)" value={editing.content} onChange={(v) => setEditing({ ...editing, content: v })} rows={14} mono />
                <p className="text-xs text-gray-500 mt-1">~{Math.max(1, Math.ceil((editing.content || "").split(/\s+/).length / 200))} min read</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Tags</label>
                <div className="flex gap-2">
                  <input className="flex-1 px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:border-[#5eead4] focus:outline-none"
                    value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Type and press Enter" />
                  <button onClick={addTag} className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">Add</button>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {editing.tags.map((t, i) => (
                    <span key={i} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                      {t}<button onClick={() => setEditing({ ...editing, tags: editing.tags.filter((_, j) => j !== i) })} className="text-blue-400/50 hover:text-red-400">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-1 block">Status</label>
                <select className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-700 rounded-lg text-sm text-white focus:border-[#5eead4] focus:outline-none"
                  value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800">Cancel</button>
              <button onClick={save} disabled={!editing.title || !editing.content}
                className="px-4 py-2 text-sm bg-[#5eead4] text-[#0b0f19] font-medium rounded-lg disabled:opacity-40 hover:bg-[#5eead4]/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

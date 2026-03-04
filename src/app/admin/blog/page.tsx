
"use client";
import { useState, useEffect } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

interface BlogPost {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  readTimeMin?: number;
  status: string;
  publishedAt?: string;
  createdAt?: string;
}

const empty: BlogPost = {
  title: "", excerpt: "", content: "", coverImageUrl: "", tags: [], status: "draft",
};

export default function BlogAdmin() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/blog");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    await fetch("/api/admin/blog", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    load();
  };

  const addTag = () => {
    if (tagInput.trim() && editing) {
      setEditing({ ...editing, tags: [...editing.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button onClick={() => { setEditing({ ...empty }); setTagInput(""); }}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">+ New Post</button>
      </div>

      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
            {p.coverImageUrl && <img src={p.coverImageUrl} alt="" className="w-20 h-14 rounded-md object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{p.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  p.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>{p.status}</span>
                {p.readTimeMin && <span className="text-xs text-gray-400">{p.readTimeMin} min read</span>}
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">{p.excerpt}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {p.tags.map((t) => (
                  <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex gap-2">
                <button onClick={() => { setEditing({ ...p }); setTagInput(""); }} className="text-sm text-blue-600 hover:underline">Edit</button>
                <button onClick={() => remove(p.id!)} className="text-sm text-red-600 hover:underline">Delete</button>
              </div>
              <span className="text-xs text-gray-400">{fmtDate(p.createdAt)}</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400 text-center py-12">No blog posts yet</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} Blog Post</h2>
            <div className="space-y-4">
              <ImageUpload value={editing.coverImageUrl} onChange={(url) => setEditing({ ...editing, coverImageUrl: url })}
                folder="blog" label="Cover Image" />

              <div>
                <label className="text-sm font-medium">Title *</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>

              <div>
                <label className="text-sm font-medium">Excerpt</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  placeholder="Brief summary for cards (max 500 chars)" maxLength={500} />
              </div>

              <div>
                <label className="text-sm font-medium">Content * (Markdown)</label>
                <textarea className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono" rows={14}
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
                <p className="text-xs text-gray-400 mt-1">
                  ~{Math.max(1, Math.ceil((editing.content || "").split(/\s+/).length / 200))} min read
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2 mt-1">
                  <input className="flex-1 px-3 py-2 border rounded-lg text-sm" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Type and press Enter" />
                  <button onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Add</button>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {editing.tags.map((t, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                      {t}
                      <button onClick={() => setEditing({ ...editing, tags: editing.tags.filter((_, j) => j !== i) })}
                        className="text-blue-300 hover:text-red-500">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={!editing.title || !editing.content}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-40 hover:bg-gray-800">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
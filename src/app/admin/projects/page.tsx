
"use client";
import { useState, useEffect } from "react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Project {
  id?: string;
  title: string;
  slug?: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  thumbnailUrl?: string;
  screenshots: string[];
  architectureUrl?: string;
  category?: string;
  isFeatured: boolean;
  status: string;
  displayOrder?: number;
}

const empty: Project = {
  title: "", description: "", longDescription: "", techStack: [],
  githubUrl: "", liveUrl: "", thumbnailUrl: "", screenshots: [],
  architectureUrl: "", category: "", isFeatured: false, status: "published",
};

export default function ProjectsAdmin() {
  const [items, setItems] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [techInput, setTechInput] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/projects");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const method = editing.id ? "PUT" : "POST";
    await fetch("/api/admin/projects", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
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
        <h1 className="text-2xl font-bold">Projects</h1>
        <button onClick={() => setEditing({ ...empty })}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">+ Add Project</button>
      </div>

      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
            {p.thumbnailUrl && <img src={p.thumbnailUrl} alt="" className="w-16 h-16 rounded-md object-cover" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{p.title}</h3>
                {p.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>}
                {p.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.category}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">{p.description}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {p.techStack.slice(0, 5).map((t) => (
                  <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t}</span>
                ))}
                {p.techStack.length > 5 && <span className="text-xs text-gray-400">+{p.techStack.length - 5}</span>}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => { setEditing({ ...p }); setTechInput(""); }} className="text-sm text-blue-600 hover:underline">Edit</button>
              <button onClick={() => remove(p.id!)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400 text-center py-12">No projects yet. Add your first one!</p>}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} Project</h2>
            <div className="space-y-4">
              <ImageUpload value={editing.thumbnailUrl} onChange={(url) => setEditing({ ...editing, thumbnailUrl: url })} folder="projects" label="Thumbnail" />

              <div>
                <label className="text-sm font-medium">Title *</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.category || ""}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    <option value="">None</option>
                    <option value="fullstack">Full Stack</option>
                    <option value="backend">Backend</option>
                    <option value="frontend">Frontend</option>
                    <option value="devops">DevOps</option>
                    <option value="mobile">Mobile</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Short Description *</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div>
                <label className="text-sm font-medium">Long Description (Markdown)</label>
                <textarea className="w-full mt-1 px-3 py-2 border rounded-lg text-sm font-mono" rows={5}
                  value={editing.longDescription || ""}
                  onChange={(e) => setEditing({ ...editing, longDescription: e.target.value })} />
              </div>

              <div>
                <label className="text-sm font-medium">Tech Stack</label>
                <div className="flex gap-2 mt-1">
                  <input className="flex-1 px-3 py-2 border rounded-lg text-sm" value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                    placeholder="Type and press Enter" />
                  <button onClick={addTech} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Add</button>
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
                  <label className="text-sm font-medium">Live URL</label>
                  <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.liveUrl || ""}
                    onChange={(e) => setEditing({ ...editing, liveUrl: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">GitHub URL</label>
                  <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.githubUrl || ""}
                    onChange={(e) => setEditing({ ...editing, githubUrl: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Architecture Diagram URL</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.architectureUrl || ""}
                  onChange={(e) => setEditing({ ...editing, architectureUrl: e.target.value })}
                  placeholder="Or use upload above and paste URL" />
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.isFeatured}
                  onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
                  className="rounded" />
                <span className="text-sm">Featured Project (shown prominently)</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={!editing.title || !editing.description}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-40 hover:bg-gray-800">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

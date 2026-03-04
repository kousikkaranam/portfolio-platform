
"use client";
import { useState, useEffect } from "react";

interface Education {
  id?: string;
  institution: string;
  degree?: string;
  field?: string;
  startYear?: number | string;
  endYear?: number | string;
  description?: string;
}

const empty: Education = {
  institution: "", degree: "", field: "", startYear: "", endYear: "", description: "",
};

export default function EducationAdmin() {
  const [items, setItems] = useState<Education[]>([]);
  const [editing, setEditing] = useState<Education | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/education");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    await fetch("/api/admin/education", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/education?id=${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Education</h1>
        <button onClick={() => setEditing({ ...empty })}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">+ Add Education</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-400">
              {item.institution.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium">{item.degree && item.field ? `${item.degree} in ${item.field}` : item.degree || item.institution}</h3>
              <p className="text-sm text-gray-500">{item.institution}</p>
              <p className="text-xs text-gray-400">
                {item.startYear || "?"} — {item.endYear || "Present"}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setEditing({ ...item })} className="text-sm text-blue-600 hover:underline">Edit</button>
              <button onClick={() => remove(item.id!)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400 text-center py-12">No education entries yet</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} Education</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Institution *</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.institution}
                  onChange={(e) => setEditing({ ...editing, institution: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Degree</label>
                  <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.degree || ""}
                    onChange={(e) => setEditing({ ...editing, degree: e.target.value })} placeholder="B.Tech" />
                </div>
                <div>
                  <label className="text-sm font-medium">Field of Study</label>
                  <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.field || ""}
                    onChange={(e) => setEditing({ ...editing, field: e.target.value })} placeholder="Computer Science" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Year</label>
                  <input type="number" min="1990" max="2030" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                    value={editing.startYear || ""}
                    onChange={(e) => setEditing({ ...editing, startYear: e.target.value })} placeholder="2018" />
                </div>
                <div>
                  <label className="text-sm font-medium">End Year</label>
                  <input type="number" min="1990" max="2030" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                    value={editing.endYear || ""}
                    onChange={(e) => setEditing({ ...editing, endYear: e.target.value })} placeholder="2022 (blank = Present)" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" rows={3}
                  value={editing.description || ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Relevant coursework, achievements, etc." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={!editing.institution}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-40 hover:bg-gray-800">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { Field, FieldArea } from "@/components/admin/FormFields";
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

const empty: Education = { institution: "", degree: "", field: "", startYear: "", endYear: "", description: "" };

export default function EducationAdmin() {
  const [items, setItems] = useState<Education[]>([]);
  const [editing, setEditing] = useState<Education | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => { const res = await fetch("/api/admin/education"); setItems(await res.json()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    await fetch("/api/admin/education", { method: editing.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    setEditing(null); load();
  };

  const remove = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/admin/education?id=${id}`, { method: "DELETE" }); load(); };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#5eead4] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Education</h1>
          <p className="text-gray-400 text-sm mt-1">Academic background</p>
        </div>
        <button onClick={() => setEditing({ ...empty })}
          className="px-4 py-2 bg-[#5eead4] text-[#0b0f19] rounded-lg text-sm font-medium hover:bg-[#5eead4]/90 transition-colors">+ Add Education</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-[#121826] border border-gray-800 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-[#5eead4]/10 flex items-center justify-center text-lg font-bold text-[#5eead4] flex-shrink-0">
              {item.institution.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white">{item.degree && item.field ? `${item.degree} in ${item.field}` : item.degree || item.institution}</h3>
              <p className="text-sm text-gray-400">{item.institution}</p>
              <p className="text-xs text-gray-500">{item.startYear || "?"} — {item.endYear || "Present"}</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => setEditing({ ...item })} className="text-sm text-[#5eead4] hover:text-[#5eead4]/80">Edit</button>
              <button onClick={() => remove(item.id!)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-16 text-gray-500">No education entries yet</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121826] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-white mb-5">{editing.id ? "Edit" : "New"} Education</h2>
            <div className="space-y-4">
              <Field label="Institution *" value={editing.institution} onChange={(v) => setEditing({ ...editing, institution: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Degree" value={editing.degree || ""} onChange={(v) => setEditing({ ...editing, degree: v })} placeholder="B.Tech" />
                <Field label="Field of Study" value={editing.field || ""} onChange={(v) => setEditing({ ...editing, field: v })} placeholder="Computer Science" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Year" value={String(editing.startYear || "")} onChange={(v) => setEditing({ ...editing, startYear: v })} placeholder="2018" type="number" />
                <Field label="End Year" value={String(editing.endYear || "")} onChange={(v) => setEditing({ ...editing, endYear: v })} placeholder="2022 (blank = Present)" type="number" />
              </div>
              <FieldArea label="Description" value={editing.description || ""} onChange={(v) => setEditing({ ...editing, description: v })} rows={3} placeholder="Relevant coursework, achievements..." />
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800">Cancel</button>
              <button onClick={save} disabled={!editing.institution}
                className="px-4 py-2 text-sm bg-[#5eead4] text-[#0b0f19] font-medium rounded-lg disabled:opacity-40 hover:bg-[#5eead4]/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

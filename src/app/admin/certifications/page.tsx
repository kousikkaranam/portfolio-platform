
"use client";
import { Field } from "@/components/admin/FormFields";
import { useState, useEffect } from "react";

interface Certification {
  id?: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
}

const empty: Certification = { name: "", issuer: "", issueDate: "", credentialUrl: "" };

export default function CertificationsAdmin() {
  const [items, setItems] = useState<Certification[]>([]);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => { const res = await fetch("/api/admin/certifications"); setItems(await res.json()); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    await fetch("/api/admin/certifications", { method: editing.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    setEditing(null); load();
  };

  const remove = async (id: string) => { if (!confirm("Delete?")) return; await fetch(`/api/admin/certifications?id=${id}`, { method: "DELETE" }); load(); };
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#5eead4] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Certifications</h1>
          <p className="text-gray-400 text-sm mt-1">Professional credentials</p>
        </div>
        <button onClick={() => setEditing({ ...empty })}
          className="px-4 py-2 bg-[#5eead4] text-[#0b0f19] rounded-lg text-sm font-medium hover:bg-[#5eead4]/90 transition-colors">+ Add Certification</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-[#121826] border border-gray-800 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white">{item.name}</h3>
              {item.issuer && <p className="text-sm text-gray-400">{item.issuer}</p>}
              {item.issueDate && <p className="text-xs text-gray-500">Issued {fmtDate(item.issueDate)}</p>}
            </div>
            <div className="flex gap-3 flex-shrink-0">
              {item.credentialUrl && <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">View</a>}
              <button onClick={() => setEditing({ ...item })} className="text-sm text-[#5eead4] hover:text-[#5eead4]/80">Edit</button>
              <button onClick={() => remove(item.id!)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-16 text-gray-500">No certifications yet</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#121826] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold text-white mb-5">{editing.id ? "Edit" : "New"} Certification</h2>
            <div className="space-y-4">
              <Field label="Name *" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} placeholder="AWS Solutions Architect Professional" />
              <Field label="Issuer" value={editing.issuer || ""} onChange={(v) => setEditing({ ...editing, issuer: v })} placeholder="Amazon Web Services" />
              <Field label="Issue Date" value={editing.issueDate ? editing.issueDate.split("T")[0] : ""} onChange={(v) => setEditing({ ...editing, issueDate: v })} type="date" />
              <Field label="Credential URL" value={editing.credentialUrl || ""} onChange={(v) => setEditing({ ...editing, credentialUrl: v })} placeholder="https://verify.example.com/..." />
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800">Cancel</button>
              <button onClick={save} disabled={!editing.name}
                className="px-4 py-2 text-sm bg-[#5eead4] text-[#0b0f19] font-medium rounded-lg disabled:opacity-40 hover:bg-[#5eead4]/90">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

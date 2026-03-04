
"use client";
import { useState, useEffect } from "react";

interface Certification {
  id?: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
}

const empty: Certification = {
  name: "", issuer: "", issueDate: "", credentialUrl: "",
};

export default function CertificationsAdmin() {
  const [items, setItems] = useState<Certification[]>([]);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/certifications");
    setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    await fetch("/api/admin/certifications", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/certifications?id=${id}`, { method: "DELETE" });
    load();
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "";

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Certifications</h1>
        <button onClick={() => setEditing({ ...empty })}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800">+ Add Certification</button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium">{item.name}</h3>
              {item.issuer && <p className="text-sm text-gray-500">{item.issuer}</p>}
              {item.issueDate && <p className="text-xs text-gray-400">Issued {fmtDate(item.issueDate)}</p>}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {item.credentialUrl && (
                <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-gray-600">View</a>
              )}
              <button onClick={() => setEditing({ ...item })} className="text-sm text-blue-600 hover:underline">Edit</button>
              <button onClick={() => remove(item.id!)} className="text-sm text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400 text-center py-12">No certifications yet</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} Certification</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Certification Name *</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="AWS Solutions Architect Professional" />
              </div>
              <div>
                <label className="text-sm font-medium">Issuer</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.issuer || ""}
                  onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
                  placeholder="Amazon Web Services" />
              </div>
              <div>
                <label className="text-sm font-medium">Issue Date</label>
                <input type="date" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
                  value={editing.issueDate ? editing.issueDate.split("T")[0] : ""}
                  onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Credential URL</label>
                <input className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" value={editing.credentialUrl || ""}
                  onChange={(e) => setEditing({ ...editing, credentialUrl: e.target.value })}
                  placeholder="https://verify.example.com/..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={!editing.name}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg disabled:opacity-40 hover:bg-gray-800">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
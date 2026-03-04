"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface Experience {
  id: string;
  company: string;
  role: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  techStack: string[];
  githubUrl: string | null;
  displayOrder: number;
}

const emptyForm = {
  company: "",
  role: "",
  description: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  techStackInput: "",
  techStack: [] as string[],
  githubUrl: "",
};

export default function ExperiencePage() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = async () => {
    const r = await fetch("/api/admin/experience");
    setItems(await r.json());
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (exp: Experience) => {
    setEditing(exp);
    setForm({
      company: exp.company,
      role: exp.role,
      description: exp.description ?? "",
      location: exp.location ?? "",
      startDate: exp.startDate?.slice(0, 10) ?? "",
      endDate: exp.endDate?.slice(0, 10) ?? "",
      isCurrent: exp.isCurrent,
      techStackInput: "",
      techStack: exp.techStack ?? [],
      githubUrl: exp.githubUrl ?? "",
    });
    setShowModal(true);
  };

  const addTech = () => {
    const val = form.techStackInput.trim();
    if (val && !form.techStack.includes(val)) {
      setForm((f) => ({ ...f, techStack: [...f.techStack, val], techStackInput: "" }));
    }
  };

  const removeTech = (tech: string) => {
    setForm((f) => ({ ...f, techStack: f.techStack.filter((t) => t !== tech) }));
  };

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const payload = {
      ...(editing && { id: editing.id }),
      company: form.company,
      role: form.role,
      description: form.description,
      location: form.location,
      startDate: form.startDate,
      endDate: form.isCurrent ? null : form.endDate || null,
      isCurrent: form.isCurrent,
      techStack: form.techStack,
      githubUrl: form.githubUrl || null,
    };

    await fetch("/api/admin/experience", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experience?")) return;
    await fetch(`/api/admin/experience?id=${id}`, { method: "DELETE" });
    fetchItems();
  };

  const formatDate = (d: string | null) => {
    if (!d) return "Present";
    return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[#5eead4] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Experience</h1>
          <p className="text-gray-400 mt-1">{items.length} entries</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#4fd1b8] transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add Experience
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-[#121826] border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No experience added yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((exp) => (
            <div key={exp.id} className="bg-[#121826] border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{exp.role}</h3>
                  <p className="text-[#5eead4] text-sm">{exp.company}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatDate(exp.startDate)} — {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  {exp.description && (
                    <p className="text-gray-400 text-sm mt-3 line-clamp-2">{exp.description}</p>
                  )}
                  {exp.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {exp.techStack.map((t) => (
                        <span key={t} className="bg-[#0b0f19] text-gray-400 text-xs px-2 py-1 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => openEdit(exp)} className="text-gray-500 hover:text-white cursor-pointer">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(exp.id)} className="text-gray-500 hover:text-red-400 cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-[#121826] border border-gray-800 rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editing ? "Edit Experience" : "Add Experience"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Company</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    disabled={form.isCurrent}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] disabled:opacity-40"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isCurrent}
                  onChange={(e) => setForm((f) => ({ ...f, isCurrent: e.target.checked }))}
                  className="w-4 h-4 accent-[#5eead4]"
                />
                <span className="text-sm text-gray-300">I currently work here</span>
              </label>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Tech Stack</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.techStackInput}
                    onChange={(e) => setForm((f) => ({ ...f, techStackInput: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                    placeholder="Type and press Enter"
                    className="flex-1 bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={addTech}
                    className="bg-gray-700 text-white px-3 py-2.5 rounded-lg text-sm hover:bg-gray-600 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {form.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.techStack.map((t) => (
                      <span
                        key={t}
                        className="flex items-center gap-1 bg-[#0b0f19] text-gray-300 text-xs px-2 py-1 rounded"
                      >
                        {t}
                        <button onClick={() => removeTech(t)} className="text-gray-500 hover:text-red-400 cursor-pointer">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Work GitHub URL <span className="text-gray-600">(optional)</span></label>
                <input
                  type="url"
                  value={form.githubUrl}
                  onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                  placeholder="https://github.com/your-org"
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] placeholder:text-gray-600"
                />
                <p className="text-xs text-gray-600 mt-1">Shown in the GitHub section as your work contribution chart</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.company.trim() || !form.role.trim() || !form.startDate}
                className="bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-[#4fd1b8] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
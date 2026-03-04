"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

interface Skill {
  id: string;
  category: string;
  name: string;
  proficiency: number | null;
  displayOrder: number;
}

const CATEGORIES = ["Backend", "Frontend", "Database", "DevOps", "Tools", "Languages", "Other"];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [form, setForm] = useState({ category: "Backend", name: "", proficiency: "" });

  const fetchSkills = async () => {
    const r = await fetch("/api/admin/skills");
    const data = await r.json();
    setSkills(data);
    setLoading(false);
  };

  useEffect(() => { fetchSkills(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ category: "Backend", name: "", proficiency: "" });
    setShowModal(true);
  };

  const openEdit = (skill: Skill) => {
    setEditing(skill);
    setForm({
      category: skill.category,
      name: skill.name,
      proficiency: skill.proficiency?.toString() ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;

    await fetch("/api/admin/skills", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setShowModal(false);
    fetchSkills();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    await fetch(`/api/admin/skills?id=${id}`, { method: "DELETE" });
    fetchSkills();
  };

  // Group skills by category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] = acc[skill.category] || []).push(skill);
    return acc;
  }, {});

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
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-gray-400 mt-1">{skills.length} skills across {Object.keys(grouped).length} categories</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#4fd1b8] transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add Skill
        </button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-[#121826] border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No skills added yet. Click "Add Skill" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-[#121826] border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-[#5eead4] uppercase tracking-wider mb-4">
                {category}
              </h2>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <div
                    key={skill.id}
                    className="group flex items-center gap-2 bg-[#0b0f19] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300"
                  >
                    <span>{skill.name}</span>
                    <button
                      onClick={() => openEdit(skill)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-all cursor-pointer"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#121826] border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editing ? "Edit Skill" : "Add Skill"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Skill Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Spring Boot"
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] placeholder:text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Proficiency (1-5, optional)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={form.proficiency}
                  onChange={(e) => setForm((f) => ({ ...f, proficiency: e.target.value }))}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4]"
                />
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
                disabled={!form.name.trim()}
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
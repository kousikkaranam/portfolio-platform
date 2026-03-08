
"use client";
import { useState, useEffect, useRef } from "react";

const SECTION_META: Record<string, string> = {
  hero: "Hero / About",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  engineering: "Engineering Highlights",
  blog: "Blog",
  education: "Education",
  certifications: "Certifications",
  github: "GitHub Activity",
  contact: "Contact",
};

const TOGGLE_FIELDS: Record<string, string> = {
  skills: "showSkills",
  experience: "showExperience",
  projects: "showProjects",
  engineering: "showEngineering",
  blog: "showBlog",
  education: "showEducation",
  certifications: "showCertifications",
  github: "showGithub",
  contact: "showContact",
};

const DEFAULT_ORDER = ["hero","skills","experience","projects","engineering","blog","education","certifications","github","contact"];

export default function SectionsAdmin() {
  const [data, setData] = useState<any>(null);
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/sections");
    const sv = await res.json();
    setData(sv);
    setOrder((sv.sectionOrder as string[]) || DEFAULT_ORDER);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = (key: string) => {
    if (!data || key === "hero") return;
    const field = TOGGLE_FIELDS[key];
    setData({ ...data, [field]: !data[field] });
  };

  const isVisible = (key: string): boolean => {
    if (!data || key === "hero") return true;
    return data[TOGGLE_FIELDS[key]] ?? true;
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    dragItem.current = idx;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dragOverItem.current = idx;
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    const updated = [...order];
    const [dragged] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, dragged);
    setOrder(updated);
    dragItem.current = null;
    dragOverItem.current = null;
  };
  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const moveItem = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= order.length) return;
    const updated = [...order];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setOrder(updated);
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const payload: any = { sectionOrder: order };
    for (const [key, field] of Object.entries(TOGGLE_FIELDS)) {
      payload[field] = data[field] ?? true;
    }
    await fetch("/api/admin/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
  };

  if (loading || !data) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#5eead4] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Sections</h1>
          <p className="text-gray-400 text-sm mt-1">Toggle visibility and drag to reorder</p>
        </div>
        <button onClick={save} disabled={saving}
          className="px-4 py-2 bg-[#5eead4] text-[#0b0f19] rounded-lg text-sm font-medium hover:bg-[#5eead4]/90 disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-2">
        {order.map((key, idx) => {
          const label = SECTION_META[key];
          if (!label) return null;
          const visible = isVisible(key);
          const isHero = key === "hero";

          return (
            <div key={key} draggable={!isHero}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 bg-[#121826] border border-gray-800 rounded-xl transition-opacity ${
                !visible && !isHero ? "opacity-40" : ""
              } ${!isHero ? "cursor-grab active:cursor-grabbing" : ""}`}>

              {!isHero ? (
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                  <button onClick={() => moveItem(idx, -1)} disabled={idx === 0}
                    className="text-gray-500 hover:text-white disabled:opacity-20 transition-colors p-0.5 cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button onClick={() => moveItem(idx, 1)} disabled={idx === order.length - 1}
                    className="text-gray-500 hover:text-white disabled:opacity-20 transition-colors p-0.5 cursor-pointer">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              ) : <div className="w-5" />}

              {!isHero && (
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                </svg>
              )}

              <span className="flex-1 text-sm font-medium text-gray-200">{label}</span>
              <span className="text-xs text-gray-600 font-mono">{key}</span>

              {!isHero ? (
                <button onClick={() => toggle(key)}
                  className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${visible ? "bg-[#5eead4]" : "bg-gray-700"}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${visible ? "bg-[#0b0f19] left-5" : "bg-gray-400 left-1"}`} />
                </button>
              ) : (
                <span className="text-xs text-gray-600">Always visible</span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-600 mt-4 text-center">
        Drag sections to reorder. Toggle off to hide from your public portfolio.
      </p>
    </div>
  );
}
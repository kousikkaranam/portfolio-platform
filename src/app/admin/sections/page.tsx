
"use client";
import { useState, useEffect, useRef } from "react";

interface SectionVisibility {
  id?: string;
  showSkills: boolean;
  showExperience: boolean;
  showProjects: boolean;
  showEngineering: boolean;
  showBlog: boolean;
  showEducation: boolean;
  showCertifications: boolean;
  showGithub: boolean;
  showContact: boolean;
  sectionOrder: string[] | null;
}

const SECTION_META: Record<string, { label: string; field: keyof SectionVisibility }> = {
  hero: { label: "Hero / About", field: "id" }, // always visible, no toggle
  skills: { label: "Skills", field: "showSkills" },
  experience: { label: "Experience", field: "showExperience" },
  projects: { label: "Projects", field: "showProjects" },
  engineering: { label: "Engineering Highlights", field: "showEngineering" },
  blog: { label: "Blog", field: "showBlog" },
  education: { label: "Education", field: "showEducation" },
  certifications: { label: "Certifications", field: "showCertifications" },
  github: { label: "GitHub Activity", field: "showGithub" },
  contact: { label: "Contact", field: "showContact" },
};

const DEFAULT_ORDER = ["hero","skills","experience","projects","engineering","blog","education","certifications","github","contact"];

export default function SectionsAdmin() {
  const [data, setData] = useState<SectionVisibility | null>(null);
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/sections");
    const sv = await res.json();
    setData(sv);
    setOrder(sv.sectionOrder || DEFAULT_ORDER);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = (key: string) => {
    if (!data || key === "hero") return;
    const field = SECTION_META[key].field as keyof SectionVisibility;
    setData({ ...data, [field]: !data[field] });
  };

  const isVisible = (key: string): boolean => {
    if (!data || key === "hero") return true;
    const field = SECTION_META[key].field as keyof SectionVisibility;
    return data[field] as boolean;
  };

  const handleDragStart = (idx: number) => { dragItem.current = idx; };
  const handleDragEnter = (idx: number) => { dragOverItem.current = idx; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const updated = [...order];
    const [dragged] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, dragged);
    setOrder(updated);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const save = async () => {
    if (!data) return;
    setSaving(true);
    await fetch("/api/admin/sections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        showSkills: data.showSkills,
        showExperience: data.showExperience,
        showProjects: data.showProjects,
        showEngineering: data.showEngineering,
        showBlog: data.showBlog,
        showEducation: data.showEducation,
        showCertifications: data.showCertifications,
        showGithub: data.showGithub,
        showContact: data.showContact,
        sectionOrder: order,
      }),
    });
    setSaving(false);
  };

  if (loading || !data) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sections</h1>
          <p className="text-sm text-gray-500 mt-1">Toggle visibility and drag to reorder your portfolio</p>
        </div>
        <button onClick={save} disabled={saving}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-2">
        {order.map((key, idx) => {
          const meta = SECTION_META[key];
          if (!meta) return null;
          const visible = isVisible(key);
          const isHero = key === "hero";

          return (
            <div
              key={key}
              draggable={!isHero}
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className={`flex items-center gap-3 p-3 bg-white border rounded-lg transition-opacity ${
                !visible && !isHero ? "opacity-50" : ""
              } ${!isHero ? "cursor-grab active:cursor-grabbing" : ""}`}
            >
              {/* Drag handle */}
              {!isHero ? (
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                </svg>
              ) : <div className="w-5" />}

              <span className="flex-1 text-sm font-medium">{meta.label}</span>
              <span className="text-xs text-gray-400 font-mono">{key}</span>

              {/* Toggle */}
              {!isHero ? (
                <button onClick={() => toggle(key)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${visible ? "bg-black" : "bg-gray-300"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${visible ? "left-5" : "left-1"}`} />
                </button>
              ) : (
                <span className="text-xs text-gray-400">Always visible</span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Drag sections to reorder. Toggle off to hide from your public portfolio.
      </p>
    </div>
  );
}
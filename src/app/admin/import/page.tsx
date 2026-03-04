"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Sparkles,
  AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────

interface ParsedSettings {
  siteTitle: string | null;
  tagline: string | null;
  bio: string | null;
  location: string | null;
  socialLinks: {
    github?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    email?: string | null;
  } | null;
}

interface ParsedExperience {
  company: string;
  role: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  techStack: string[];
  _include: boolean;
}

interface ParsedSkill {
  category: string;
  name: string;
  proficiency: number | null;
  _include: boolean;
}

interface ParsedProject {
  title: string;
  description: string | null;
  techStack: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  category: string | null;
  _include: boolean;
}

interface ParsedEducation {
  institution: string;
  degree: string | null;
  field: string | null;
  startYear: number | null;
  endYear: number | null;
  _include: boolean;
}

interface ParsedCertification {
  name: string;
  issuer: string | null;
  issueDate: string | null;
  credentialUrl: string | null;
  _include: boolean;
}

interface ParsedData {
  settings: ParsedSettings;
  experiences: ParsedExperience[];
  skills: ParsedSkill[];
  projects: ParsedProject[];
  education: ParsedEducation[];
  certifications: ParsedCertification[];
}

type Step = "upload" | "parsing" | "review" | "saving" | "done";

// ─── Helpers ─────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return "Present";
  return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function tag(t: string) {
  return (
    <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
      {t}
    </span>
  );
}

// ─── Section Accordion ───────────────────────────────────

function Section({
  title,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#121826] border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">{title}</span>
          <span className="text-xs bg-[#5eead4]/10 text-[#5eead4] px-2 py-0.5 rounded-full font-medium">
            {count}
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </button>
      {open && <div className="border-t border-gray-800 divide-y divide-gray-800/60">{children}</div>}
    </div>
  );
}

// ─── Item Row ────────────────────────────────────────────

function ItemRow({
  included,
  onToggle,
  children,
}: {
  included: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex gap-4 px-5 py-4 transition-colors ${included ? "" : "opacity-40"}`}>
      <div className="pt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={included}
          onChange={onToggle}
          className="w-4 h-4 accent-[#5eead4] cursor-pointer"
        />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [saveResult, setSaveResult] = useState<Record<string, number> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    setFileName(file.name);
    setError(null);
    setStep("parsing");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import/resume", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Parse failed");

      // Attach _include: true to all array items
      const data: ParsedData = {
        settings: json.data.settings ?? {},
        experiences: (json.data.experiences ?? []).map((e: Omit<ParsedExperience, "_include">) => ({ ...e, _include: true })),
        skills: (json.data.skills ?? []).map((s: Omit<ParsedSkill, "_include">) => ({ ...s, _include: true })),
        projects: (json.data.projects ?? []).map((p: Omit<ParsedProject, "_include">) => ({ ...p, _include: true })),
        education: (json.data.education ?? []).map((e: Omit<ParsedEducation, "_include">) => ({ ...e, _include: true })),
        certifications: (json.data.certifications ?? []).map((c: Omit<ParsedCertification, "_include">) => ({ ...c, _include: true })),
      };

      setParsed(data);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("upload");
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleSave = async () => {
    if (!parsed) return;
    setStep("saving");

    const payload = {
      settings: parsed.settings,
      experiences: parsed.experiences.filter((e) => e._include).map(({ _include, ...rest }) => rest),
      skills: parsed.skills.filter((s) => s._include).map(({ _include, ...rest }) => rest),
      projects: parsed.projects.filter((p) => p._include).map(({ _include, ...rest }) => rest),
      education: parsed.education.filter((e) => e._include).map(({ _include, ...rest }) => rest),
      certifications: parsed.certifications.filter((c) => c._include).map(({ _include, ...rest }) => rest),
    };

    try {
      const res = await fetch("/api/admin/import/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setSaveResult(json.results);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setStep("review");
    }
  };

  const includedCount =
    parsed
      ? parsed.experiences.filter((e) => e._include).length +
        parsed.skills.filter((s) => s._include).length +
        parsed.projects.filter((p) => p._include).length +
        parsed.education.filter((e) => e._include).length +
        parsed.certifications.filter((c) => c._include).length
      : 0;

  // ── Upload Step ──────────────────────────────────────
  if (step === "upload") {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={22} className="text-[#5eead4]" />
            Import from Resume
          </h1>
          <p className="text-gray-400 mt-1">Upload your PDF resume and Claude AI will extract your data automatically.</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-[#5eead4] bg-[#5eead4]/5"
              : "border-gray-700 hover:border-gray-600 bg-[#121826]"
          }`}
        >
          <Upload size={40} className="mx-auto text-gray-600 mb-4" />
          <p className="text-white font-medium text-lg mb-1">Drop your resume PDF here</p>
          <p className="text-gray-500 text-sm mb-6">or click to browse</p>
          <span className="bg-[#5eead4] text-black text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-[#4fd1b8] transition-colors">
            Choose File
          </span>
          <p className="text-gray-600 text-xs mt-6">PDF only · Max 10MB</p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />

        <div className="mt-8 bg-[#121826] border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">What gets extracted</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {["Profile & Bio", "Work Experience", "Skills", "Projects", "Education", "Certifications"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle2 size={14} className="text-[#5eead4]" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            You can review and deselect any items before saving. Existing data is never deleted — only added.
          </p>
        </div>
      </div>
    );
  }

  // ── Parsing Step ─────────────────────────────────────
  if (step === "parsing") {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-[#121826] border border-gray-800 flex items-center justify-center">
            <FileText size={32} className="text-gray-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0b0f19] border border-gray-800 flex items-center justify-center">
            <Loader2 size={14} className="text-[#5eead4] animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold mb-1">Analysing your resume…</p>
          <p className="text-gray-500 text-sm">{fileName}</p>
          <p className="text-gray-600 text-xs mt-3">Claude AI is extracting your information. This takes 10–20 seconds.</p>
        </div>
      </div>
    );
  }

  // ── Done Step ────────────────────────────────────────
  if (step === "done" && saveResult) {
    const links = [
      { label: "Experience", href: "/admin/experience" },
      { label: "Skills", href: "/admin/skills" },
      { label: "Projects", href: "/admin/projects" },
      { label: "Education", href: "/admin/education" },
      { label: "Certifications", href: "/admin/certifications" },
      { label: "Settings", href: "/admin/settings" },
    ];
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#5eead4]/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-[#5eead4]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Import complete!</h2>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {Object.entries(saveResult).map(([k, v]) => (
              <div key={k} className="bg-[#121826] border border-gray-800 rounded-lg px-4 py-2">
                <p className="text-[#5eead4] font-semibold text-lg">{v}</p>
                <p className="text-gray-500 text-xs capitalize">{k}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-4 py-2 rounded-lg transition-colors"
            >
              {l.label} →
            </a>
          ))}
        </div>
        <button
          onClick={() => { setParsed(null); setStep("upload"); setFileName(""); setError(null); }}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors mt-2 cursor-pointer"
        >
          Import another resume
        </button>
      </div>
    );
  }

  // ── Saving Step ──────────────────────────────────────
  if (step === "saving") {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 size={40} className="text-[#5eead4] animate-spin" />
        <p className="text-white font-semibold">Saving to your portfolio…</p>
      </div>
    );
  }

  // ── Review Step ──────────────────────────────────────
  if (!parsed) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles size={22} className="text-[#5eead4]" />
            Review Extracted Data
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Uncheck items you don&apos;t want to import. Click <strong className="text-white">Save to Portfolio</strong> when ready.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => { setParsed(null); setStep("upload"); setFileName(""); }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <X size={14} />
            Re-upload
          </button>
          <button
            onClick={handleSave}
            disabled={includedCount === 0}
            className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#4fd1b8] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 size={16} />
            Save to Portfolio
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="space-y-4">

        {/* Profile */}
        {parsed.settings && (
          <div className="bg-[#121826] border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Profile</p>
            <div className="space-y-2">
              {parsed.settings.siteTitle && (
                <p className="text-white font-semibold text-lg">{parsed.settings.siteTitle}</p>
              )}
              {parsed.settings.tagline && <p className="text-[#5eead4] text-sm">{parsed.settings.tagline}</p>}
              {parsed.settings.bio && <p className="text-gray-400 text-sm leading-relaxed">{parsed.settings.bio}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                {parsed.settings.location && <span>📍 {parsed.settings.location}</span>}
                {parsed.settings.socialLinks?.email && <span>✉ {parsed.settings.socialLinks.email}</span>}
                {parsed.settings.socialLinks?.github && <span>GitHub: {parsed.settings.socialLinks.github}</span>}
                {parsed.settings.socialLinks?.linkedin && <span>LinkedIn found</span>}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">Profile info will be merged with your existing settings.</p>
          </div>
        )}

        {/* Experience */}
        {parsed.experiences.length > 0 && (
          <Section title="Experience" count={parsed.experiences.filter((e) => e._include).length}>
            {parsed.experiences.map((ex, i) => (
              <ItemRow
                key={i}
                included={ex._include}
                onToggle={() => setParsed((prev) => {
                  if (!prev) return prev!;
                  const arr = [...prev.experiences];
                  arr[i] = { ...arr[i], _include: !arr[i]._include };
                  return { ...prev, experiences: arr };
                })}
              >
                <p className="text-white font-medium">{ex.role}</p>
                <p className="text-[#5eead4] text-sm">{ex.company}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {fmtDate(ex.startDate)} — {ex.isCurrent ? "Present" : fmtDate(ex.endDate)}
                  {ex.location && ` · ${ex.location}`}
                </p>
                {ex.description && <p className="text-gray-400 text-sm mt-2 line-clamp-2">{ex.description}</p>}
                {ex.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">{ex.techStack.map(tag)}</div>
                )}
              </ItemRow>
            ))}
          </Section>
        )}

        {/* Skills */}
        {parsed.skills.length > 0 && (
          <Section title="Skills" count={parsed.skills.filter((s) => s._include).length}>
            {parsed.skills.map((s, i) => (
              <ItemRow
                key={i}
                included={s._include}
                onToggle={() => setParsed((prev) => {
                  if (!prev) return prev!;
                  const arr = [...prev.skills];
                  arr[i] = { ...arr[i], _include: !arr[i]._include };
                  return { ...prev, skills: arr };
                })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm font-medium">{s.name}</span>
                    <span className="text-gray-500 text-xs ml-2">— {s.category}</span>
                  </div>
                  {s.proficiency && (
                    <span className="text-gray-500 text-xs">{s.proficiency}%</span>
                  )}
                </div>
                {s.proficiency && (
                  <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#5eead4]"
                      style={{ width: `${s.proficiency}%` }}
                    />
                  </div>
                )}
              </ItemRow>
            ))}
          </Section>
        )}

        {/* Projects */}
        {parsed.projects.length > 0 && (
          <Section title="Projects" count={parsed.projects.filter((p) => p._include).length}>
            {parsed.projects.map((p, i) => (
              <ItemRow
                key={i}
                included={p._include}
                onToggle={() => setParsed((prev) => {
                  if (!prev) return prev!;
                  const arr = [...prev.projects];
                  arr[i] = { ...arr[i], _include: !arr[i]._include };
                  return { ...prev, projects: arr };
                })}
              >
                <p className="text-white font-medium">{p.title}</p>
                {p.description && <p className="text-gray-400 text-sm mt-1 line-clamp-2">{p.description}</p>}
                {p.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">{p.techStack.map(tag)}</div>
                )}
                <div className="flex gap-3 mt-2 text-xs text-gray-600">
                  {p.githubUrl && <span>GitHub ↗</span>}
                  {p.liveUrl && <span>Live ↗</span>}
                  {p.category && <span className="capitalize">{p.category}</span>}
                </div>
              </ItemRow>
            ))}
          </Section>
        )}

        {/* Education */}
        {parsed.education.length > 0 && (
          <Section title="Education" count={parsed.education.filter((e) => e._include).length}>
            {parsed.education.map((e, i) => (
              <ItemRow
                key={i}
                included={e._include}
                onToggle={() => setParsed((prev) => {
                  if (!prev) return prev!;
                  const arr = [...prev.education];
                  arr[i] = { ...arr[i], _include: !arr[i]._include };
                  return { ...prev, education: arr };
                })}
              >
                <p className="text-white font-medium">{e.institution}</p>
                <p className="text-gray-400 text-sm">
                  {[e.degree, e.field].filter(Boolean).join(" · ")}
                </p>
                {(e.startYear || e.endYear) && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    {e.startYear ?? "?"} — {e.endYear ?? "Present"}
                  </p>
                )}
              </ItemRow>
            ))}
          </Section>
        )}

        {/* Certifications */}
        {parsed.certifications.length > 0 && (
          <Section title="Certifications" count={parsed.certifications.filter((c) => c._include).length}>
            {parsed.certifications.map((c, i) => (
              <ItemRow
                key={i}
                included={c._include}
                onToggle={() => setParsed((prev) => {
                  if (!prev) return prev!;
                  const arr = [...prev.certifications];
                  arr[i] = { ...arr[i], _include: !arr[i]._include };
                  return { ...prev, certifications: arr };
                })}
              >
                <p className="text-white font-medium">{c.name}</p>
                {c.issuer && <p className="text-gray-400 text-sm">{c.issuer}</p>}
                {c.issueDate && <p className="text-gray-500 text-xs mt-0.5">{fmtDate(c.issueDate)}</p>}
              </ItemRow>
            ))}
          </Section>
        )}
      </div>

      {/* Bottom Save Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={includedCount === 0}
          className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-6 py-3 rounded-lg hover:bg-[#4fd1b8] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <CheckCircle2 size={16} />
          Save {includedCount} item{includedCount !== 1 ? "s" : ""} to Portfolio
        </button>
      </div>
    </div>
  );
}

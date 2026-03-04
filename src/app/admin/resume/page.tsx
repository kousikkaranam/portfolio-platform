"use client";

import { useEffect, useState } from "react";
import {
  Save, Loader2, Sparkles, Copy, Download, Check,
  Link2, FileText, Code2, ExternalLink, Printer, FileCode,
} from "lucide-react";

type Tab = "link" | "document" | "latex";

function toDownloadUrl(url: string): string {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (fileMatch) return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`;
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch) return `https://drive.google.com/uc?export=download&id=${openMatch[1]}`;
  return url;
}

function downloadTxt(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadDocx(content: string, filename: string) {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const paragraphs = content.split("\n").map((line) => {
    const isSectionHeader = /^[A-Z][A-Z\s&/]+$/.test(line.trim()) && line.trim().length > 2;
    const isDivider = /^[─—–\-=_]{3,}$/.test(line.trim());
    return new Paragraph({
      spacing: { after: isDivider ? 0 : 120 },
      children: [
        new TextRun({
          text: line || " ",
          bold: isSectionHeader,
          size: isSectionHeader ? 24 : 20,
          font: "Calibri",
          color: isDivider ? "AAAAAA" : "000000",
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function printAsPdf(content: string, isLatex = false) {
  const win = window.open("", "_blank");
  if (!win) return;
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Resume</title>
    <style>
      body { font-family: ${isLatex ? "monospace" : "'Georgia', serif"}; font-size: ${isLatex ? "11px" : "13px"};
             line-height: 1.6; color: #111; max-width: 760px; margin: 40px auto; padding: 0 20px; white-space: pre-wrap; }
      @media print { body { margin: 0; padding: 0; max-width: 100%; } @page { margin: 2cm; } }
    </style>
  </head><body>${escaped}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
}

async function compileToPdf(
  latexContent: string,
  filename: string,
  onError: (msg: string, log?: string) => void,
  setCompiling: (v: boolean) => void
) {
  setCompiling(true);
  try {
    const res = await fetch("/api/admin/resume/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latexContent }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      onError(data.error ?? "Compilation failed.", data.log);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    onError("Could not reach compilation service.");
  } finally {
    setCompiling(false);
  }
}

export default function ResumePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("link");

  const [resumeUrl, setResumeUrl] = useState("");
  const [docContent, setDocContent] = useState("");
  const [latexContent, setLatexContent] = useState("");

  const [compiling, setCompiling] = useState(false);
  const [compileError, setCompileError] = useState("");
  const [compileLog, setCompileLog] = useState("");

  const [jobDescription, setJobDescription] = useState("");
  const [tailoring, setTailoring] = useState(false);
  const [tailored, setTailored] = useState("");
  const [tailorError, setTailorError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/resume")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setResumeUrl(data.resumeUrl ?? "");
        setDocContent(data.resume?.docContent ?? "");
        setLatexContent(data.resume?.latexContent ?? "");
        setTailored(data.resume?.tailoredContent ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/resume", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeUrl, docContent, latexContent }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTailor = async () => {
    if (!jobDescription.trim()) return;
    setTailoring(true);
    setTailorError("");
    setTailored("");
    const res = await fetch("/api/admin/resume/tailor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription, useLatex: tab === "latex" }),
    });
    const data = await res.json();
    if (!res.ok) setTailorError(data.error ?? "Something went wrong.");
    else setTailored(data.tailored);
    setTailoring(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tailored);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-[#5eead4] animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Resume</h1>
          <p className="text-gray-400 mt-1">Store your resume, tailor it with AI for any job.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#4fd1b8] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Tabs */}
        <div className="bg-[#121826] border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-800">
            {([
              { id: "link", label: "Drive Link", icon: Link2 },
              { id: "document", label: "Document", icon: FileText },
              { id: "latex", label: "LaTeX", icon: Code2 },
            ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors cursor-pointer ${
                  tab === id ? "text-[#5eead4] border-b-2 border-[#5eead4] -mb-px bg-[#5eead4]/5" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={15} />{label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── Drive Link tab ── */}
            {tab === "link" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Resume Download URL</label>
                  <input type="url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors placeholder:text-gray-600"
                  />
                  <p className="text-xs text-gray-600 mt-1.5">
                    Google Drive: Share → Anyone with the link → Viewer → Copy link
                  </p>
                </div>
                {resumeUrl && (
                  <div className="flex items-center gap-3">
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors">
                      <ExternalLink size={12} /> View in Drive
                    </a>
                    <a href={toDownloadUrl(resumeUrl)} target="_blank" rel="noopener noreferrer" download
                      className="inline-flex items-center gap-1.5 text-xs text-[#5eead4] hover:text-white border border-[#5eead4]/40 hover:border-[#5eead4] px-3 py-1.5 rounded-lg transition-colors">
                      <Download size={12} /> Test download
                    </a>
                  </div>
                )}
                <div className="p-4 bg-[#0b0f19] border border-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="text-gray-300 font-medium">How it works:</span> Saving a URL here shows{" "}
                    <span className="text-[#5eead4]">Download Resume</span> +{" "}
                    <span className="text-[#5eead4]">View in Drive</span> buttons on your public portfolio.
                  </p>
                </div>
              </div>
            )}

            {/* ── Document tab ── */}
            {tab === "document" && (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-300 font-medium">Plain Text / Markdown</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Paste or write your resume here. Used by AI Tailor to generate job-specific versions.
                    </p>
                  </div>
                  {docContent && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <DownloadBtn label=".txt" onClick={() => downloadTxt(docContent, "resume.txt")} />
                      <DownloadBtn label=".docx" onClick={() => downloadDocx(docContent, "resume.docx")} accent />
                      <DownloadBtn label="PDF" icon={<Printer size={12} />} onClick={() => printAsPdf(docContent)} />
                    </div>
                  )}
                </div>
                <textarea rows={24} value={docContent} onChange={(e) => setDocContent(e.target.value)}
                  placeholder={`John Doe\nSoftware Engineer · john@example.com · linkedin.com/in/johndoe\n\nEXPERIENCE\n──────────\nSenior Engineer, Acme Corp (2022–Present)\n• Built distributed cache layer reducing latency by 40%\n\nSKILLS\n──────\nLanguages: Go, TypeScript, Python\nCloud: AWS, GCP`}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors resize-none font-mono leading-relaxed placeholder:text-gray-700"
                />
              </div>
            )}

            {/* ── LaTeX tab ── */}
            {tab === "latex" && (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-300 font-medium">LaTeX Source</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Paste your LaTeX resume. AI can tailor it while preserving the template structure.
                    </p>
                  </div>
                  {latexContent && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <DownloadBtn label=".tex" icon={<FileCode size={12} />}
                        onClick={() => downloadTxt(latexContent, "resume.tex")} />
                      <DownloadBtn label={compiling ? "Compiling…" : "PDF"}
                        icon={compiling ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                        accent
                        onClick={() => { setCompileError(""); setCompileLog(""); compileToPdf(latexContent, "resume.pdf", (e, l) => { setCompileError(e); setCompileLog(l ?? ""); }, setCompiling); }}
                        disabled={compiling}
                        title="Compiles your LaTeX to PDF via LaTeX.Online" />
                    </div>
                  )}
                </div>
                <textarea rows={24} value={latexContent} onChange={(e) => setLatexContent(e.target.value)}
                  placeholder={`\\documentclass[letterpaper,11pt]{article}\n\\usepackage{latexsym}\n...\n\n\\begin{document}\n\n\\begin{center}\n  {\\Huge \\textbf{John Doe}} \\\\[4pt]\n  john@example.com $|$ linkedin.com/in/johndoe\n\\end{center}\n\n\\section{Experience}\n...\n\n\\end{document}`}
                  className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors resize-none font-mono leading-relaxed placeholder:text-gray-700"
                />
                {compileError && (
                  <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg space-y-2">
                    <p className="text-xs text-red-400 font-medium">{compileError}</p>
                    {compileLog && (
                      <pre className="text-xs text-gray-500 bg-black/30 rounded p-2 overflow-x-auto whitespace-pre-wrap max-h-32">{compileLog}</pre>
                    )}
                    <p className="text-xs text-gray-500">
                      Tip: Download the{" "}
                      <button onClick={() => downloadTxt(latexContent, "resume.tex")}
                        className="text-[#5eead4] hover:underline cursor-pointer">.tex file</button>{" "}
                      and paste into{" "}
                      <a href="https://www.overleaf.com/project" target="_blank" rel="noopener noreferrer"
                        className="text-[#5eead4] hover:underline">Overleaf</a>{" "}for a proper compiler.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Tailor */}
        <section className="bg-[#121826] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#5eead4]" />
            <h2 className="text-lg font-semibold text-white">AI Tailor</h2>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            Paste a job description and Claude will tailor your{" "}
            <span className="text-gray-400">{tab === "latex" ? "LaTeX resume" : "document resume"}</span> to match it.
          </p>

          {(tab === "document" && !docContent.trim()) || (tab === "latex" && !latexContent.trim()) ? (
            <div className="p-4 bg-[#0b0f19] border border-dashed border-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-500">
                Save your resume in the{" "}
                <button onClick={() => setTab(tab === "latex" ? "latex" : "document")}
                  className="text-[#5eead4] hover:underline cursor-pointer">
                  {tab === "latex" ? "LaTeX" : "Document"}
                </button>{" "}tab first.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Job Description</label>
                  <textarea rows={8} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here…"
                    className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#5eead4] transition-colors resize-none placeholder:text-gray-600"
                  />
                </div>
                <button onClick={handleTailor} disabled={tailoring || !jobDescription.trim()}
                  className="flex items-center gap-2 bg-[#5eead4] text-black font-medium px-5 py-2.5 rounded-lg hover:bg-[#4fd1b8] transition-colors disabled:opacity-50 cursor-pointer">
                  {tailoring ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {tailoring ? "Tailoring…" : "Tailor with Claude"}
                </button>
              </div>

              {tailorError && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-sm text-red-400">{tailorError}</p>
                </div>
              )}

              {tailored && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-300 font-medium">Tailored Resume</p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      {tab === "latex" ? (
                        <>
                          <DownloadBtn label=".tex" icon={<FileCode size={12} />}
                            onClick={() => downloadTxt(tailored, "resume-tailored.tex")} />
                          <DownloadBtn label={compiling ? "Compiling…" : "PDF"}
                            icon={compiling ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                            accent
                            disabled={compiling}
                            onClick={() => { setCompileError(""); setCompileLog(""); compileToPdf(tailored, "resume-tailored.pdf", (e, l) => { setCompileError(e); setCompileLog(l ?? ""); }, setCompiling); }} />
                        </>
                      ) : (
                        <>
                          <DownloadBtn label=".txt" onClick={() => downloadTxt(tailored, "resume-tailored.txt")} />
                          <DownloadBtn label=".docx" accent onClick={() => downloadDocx(tailored, "resume-tailored.docx")} />
                          <DownloadBtn label="PDF" icon={<Printer size={12} />} onClick={() => printAsPdf(tailored)} />
                        </>
                      )}
                    </div>
                  </div>
                  <textarea rows={20} readOnly value={tailored}
                    className="w-full bg-[#0b0f19] border border-gray-700 rounded-lg px-4 py-3 text-white text-sm resize-none font-mono leading-relaxed focus:outline-none"
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function DownloadBtn({ label, onClick, accent, icon, title, disabled }: {
  label: string; onClick: () => void; accent?: boolean; icon?: React.ReactNode; title?: string; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        accent
          ? "border-[#5eead4]/50 text-[#5eead4] hover:bg-[#5eead4]/10"
          : "border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
      }`}>
      {icon ?? <Download size={12} />}
      {label}
    </button>
  );
}

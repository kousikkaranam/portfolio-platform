import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { latexContent } = await request.json();
  if (!latexContent?.trim()) {
    return NextResponse.json({ error: "No LaTeX content provided" }, { status: 400 });
  }

  // ── TeXLive.net ─────────────────────────────────────────────────────────
  // POST /run?engine=pdflatex  multipart/form-data  field: filecontents[] + filename[]
  try {
    const form = new FormData();
    form.append("filecontents[]", latexContent);
    form.append("filename[]", "main.tex");
    form.append("engine", "pdflatex");
    form.append("returntype", "pdf");

    const res = await fetch("https://texlive.net/cgi-bin/latexcgi", {
      method: "POST",
      body: form,
    });

    console.log("[compile] texlive.net status:", res.status, res.headers.get("content-type"));

    if (res.ok) {
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("pdf")) {
        const pdf = await res.arrayBuffer();
        return new NextResponse(pdf, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="resume.pdf"',
          },
        });
      }
      // Service returned non-PDF — grab the log
      const log = await res.text().catch(() => "");
      const errLine = log.match(/!(.*?)(?:\n|$)/)?.[1]?.trim();
      return NextResponse.json(
        { error: errLine ? `LaTeX error: ${errLine}` : "Compilation produced no PDF.", log: log.slice(0, 800) },
        { status: 422 }
      );
    }

    const errBody = await res.text().catch(() => "");
    const errLine = errBody.match(/!(.*?)(?:\n|$)/)?.[1]?.trim();
    return NextResponse.json(
      {
        error: errLine ? `LaTeX error: ${errLine}` : `Compilation service returned ${res.status}.`,
        log: errBody.slice(0, 800),
      },
      { status: 422 }
    );
  } catch (err) {
    console.error("[compile] error:", err);
    return NextResponse.json(
      { error: "Could not reach the compilation service. Download the .tex and compile on Overleaf." },
      { status: 503 }
    );
  }
}

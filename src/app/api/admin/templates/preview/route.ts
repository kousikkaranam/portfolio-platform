import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchPortfolioData } from "@/lib/portfolio";
import { renderTemplate } from "@/lib/template-renderer";
import { NextResponse } from "next/server";

function wrapInDoc(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body style="margin:0">${body}</body>
</html>`;
}

async function getRendered(html: string, userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { slug: true } });
  if (!user?.slug) return wrapInDoc(html);
  const data = await fetchPortfolioData(user.slug);
  if (!data) return wrapInDoc(html);
  return wrapInDoc(renderTemplate(html, data));
}

// GET ?id=xxx  — preview a saved template
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const template = await prisma.customTemplate.findFirst({
    where: { id, userId: session.user.id },
    select: { html: true },
  });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rendered = await getRendered(template.html, session.user.id);
  return new Response(rendered, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// POST { html }  — preview raw HTML before saving
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { html } = await request.json();
  if (!html) return NextResponse.json({ error: "html required" }, { status: 400 });

  const rendered = await getRendered(html, session.user.id);
  return new Response(rendered, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

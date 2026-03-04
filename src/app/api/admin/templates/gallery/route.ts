import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

interface GalleryEntry {
  name: string;
  url: string;
  tagline?: string;
}

// In-memory cache — resets on server restart (or every 24h in prod)
let cachedGallery: GalleryEntry[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function loadGallery(): Promise<GalleryEntry[]> {
  const now = Date.now();
  if (cachedGallery && now < cacheExpiry) return cachedGallery;

  // 1. Try GitHub raw URL (set PORTFOLIO_GALLERY_URL in env after pushing the repo)
  const remoteUrl = process.env.PORTFOLIO_GALLERY_URL;
  if (remoteUrl) {
    try {
      const res = await fetch(remoteUrl, { next: { revalidate: 86400 } });
      if (res.ok) {
        cachedGallery = (await res.json()) as GalleryEntry[];
        cacheExpiry = now + CACHE_TTL_MS;
        return cachedGallery;
      }
    } catch {
      // fall through to local fallback
    }
  }

  // 2. Local dev fallback — sibling repo on disk (dev machine only)
  const localPath = join(process.cwd(), "..", "developer-portfolios-templates", "feed.json");
  if (existsSync(localPath)) {
    cachedGallery = JSON.parse(readFileSync(localPath, "utf-8")) as GalleryEntry[];
    cacheExpiry = now + CACHE_TTL_MS;
    return cachedGallery;
  }

  return [];
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const search = (searchParams.get("search") || "").toLowerCase().trim();
  const limit = 24;

  const all = await loadGallery();
  const filtered = search
    ? all.filter(
        (e) =>
          e.name.toLowerCase().includes(search) ||
          (e.tagline && e.tagline.toLowerCase().includes(search))
      )
    : all;

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const items = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ items, total, page, totalPages });
}

export function adjustBrightness(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  const num = parseInt(full, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export interface ThemePalette {
  bg: string;
  bgCard: string;
  border: string;
  borderLight: string;
}

export function derivePalette(bg: string, mode: "dark" | "light"): ThemePalette {
  if (mode === "dark") {
    return {
      bg,
      bgCard: adjustBrightness(bg, 10),
      border: adjustBrightness(bg, 25),
      borderLight: adjustBrightness(bg, 40),
    };
  } else {
    return {
      bg,
      bgCard: adjustBrightness(bg, -10),
      border: adjustBrightness(bg, -38),
      borderLight: adjustBrightness(bg, -22),
    };
  }
}

/**
 * 站台 logo「格點路徑」的幾何：方格紙上一條從左下走到右上的最短路徑。
 *
 * 畫在 32×32 的格線上。Header（LogoMark）和 OG 圖都從這裡畫，
 * src/app/icon.svg、favicon.ico、apple-icon.png 是同一組數值做成的靜態檔，改這裡要一起重做。
 * 分頁圖示（icon.svg 與 favicon.ico 的 16px 版）太小，省略淡色格點。
 */

/** ink：墨色；accent：主色藍；faint：墨色加上 LOGO_FAINT_OPACITY，給沒走到的格點用 */
export type LogoRole = "ink" | "accent" | "faint";

export type LogoShape =
  | { kind: "path"; role: LogoRole; d: string; width: number }
  | { kind: "dot"; role: LogoRole; cx: number; cy: number; r: number };

export const LOGO_VIEWBOX = "0 0 32 32";
export const LOGO_FAINT_OPACITY = 0.25;

/** 由下往上疊：格點 → 路徑 → 起點 → 轉折點 → 終點 */
export const LOGO_SHAPES: readonly LogoShape[] = [
  { kind: "dot", role: "faint", cx: 16, cy: 25, r: 1.7 },
  { kind: "dot", role: "faint", cx: 25, cy: 25, r: 1.7 },
  { kind: "dot", role: "faint", cx: 25, cy: 16, r: 1.7 },
  { kind: "dot", role: "faint", cx: 7, cy: 7, r: 1.7 },
  { kind: "path", role: "accent", d: "M7 25V16h9V7h9", width: 2.6 },
  { kind: "dot", role: "ink", cx: 7, cy: 25, r: 3.5 },
  { kind: "dot", role: "accent", cx: 7, cy: 16, r: 2.3 },
  { kind: "dot", role: "accent", cx: 16, cy: 16, r: 2.3 },
  { kind: "dot", role: "accent", cx: 16, cy: 7, r: 2.3 },
  { kind: "dot", role: "accent", cx: 25, cy: 7, r: 3.9 },
];

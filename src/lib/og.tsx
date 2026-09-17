import type { ImageResponseOptions } from "next/server";
import type { Locale } from "./i18n";
import { LOGO_FAINT_OPACITY, LOGO_SHAPES, LOGO_VIEWBOX } from "./logo";

/**
 * Open Graph 圖片的共用部分：尺寸、字型、版型。
 *
 * 產圖引擎（satori）內建的字型只有拉丁字母，中文會變成方塊，所以字型要自己給。
 * 全套 Noto Sans TC 有 10MB，不可能塞進 repo；改成在建置時向 Google Fonts 要
 * 「只含這張圖用到的那幾個字」的子集，通常 5KB 上下。抓不到就退回不帶字型：
 * 英文照常、中文會是方塊，但 build 不會因此失敗。
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// 跟 globals.css 淺色主題的色票一致。OG 圖不隨使用者主題變，固定用淺色。
const C = { bg: "#f4f5f1", ink: "#171c23", ink3: "#7d8594", accent: "#2a4bd7", line: "#d6d9d0" };

const FONT_FAMILY = "Noto Sans TC";

const cache = new Map<string, Promise<ArrayBuffer | null>>();

/** 向 Google Fonts 要 Noto Sans TC 700 的子集，只含 text 裡出現的字。 */
export function loadFont(text: string): Promise<ArrayBuffer | null> {
  const glyphs = [...new Set(text)].join("");
  let p = cache.get(glyphs);
  if (!p) {
    // 建置時七個 worker 同時打 Google Fonts，偶爾會被拒一次；重試一次再放棄。
    p = fetchFont(glyphs).catch(() => fetchFont(glyphs)).catch(() => null);
    cache.set(glyphs, p);
  }
  return p;
}

async function fetchFont(glyphs: string): Promise<ArrayBuffer | null> {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FONT_FAMILY)}:wght@700&text=${encodeURIComponent(glyphs)}`;
  // 舊的 User-Agent 會拿到 WOFF/TTF 而不是 WOFF2；產圖引擎不吃 WOFF2。
  // force-cache：讓 Next 把這兩個 fetch 當成建置時的靜態資料，路由才會維持靜態預先產生。
  const css = await fetch(url, { cache: "force-cache", headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; rv:20.0) Gecko/20100101 Firefox/20.0" } });
  if (!css.ok) return null;
  const src = (await css.text()).match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!src) return null;
  const font = await fetch(src, { cache: "force-cache" });
  return font.ok ? font.arrayBuffer() : null;
}

/** 把抓到的字型（可能沒有）轉成 ImageResponse 的選項。 */
export async function ogOptions(text: string): Promise<ImageResponseOptions> {
  const data = await loadFont(text);
  // 抓不到時要「整個不給 fonts」而不是給空陣列：空陣列會連內建的預設字型都關掉，產圖直接失敗。
  return { ...OG_SIZE, ...(data ? { fonts: [{ name: FONT_FAMILY, data, weight: 700 as const, style: "normal" as const }] } : {}) };
}

export interface OgCardProps {
  locale: Locale;
  /** 小字眉標，例如主題名。可省略。 */
  eyebrow?: string;
  title: string;
  /** 標題底下的副標，例如中文名。可省略。 */
  subtitle?: string;
  siteName: string;
  tagline: string;
}

/**
 * 卡片版型。satori 的限制：每個有多個子元素的 div 都要明確 display:flex。
 * 字級隨標題長度縮小，最長的課程名（Hash Set / Map Patterns 之類）也不會爆版。
 */
export function OgCard({ locale, eyebrow, title, subtitle, siteName, tagline }: OgCardProps) {
  const titleSize = title.length > 28 ? 56 : title.length > 18 ? 68 : 84;
  return (
    <div
      lang={locale}
      style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "64px 72px", background: C.bg, color: C.ink, fontFamily: `"${FONT_FAMILY}", sans-serif`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <OgLogo size={44} />
        <div style={{ fontSize: 30, fontWeight: 700 }}>{siteName}</div>
        <div style={{ fontSize: 24, color: C.ink3 }}>{tagline}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {eyebrow && <div style={{ fontSize: 28, color: C.accent, fontWeight: 700, letterSpacing: 1 }}>{eyebrow}</div>}
        <div style={{ fontSize: titleSize, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 36, color: C.ink3 }}>{subtitle}</div>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `2px solid ${C.line}`, paddingTop: 24 }}>
        <div style={{ fontSize: 24, color: C.ink3 }}>beginalgo.com</div>
        <div style={{ fontSize: 22, color: C.ink3 }}>{locale === "zh-Hant" ? "概念 · 步驟 · 互動示範 · 程式碼 · 練習題" : "Concept · Steps · Demo · Code · Practice"}</div>
      </div>
    </div>
  );
}

/** 站台 logo。satori 不吃 CSS class，顏色直接寫在屬性上，固定用淺色主題。 */
function OgLogo({ size }: { size: number }) {
  const color = { ink: C.ink, accent: C.accent, faint: C.ink };
  return (
    <svg width={size} height={size} viewBox={LOGO_VIEWBOX}>
      {LOGO_SHAPES.map((s, i) => {
        const opacity = s.role === "faint" ? LOGO_FAINT_OPACITY : 1;
        return s.kind === "path" ? (
          <path key={i} d={s.d} fill="none" stroke={color[s.role]} strokeOpacity={opacity} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={color[s.role]} fillOpacity={opacity} />
        );
      })}
    </svg>
  );
}

/** 一張圖裡會出現的所有文字，拿去要字型子集。 */
export function ogText(p: OgCardProps): string {
  return [p.eyebrow, p.title, p.subtitle, p.siteName, p.tagline, "beginalgo.com", "概念 · 步驟 · 互動示範 · 程式碼 · 練習題", "Concept · Steps · Demo · Code · Practice"]
    .filter(Boolean)
    .join("");
}

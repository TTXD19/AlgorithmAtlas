import { LOGO_SHAPES, LOGO_VIEWBOX, type LogoRole } from "@/lib/logo";

// 用主題色的 utility class 上色，深淺色切換時跟著變。
const FILL: Record<LogoRole, string> = { ink: "fill-ink", accent: "fill-accent", faint: "fill-ink opacity-25" };
const STROKE: Record<LogoRole, string> = { ink: "stroke-ink", accent: "stroke-accent", faint: "stroke-ink opacity-25" };

/** 站台 logo 的圖示部分（格點路徑），尺寸由 className 決定。 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} fill="none" className={className} aria-hidden="true">
      {LOGO_SHAPES.map((s, i) =>
        s.kind === "path" ? (
          <path key={i} d={s.d} className={STROKE[s.role]} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} className={FILL[s.role]} />
        ),
      )}
    </svg>
  );
}

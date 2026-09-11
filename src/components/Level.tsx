import type { Level as LevelNum } from "@/lib/topics";

export function Level({ n }: { n: LevelNum }) {
  return (
    <span className="inline-flex gap-[3px]" title={`難度 ${n}/3`} aria-label={`難度 ${n}/3`}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={`block h-[7px] w-[7px] rounded-[2px] ${i <= n ? "bg-amber" : "bg-line"}`} />
      ))}
    </span>
  );
}

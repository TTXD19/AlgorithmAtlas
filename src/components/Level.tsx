import type { Level as LevelNum } from "@/lib/topics";

/** label 是「難度」的本地化字串，由呼叫端從字典傳進來。 */
export function Level({ n, label = "難度" }: { n: LevelNum; label?: string }) {
  return (
    <span className="inline-flex gap-[3px]" title={`${label} ${n}/3`} aria-label={`${label} ${n}/3`}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={`block h-[7px] w-[7px] rounded-[2px] ${i <= n ? "bg-amber" : "bg-line"}`} />
      ))}
    </span>
  );
}

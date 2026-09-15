"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const S = "abaaba";
const T = `#${S.split("").join("#")}#`;

interface Step {
  desc: string;
  op: string;
  i: number;
  c: number;
  r: number;
  p: (number | null)[];
  mirror?: number;
  room?: number;             // i 到右界還有幾格（i 在最右回文內時）
  prev?: [number, number];   // 右界被推進前的中心與右界
  kind: "init" | "expand" | "copy" | "info";
  best?: { center: number; radius: number };
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const n = T.length;
  const p: (number | null)[] = T.split("").map(() => null);
  let c = 0, r = -1;
  const snap = (desc: string, op: string, i: number, kind: Step["kind"], extra: Partial<Step> = {}) => steps.push({ desc, op, i, c, r, p: [...p], kind, ...extra });

  snap(`先把 s = 「${S}」每個字元之間（含頭尾）插入 #，變成 T = 「${T}」。這樣奇數與偶數長度的回文都變成奇數長度，只要找「以 i 為中心的半徑」就好。p[i] = 以 i 為中心的回文半徑，還原回 s 的長度剛好等於 p[i]。`, "插入 #", -1, "info");

  for (let i = 0; i < n; i++) {
    let start = 0;
    let mirror: number | undefined;
    let note = "";
    if (i <= r) {
      mirror = 2 * c - i;
      const pm = p[mirror] as number;
      start = Math.min(r - i, pm);
      if (pm < r - i) {
        p[i] = pm;
        snap(`i = ${i} 在目前最右回文（中心 ${c}，右界 ${r}）裡面。它關於中心 ${c} 的鏡像是 ${mirror}，p[${mirror}] = ${pm}，而 i 到右界還有 ${r - i} 格。${pm} < ${r - i}，鏡像的回文整個落在大回文裡，對稱性保證 p[${i}] = ${pm}，不用比任何字元。`, `p[${i}]`, i, "copy", { mirror, room: r - i });
        continue;
      }
      note = `i = ${i} 在最右回文裡，鏡像 ${mirror} 的 p[${mirror}] = ${pm} ≥ 到右界的距離 ${r - i}，只能保證半徑至少 ${start}，超出右界的部分要自己比。`;
    } else {
      note = r >= 0 ? `i = ${i} 在右界 r = ${r} 之外，沒有對稱資訊可用，從半徑 0 開始展開。` : `i = ${i}，還沒有任何已知的回文，從半徑 0 開始展開。`;
    }
    const room = i <= r ? r - i : undefined;
    const prev: [number, number] | undefined = r >= 0 ? [c, r] : undefined;
    let k = start;
    while (i - k - 1 >= 0 && i + k + 1 < n && T[i - k - 1] === T[i + k + 1]) k++;
    p[i] = k;
    const grew = i + k > r;
    if (grew) { c = i; r = i + k; }
    snap(`${note}從半徑 ${start} 往外比，多擴 ${k - start} 步停下，p[${i}] = ${k}。${grew ? `i + p[i] = ${i + k} 超過原本的右界，中心改成 ${i}，右界 r = ${i + k}。` : `右界沒有被推進，中心和右界不變。`}`, `p[${i}]`, i, "expand", { mirror, room, prev: grew ? prev : undefined });
  }

  let bi = 0;
  p.forEach((v, i) => { if ((v as number) > (p[bi] as number)) bi = i; });
  const rad = p[bi] as number;
  const startS = (bi - rad) / 2;
  snap(`p 陣列完成。最大半徑在 i = ${bi}，p = ${rad}，還原回 s 就是從 ${startS} 開始、長度 ${rad} 的「${S.slice(startS, startS + rad)}」。每次展開成功都會把右界 r 往右推，r 只增不減，所以總展開次數不超過 n，整體 O(n)。`, "結束", -1, "info", { best: { center: bi, radius: rad } });
  return steps;
}

export function ManacherDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const active = s.kind === "expand" || s.kind === "copy";
  const pi = active ? (s.p[s.i] as number) : 0;
  const left = s.c - (s.r - s.c);

  const tTone = (idx: number) => {
    if (s.best) return idx >= s.best.center - s.best.radius && idx <= s.best.center + s.best.radius ? CELL.green : "";
    if (!active) return "";
    if (idx === s.i) return CELL.accent;
    if (idx === s.mirror) return CELL.green;
    if (idx >= s.i - pi && idx <= s.i + pi) return CELL.amber;
    if (s.r >= 0 && idx >= left && idx <= s.r) return CELL.dim;
    return "";
  };
  const winTone = (idx: number) => (s.r >= 0 && !s.best ? (idx === s.c ? CELL.accent : idx >= left && idx <= s.r ? CELL.amber : "") : "");

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`s = "${S}" · T = "${T}"`} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div>
          <div className="eyebrow mb-1.5">T（藍色 = i，綠色 = 鏡像 2c − i，黃色 = 以 i 為中心的回文，灰色 = 目前最右回文）</div>
          <Cells items={T.split("")} tone={tTone} w="w-8" />
        </div>
        <div>
          <div className="eyebrow mb-1.5">目前最右回文：中心 c（藍色）與範圍 [c − p[c], r]（黃色）</div>
          <Cells items={T.split("").map((_, idx) => idx)} tone={winTone} w="w-8" />
          <div className="mt-1.5 flex flex-wrap gap-x-5 font-mono text-[12.5px] tabular-nums text-ink-2">
            <span>c = {s.r >= 0 ? s.c : "·"}</span>
            <span>r = {s.r >= 0 ? s.r : "·"}</span>
            <span>i = {active ? s.i : "·"}</span>
            {s.prev && <span className="text-ink-3">原本中心 {s.prev[0]}、右界 {s.prev[1]}</span>}
            {s.mirror !== undefined && <span className="text-green">鏡像 2c − i = {s.mirror}，p[{s.mirror}] = {s.p[s.mirror]}</span>}
            {s.room !== undefined && <span className="text-ink-3">i 到右界還有 {s.room} 格</span>}
          </div>
        </div>
        <div>
          <div className="eyebrow mb-1.5">半徑陣列 p</div>
          <Cells items={s.p.map((v) => (v === null ? "·" : v))} tone={(idx) => (active && idx === s.i ? (s.kind === "copy" ? CELL.green : CELL.accent) : idx === s.mirror ? CELL.green : s.best && idx === s.best.center ? CELL.green : s.p[idx] === null ? CELL.dim : "")} w="w-8" />
        </div>
        {s.best && (
          <div className="rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px]">
            <span className="mr-1.5 font-semibold text-ink">最長回文</span>
            中心 {s.best.center}、半徑 {s.best.radius}，對應 s 從 {(s.best.center - s.best.radius) / 2} 開始的「<span className="font-mono text-green">{S.slice((s.best.center - s.best.radius) / 2, (s.best.center - s.best.radius) / 2 + s.best.radius)}</span>」。
          </div>
        )}
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

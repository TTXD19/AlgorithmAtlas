"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const P = "aabaaab";
const T = "aabaabaaab";

interface Step {
  desc: string;
  op: string;
  phase: "build" | "match";
  i: number;               // 上排指標
  j: number;               // 下排（pattern）指標；下排從 i − j 開始對齊
  pi: (number | null)[];
  kind: "match" | "miss" | "jump" | "found" | "info";
  found: number[];
  via?: number;            // 失配時查了 pi 的哪一格
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const m = P.length, n = T.length;
  const pi: (number | null)[] = P.split("").map(() => null);
  const found: number[] = [];
  const snap = (desc: string, op: string, phase: Step["phase"], i: number, j: number, kind: Step["kind"], via?: number) => steps.push({ desc, op, phase, i, j, pi: [...pi], kind, found: [...found], via });

  pi[0] = 0;
  snap(`第一階段：對模式 P 自己建失敗函數 pi。pi[i] = P[0..i] 這段裡「最長的、既是前綴也是後綴、但不是整段」的長度。pi[0] = 0。下排是 P 的另一份複本，用來和自己比。`, "建 pi", "build", 0, 0, "info");
  let j = 0;
  for (let i = 1; i < m; i++) {
    for (;;) {
      if (P[i] === P[j]) {
        j++;
        pi[i] = j;
        snap(`P[${i}] = '${P[i]}' 和 P[${j - 1}] = '${P[j - 1]}' 相同：目前的邊界延長一格，pi[${i}] = ${j}。意思是 P[0..${i}] 的前 ${j} 個字元和後 ${j} 個字元一樣。`, `pi[${i}]`, "build", i, j, "match");
        break;
      }
      if (j > 0) {
        const nj = pi[j - 1] as number;
        snap(`P[${i}] = '${P[i]}' ≠ P[${j}] = '${P[j]}'，長度 ${j} 的邊界延不下去。不是歸零重來：長度 ${j} 的邊界本身也有邊界，pi[${j - 1}] = ${nj}，所以退到 j = ${nj} 再試。`, `pi[${i}]`, "build", i, nj, "jump", j - 1);
        j = nj;
      } else {
        pi[i] = 0;
        snap(`P[${i}] = '${P[i]}' ≠ P[0] = '${P[0]}'，而且 j 已經是 0，沒有更短的邊界可退，pi[${i}] = 0。`, `pi[${i}]`, "build", i, 0, "miss");
        break;
      }
    }
  }
  snap(`pi 表建好：[${pi.join(", ")}]，O(m)。第二階段用同一套規則在文字 T 裡找 P：上排換成 T，失配時 j 退到 pi[j−1]，i 永遠不回頭。`, "pi 完成", "match", 0, 0, "info");

  j = 0;
  for (let i = 0; i < n; i++) {
    for (;;) {
      if (T[i] === P[j]) {
        j++;
        if (j === m) {
          found.push(i - m + 1);
          snap(`T[${i}] = '${T[i]}' 和 P[${m - 1}] 相同，j 走到 ${m}：整個 P 比對完成，在位置 ${i - m + 1} 找到。接著 j 退到 pi[${m - 1}] = ${pi[m - 1]}，繼續找下一個可能重疊的出現。`, `T[${i}]`, "match", i, j, "found");
          j = pi[m - 1] as number;
        } else {
          snap(`T[${i}] = '${T[i]}' 和 P[${j - 1}] = '${P[j - 1]}' 相同，j 變 ${j}。目前 P 的前 ${j} 個字元對上了 T[${i - j + 1}..${i}]。`, `T[${i}]`, "match", i, j, "match");
        }
        break;
      }
      if (j > 0) {
        const nj = pi[j - 1] as number;
        snap(`T[${i}] = '${T[i]}' ≠ P[${j}] = '${P[j]}'，失配。已經對上的 ${j} 個字元 P[0..${j - 1}] 裡，前 ${nj} 個和後 ${nj} 個相同，所以把 P 往右滑到只剩這 ${nj} 個對上：j = pi[${j - 1}] = ${nj}。i 不動，T[${i}] 再和 P[${nj}] 比一次。`, `T[${i}]`, "match", i, nj, "jump", j - 1);
        j = nj;
      } else {
        snap(`T[${i}] = '${T[i]}' ≠ P[0] = '${P[0]}'，j = 0 沒有東西可退，i 直接往前。`, `T[${i}]`, "match", i, 0, "miss");
        break;
      }
    }
  }
  snap(`掃完 T。找到的位置：${found.join("、")}。i 從頭到尾只往前走 ${n} 步；j 每步最多加 1，後退的總量不會超過前進的總量，所以總共 O(n + m)。`, "結束", "match", n, 0, "info");
  return steps;
}

function Row({ chars, offset, tone }: { chars: string[]; offset: number; tone: (i: number) => string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: offset }, (_, i) => <span key={`sp${i}`} className="h-8 w-9 shrink-0" />)}
      {chars.map((c, i) => (
        <span key={i} className={`grid h-8 w-9 shrink-0 place-items-center rounded-md border font-mono text-[13px] ${tone(i) || "border-line-strong bg-surface"}`}>{c}</span>
      ))}
    </div>
  );
}

export function KmpDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const m = P.length;
  const top = s.phase === "build" ? P.split("") : T.split("");
  const matched = s.kind === "match" || s.kind === "found";
  // 對齊起點：match 之後 j 已經加一，所以 P[j−1] 要落在 i 底下；其餘情況 P[j] 落在 i 底下
  const offset = Math.max(0, matched ? s.i - s.j + 1 : s.i - s.j);
  const active = s.kind !== "info" && s.i < top.length;

  const topTone = (idx: number) => {
    if (s.phase === "match" && s.found.some((f) => idx >= f && idx < f + m) && (s.kind === "found" || s.kind === "info")) return CELL.green;
    if (!active) return "";
    if (idx === s.i) return matched ? CELL.green : s.kind === "miss" ? CELL.accent : CELL.amber;
    if (idx >= offset && idx < s.i) return CELL.dim;
    return "";
  };
  const botTone = (idx: number) => {
    if (!active) return "";
    if (matched) return idx < s.j ? CELL.green : "";
    if (s.kind === "jump") return idx < s.j ? CELL.dim : idx === s.j ? CELL.amber : "";
    return idx === s.j ? CELL.accent : "";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`P = "${P}" · T = "${T}"`} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div className="overflow-x-auto">
          <div className="eyebrow mb-1.5">{s.phase === "build" ? "上排：P（指標 i）" : "上排：文字 T（指標 i，只會往前）"}</div>
          <Row chars={top} offset={0} tone={topTone} />
          <div className="eyebrow mt-3 mb-1.5">下排：P 對齊在位置 i − j = {active ? offset : "·"}（指標 j）</div>
          <Row chars={P.split("")} offset={active ? offset : 0} tone={botTone} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">失敗函數 pi（pi[i] = P[0..i] 最長真前綴 = 後綴的長度）</div>
          <div className="flex gap-3">
            <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">P</div><Cells items={P.split("")} tone={() => CELL.dim} /></div>
          </div>
          <div className="mt-1 flex gap-3">
            <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">pi</div><Cells items={s.pi.map((v) => (v === null ? "·" : v))} tone={(idx) => (idx === s.via ? CELL.amber : s.phase === "build" && idx === s.i && s.kind !== "jump" && s.kind !== "info" ? CELL.accent : s.pi[idx] === null ? CELL.dim : "")} /></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12.5px] tabular-nums text-ink-2">
          <span>i = {active ? s.i : "·"}</span>
          <span>j = {active ? s.j : "·"}</span>
          {s.phase === "match" && <span className="text-green">找到位置：{s.found.length ? s.found.join("、") : "尚無"}</span>}
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

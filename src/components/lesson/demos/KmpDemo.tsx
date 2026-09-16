"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const P = "aabaaab";
const T = "aabaabaaab";

const TEXT = demoText(
  {
    buildIntro: "第一階段：對模式 P 自己建失敗函數 pi。pi[i] = P[0..i] 這段裡「最長的、既是前綴也是後綴、但不是整段」的長度。pi[0] = 0。下排是 P 的另一份複本，用來和自己比。",
    buildMatch: (i: number, ci: string, j: number, cj: string) =>
      `P[${i}] = '${ci}' 和 P[${j - 1}] = '${cj}' 相同：目前的邊界延長一格，pi[${i}] = ${j}。意思是 P[0..${i}] 的前 ${j} 個字元和後 ${j} 個字元一樣。`,
    buildJump: (i: number, ci: string, j: number, cj: string, nj: number) =>
      `P[${i}] = '${ci}' ≠ P[${j}] = '${cj}'，長度 ${j} 的邊界延不下去。不是歸零重來：長度 ${j} 的邊界本身也有邊界，pi[${j - 1}] = ${nj}，所以退到 j = ${nj} 再試。`,
    buildMiss: (i: number, ci: string, p0: string) =>
      `P[${i}] = '${ci}' ≠ P[0] = '${p0}'，而且 j 已經是 0，沒有更短的邊界可退，pi[${i}] = 0。`,
    piDone: (table: string) =>
      `pi 表建好：[${table}]，O(m)。第二階段用同一套規則在文字 T 裡找 P：上排換成 T，失配時 j 退到 pi[j−1]，i 永遠不回頭。`,
    matchFound: (i: number, ci: string, m: number, at: number, back: number) =>
      `T[${i}] = '${ci}' 和 P[${m - 1}] 相同，j 走到 ${m}：整個 P 比對完成，在位置 ${at} 找到。接著 j 退到 pi[${m - 1}] = ${back}，繼續找下一個可能重疊的出現。`,
    matchStep: (i: number, ci: string, j: number, cj: string, from: number, to: number) =>
      `T[${i}] = '${ci}' 和 P[${j - 1}] = '${cj}' 相同，j 變 ${j}。目前 P 的前 ${j} 個字元對上了 T[${from}..${to}]。`,
    matchJump: (i: number, ci: string, j: number, cj: string, nj: number) =>
      `T[${i}] = '${ci}' ≠ P[${j}] = '${cj}'，失配。已經對上的 ${j} 個字元 P[0..${j - 1}] 裡，前 ${nj} 個和後 ${nj} 個相同，所以把 P 往右滑到只剩這 ${nj} 個對上：j = pi[${j - 1}] = ${nj}。i 不動，T[${i}] 再和 P[${nj}] 比一次。`,
    matchMiss: (i: number, ci: string, p0: string) =>
      `T[${i}] = '${ci}' ≠ P[0] = '${p0}'，j = 0 沒有東西可退，i 直接往前。`,
    end: (list: string, n: number) =>
      `掃完 T。找到的位置：${list}。i 從頭到尾只往前走 ${n} 步；j 每步最多加 1，後退的總量不會超過前進的總量，所以總共 O(n + m)。`,
    sep: "、",
    opBuild: "建 pi",
    opPiDone: "pi 完成",
    opEnd: "結束",
    topBuild: "上排：P（指標 i）",
    topMatch: "上排：文字 T（指標 i，只會往前）",
    bottom: (offset: string | number) => `下排：P 對齊在位置 i − j = ${offset}（指標 j）`,
    piTitle: "失敗函數 pi（pi[i] = P[0..i] 最長真前綴 = 後綴的長度）",
    foundLabel: "找到位置：",
    none: "尚無",
  },
  {
    en: {
      buildIntro: "Phase one: build the failure function pi for the pattern P against itself. pi[i] is the length of the longest stretch that is both a prefix and a suffix of P[0..i] without being the whole thing. pi[0] = 0. The bottom row is a second copy of P, used to compare P with itself.",
      buildMatch: (i: number, ci: string, j: number, cj: string) =>
        `P[${i}] = '${ci}' matches P[${j - 1}] = '${cj}', so the current border grows by one and pi[${i}] = ${j}. In other words, the first ${j} characters of P[0..${i}] are the same as its last ${j}.`,
      buildJump: (i: number, ci: string, j: number, cj: string, nj: number) =>
        `P[${i}] = '${ci}' ≠ P[${j}] = '${cj}', so the border of length ${j} cannot be extended. Rather than starting over from zero: that border has a border of its own, pi[${j - 1}] = ${nj}, so j drops back to ${nj} and we try again.`,
      buildMiss: (i: number, ci: string, p0: string) =>
        `P[${i}] = '${ci}' ≠ P[0] = '${p0}', and j is already 0, so there is no shorter border left to fall back to: pi[${i}] = 0.`,
      piDone: (table: string) =>
        `The pi table is finished: [${table}], built in O(m). Phase two uses the same rule to look for P inside the text T: the top row becomes T, j falls back to pi[j−1] on a mismatch, and i never moves backwards.`,
      matchFound: (i: number, ci: string, m: number, at: number, back: number) =>
        `T[${i}] = '${ci}' matches P[${m - 1}] and j reaches ${m}: the whole of P has matched, so there is an occurrence at position ${at}. j then drops back to pi[${m - 1}] = ${back} to keep looking for the next, possibly overlapping, occurrence.`,
      matchStep: (i: number, ci: string, j: number, cj: string, from: number, to: number) =>
        `T[${i}] = '${ci}' matches P[${j - 1}] = '${cj}', so j becomes ${j}. The first ${j} characters of P now line up with T[${from}..${to}].`,
      matchJump: (i: number, ci: string, j: number, cj: string, nj: number) =>
        `T[${i}] = '${ci}' ≠ P[${j}] = '${cj}' — a mismatch. Among the ${j} characters P[0..${j - 1}] that did match, the first ${nj} and the last ${nj} are identical, so P slides right until only those ${nj} still overlap: j = pi[${j - 1}] = ${nj}. i does not move, and T[${i}] is compared with P[${nj}] instead.`,
      matchMiss: (i: number, ci: string, p0: string) =>
        `T[${i}] = '${ci}' ≠ P[0] = '${p0}'. With j = 0 there is nothing to fall back to, so i just moves on.`,
      end: (list: string, n: number) =>
        `T has been scanned. Occurrences at: ${list}. i only ever moves forward, ${n} steps in all; j rises by at most 1 per step and can never fall back further than it rose, so the whole search is O(n + m).`,
      sep: ", ",
      opBuild: "build pi",
      opPiDone: "pi done",
      opEnd: "end",
      topBuild: "Top row: P (pointer i)",
      topMatch: "Top row: the text T (pointer i, which never goes back)",
      bottom: (offset: string | number) => `Bottom row: P aligned at i − j = ${offset} (pointer j)`,
      piTitle: "Failure function pi (pi[i] = length of the longest proper prefix of P[0..i] that is also a suffix)",
      foundLabel: "Occurrences: ",
      none: "none yet",
    },
  },
);

type Txt = (typeof TEXT)["zh-Hant"];

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

function buildSteps(t: Txt): Step[] {
  const steps: Step[] = [];
  const m = P.length, n = T.length;
  const pi: (number | null)[] = P.split("").map(() => null);
  const found: number[] = [];
  const snap = (desc: string, op: string, phase: Step["phase"], i: number, j: number, kind: Step["kind"], via?: number) => steps.push({ desc, op, phase, i, j, pi: [...pi], kind, found: [...found], via });

  pi[0] = 0;
  snap(t.buildIntro, t.opBuild, "build", 0, 0, "info");
  let j = 0;
  for (let i = 1; i < m; i++) {
    for (;;) {
      if (P[i] === P[j]) {
        j++;
        pi[i] = j;
        snap(t.buildMatch(i, P[i], j, P[j - 1]), `pi[${i}]`, "build", i, j, "match");
        break;
      }
      if (j > 0) {
        const nj = pi[j - 1] as number;
        snap(t.buildJump(i, P[i], j, P[j], nj), `pi[${i}]`, "build", i, nj, "jump", j - 1);
        j = nj;
      } else {
        pi[i] = 0;
        snap(t.buildMiss(i, P[i], P[0]), `pi[${i}]`, "build", i, 0, "miss");
        break;
      }
    }
  }
  snap(t.piDone(pi.join(", ")), t.opPiDone, "match", 0, 0, "info");

  j = 0;
  for (let i = 0; i < n; i++) {
    for (;;) {
      if (T[i] === P[j]) {
        j++;
        if (j === m) {
          found.push(i - m + 1);
          snap(t.matchFound(i, T[i], m, i - m + 1, pi[m - 1] as number), `T[${i}]`, "match", i, j, "found");
          j = pi[m - 1] as number;
        } else {
          snap(t.matchStep(i, T[i], j, P[j - 1], i - j + 1, i), `T[${i}]`, "match", i, j, "match");
        }
        break;
      }
      if (j > 0) {
        const nj = pi[j - 1] as number;
        snap(t.matchJump(i, T[i], j, P[j], nj), `T[${i}]`, "match", i, nj, "jump", j - 1);
        j = nj;
      } else {
        snap(t.matchMiss(i, T[i], P[0]), `T[${i}]`, "match", i, 0, "miss");
        break;
      }
    }
  }
  snap(t.end(found.join(t.sep), n), t.opEnd, "match", n, 0, "info");
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
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
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
          <div className="eyebrow mb-1.5">{s.phase === "build" ? t.topBuild : t.topMatch}</div>
          <Row chars={top} offset={0} tone={topTone} />
          <div className="eyebrow mt-3 mb-1.5">{t.bottom(active ? offset : "·")}</div>
          <Row chars={P.split("")} offset={active ? offset : 0} tone={botTone} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.piTitle}</div>
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
          {s.phase === "match" && <span className="text-green">{t.foundLabel}{s.found.length ? s.found.join(t.sep) : t.none}</span>}
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

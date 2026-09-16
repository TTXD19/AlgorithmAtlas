"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const S = "aabcaabcaab";

const TEXT = demoText(
  {
    listSeparator: "、",
    opStart: "開始",
    opEnd: "結束",
    intro: (n: number) =>
      `Z[i] = 從位置 i 開始的後綴，和整個字串 s 的最長共同前綴長度。Z[0] 就是整串長度 ${n}，通常不用。[l, r] 記住目前「最靠右」的一段匹配區間：s[l..r] 和 s[0..r−l] 完全相同。`,
    whereRight: (l: number, r: number) => `在視窗 [${l}, ${r}] 右邊`,
    whereNone: "還沒有任何視窗",
    naive: (i: number, where: string, k: number, l: number, r: number) =>
      `i = ${i} ${where}，沒有可借的資訊，老實逐字元比：s[${i}..] 和 s[0..] 對到 ${k} 個字元${k > 0 ? `，Z[${i}] = ${k}，新視窗 [${l}, ${r}]` : `，Z[${i}] = 0，視窗不變`}。`,
    copy: (i: number, l: number, r: number, mirror: number, zm: number, room: number) =>
      `i = ${i} 在視窗 [${l}, ${r}] 裡。視窗這段和 s 的開頭一模一樣，所以 s[${i}..] 在視窗內的樣子等於 s[${mirror}..]。Z[${mirror}] = ${zm}，而 i 到 r 還有 ${room} 格，${zm} < ${room} 表示 s[${mirror}..] 的匹配在視窗內就斷了，直接抄：Z[${i}] = ${zm}，零次比較。`,
    moreNone: "視窗已經延伸到字串結尾，沒有字元可以再比",
    moreSome: (from: number, against: number, extra: number) => `從 s[${from}] 和 s[${against}] 開始往後比，多對上 ${extra} 個`,
    extend: (i: number, mirror: number, zm: number, room: number, more: string, k: number, l: number, r: number) =>
      `i = ${i} 在視窗裡，鏡像 Z[${mirror}] = ${zm} ≥ 剩餘 ${room} 格，只能確定前 ${room} 個字元一定匹配，視窗外的不知道。${more}，Z[${i}] = ${k}，視窗更新為 [${l}, ${r}]。`,
    finish: (z: string, positions: string, first: number, block: string) =>
      `Z 陣列完成：[${z}]。每次比對成功都讓 r 往右推一格，失敗的比較每個 i 最多一次，所以總共 O(n)。位置 ${positions} 滿足 i + Z[i] = n，最小的 ${first} 就是最小週期：s 可以由「${block}」重複拼出（最後一塊可以不完整），這就是週期偵測。`,
    stringTitle: "字串 s（藍色 = i，綠色 = 鏡像 i − l，黃色 = 這一步比出來的匹配，灰色 = 對應的前綴）",
    windowTitle: "目前視窗 [l, r]（黃色）：s[l..r] 和 s[0..r−l] 相同",
    prevWindow: (l: number, r: number) => `原視窗 [${l}, ${r}]`,
    mirrorInfo: (mirror: number, z: number | null) => `鏡像 i − l = ${mirror}，Z[${mirror}] = ${z}`,
    roomInfo: (room: number) => `i 到 r 還剩 ${room} 格`,
    zArray: "Z 陣列",
    periodTitle: "週期線索",
    periodPre: "i + Z[i] = n 成立，字串可以由「",
    periodMid: "」（長度 ",
    periodEnd: "）重複拼出。",
  },
  {
    en: {
      listSeparator: ", ",
      opStart: "Start",
      opEnd: "Done",
      intro: (n: number) =>
        `Z[i] is the length of the longest common prefix of s and the suffix that starts at position i. Z[0] is simply the whole length, ${n}, and is normally unused. [l, r] remembers the rightmost matching window found so far: s[l..r] is identical to s[0..r−l].`,
      whereRight: (l: number, r: number) => `it sits past the current window [${l}, ${r}]`,
      whereNone: "there is no window yet",
      naive: (i: number, where: string, k: number, l: number, r: number) =>
        `i = ${i}: ${where}, so there is nothing to reuse and the characters have to be compared one at a time. s[${i}..] and s[0..] agree on ${k} character${k === 1 ? "" : "s"}${k > 0 ? `, so Z[${i}] = ${k} and the new window is [${l}, ${r}]` : `, so Z[${i}] = 0 and the window is unchanged`}.`,
      copy: (i: number, l: number, r: number, mirror: number, zm: number, room: number) =>
        `i = ${i} falls inside the window [${l}, ${r}]. That stretch is an exact copy of the start of s, so within the window s[${i}..] looks just like s[${mirror}..]. Z[${mirror}] = ${zm} and there ${room === 1 ? "is 1 position" : `are ${room} positions`} left from i to r, and ${zm} < ${room} means the match from s[${mirror}..] already breaks before the window ends — so the value can be copied straight over: Z[${i}] = ${zm}, at the cost of zero comparisons.`,
      moreNone: "the window already runs to the end of the string and there is nothing left to compare",
      moreSome: (from: number, against: number, extra: number) => `comparing onwards from s[${from}] against s[${against}] matches ${extra} more character${extra === 1 ? "" : "s"}`,
      extend: (i: number, mirror: number, zm: number, room: number, more: string, k: number, l: number, r: number) =>
        `i = ${i} is inside the window, and the mirror Z[${mirror}] = ${zm} ≥ the ${room} position${room === 1 ? "" : "s"} left, so only the first ${room} character${room === 1 ? "" : "s"} are guaranteed to match and anything beyond the window is unknown: ${more}, so Z[${i}] = ${k} and the window becomes [${l}, ${r}].`,
      finish: (z: string, positions: string, first: number, block: string) =>
        `The Z array is complete: [${z}]. Every successful comparison pushes r one place to the right, and each i costs at most one failed comparison, so the whole scan is O(n). Positions ${positions} satisfy i + Z[i] = n, and the smallest of them, ${first}, is the smallest period: s is "${block}" repeated, with the last copy allowed to be partial. That is period detection.`,
      stringTitle: "The string s (blue = i, green = the mirror i − l, yellow = the match found in this step, grey = the prefix it corresponds to)",
      windowTitle: "The current window [l, r] (yellow): s[l..r] equals s[0..r−l]",
      prevWindow: (l: number, r: number) => `previous window [${l}, ${r}]`,
      mirrorInfo: (mirror: number, z: number | null) => `mirror i − l = ${mirror}, Z[${mirror}] = ${z}`,
      roomInfo: (room: number) => `${room} position${room === 1 ? "" : "s"} left from i to r`,
      zArray: "The Z array",
      periodTitle: "Period clue",
      periodPre: "i + Z[i] = n holds here, so the string is ",
      periodMid: " (length ",
      periodEnd: ") repeated.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  i: number;
  l: number;
  r: number;
  z: (number | null)[];
  mirror?: number;         // i − l
  room?: number;           // i 到 r 還剩幾格（i 在視窗內時）
  prev?: [number, number]; // 延伸前的舊視窗
  kind: "naive" | "copy" | "extend" | "info";
  period?: number;
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const n = S.length;
  const z: (number | null)[] = S.split("").map(() => null);
  let l = 0, r = 0;
  let firstPeriod: number | undefined;
  const per = (i: number, k: number) => { if (firstPeriod === undefined && i + k === n) { firstPeriod = i; return i; } return undefined; };
  const snap = (desc: string, op: string, i: number, kind: Step["kind"], extra: Partial<Step> = {}) => steps.push({ desc, op, i, l, r, z: [...z], kind, ...extra });

  z[0] = n;
  snap(t.intro(n), t.opStart, 0, "info");

  for (let i = 1; i < n; i++) {
    if (i > r) {
      let k = 0;
      while (i + k < n && S[k] === S[i + k]) k++;
      z[i] = k;
      const where = r > 0 ? t.whereRight(l, r) : t.whereNone;
      if (k > 0) { l = i; r = i + k - 1; }
      snap(
        t.naive(i, where, k, l, r),
        `Z[${i}]`, i, "naive", { period: per(i, k) },
      );
    } else {
      const mirror = i - l;
      const zm = z[mirror] as number;
      const room = r - i + 1;
      if (zm < room) {
        z[i] = zm;
        snap(
          t.copy(i, l, r, mirror, zm, room),
          `Z[${i}]`, i, "copy", { mirror, room },
        );
      } else {
        let k = room;
        while (i + k < n && S[k] === S[i + k]) k++;
        z[i] = k;
        const prev: [number, number] = [l, r];
        l = i; r = i + k - 1;
        const more = i + room === n ? t.moreNone : t.moreSome(i + room, room, k - room);
        snap(
          t.extend(i, mirror, zm, room, more, k, l, r),
          `Z[${i}]`, i, "extend", { mirror, room, prev, period: per(i, k) },
        );
      }
    }
  }
  const pers = [...Array(n).keys()].slice(1).filter((i) => i + (z[i] as number) === n);
  snap(t.finish(z.map((v, i) => (i === 0 ? "·" : v)).join(", "), pers.join(t.listSeparator), pers[0], S.slice(0, pers[0])), t.opEnd, n, "info", { period: pers[0] });
  return steps;
}

export function ZAlgoDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const n = S.length;
  const active = s.kind !== "info";
  const zi = active ? (s.z[s.i] as number) : 0;

  const charTone = (idx: number) => {
    if (!active) {
      if (s.period !== undefined && s.i === n) return Math.floor(idx / s.period) % 2 === 0 ? CELL.amber : CELL.dim;
      return "";
    }
    if (idx === s.i) return CELL.accent;
    if (idx === s.mirror) return CELL.green;
    if (idx > s.i && idx < s.i + zi) return s.kind === "copy" ? CELL.green : CELL.amber;
    if (idx >= 0 && idx < zi && s.kind !== "copy") return CELL.dim;
    return "";
  };
  const winTone = (idx: number) => (active && s.r >= s.l && s.r > 0 && idx >= s.l && idx <= s.r ? CELL.amber : "");

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`s = "${S}"`} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div>
          <div className="eyebrow mb-1.5">{t.stringTitle}</div>
          <Cells items={S.split("")} tone={charTone} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.windowTitle}</div>
          <Cells items={S.split("").map((_, idx) => idx)} tone={winTone} />
          <div className="mt-1.5 flex flex-wrap gap-x-5 font-mono text-[12.5px] tabular-nums text-ink-2">
            <span>l = {active ? s.l : "·"}</span>
            <span>r = {active ? s.r : "·"}</span>
            <span>i = {active ? s.i : "·"}</span>
            {s.prev && <span className="text-ink-3">{t.prevWindow(s.prev[0], s.prev[1])}</span>}
            {s.mirror !== undefined && <span className="text-green">{t.mirrorInfo(s.mirror, s.z[s.mirror])}</span>}
            {s.room !== undefined && <span className="text-ink-3">{t.roomInfo(s.room)}</span>}
          </div>
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.zArray}</div>
          <Cells items={s.z.map((v, idx) => (idx === 0 ? "·" : v === null ? "·" : v))} tone={(idx) => (active && idx === s.i ? (s.kind === "copy" ? CELL.green : CELL.accent) : idx === s.mirror ? CELL.green : s.z[idx] === null || idx === 0 ? CELL.dim : "")} />
        </div>
        {s.period !== undefined && (
          <div className="rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px]">
            <span className="mr-1.5 font-semibold text-ink">{t.periodTitle}</span>
            {t.periodPre}<span className="font-mono text-amber">{S.slice(0, s.period)}</span>{t.periodMid}{s.period}{t.periodEnd}
          </div>
        )}
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

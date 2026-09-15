"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const S = "aabcaabcaab";

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

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const n = S.length;
  const z: (number | null)[] = S.split("").map(() => null);
  let l = 0, r = 0;
  let firstPeriod: number | undefined;
  const per = (i: number, k: number) => { if (firstPeriod === undefined && i + k === n) { firstPeriod = i; return i; } return undefined; };
  const snap = (desc: string, op: string, i: number, kind: Step["kind"], extra: Partial<Step> = {}) => steps.push({ desc, op, i, l, r, z: [...z], kind, ...extra });

  z[0] = n;
  snap(`Z[i] = 從位置 i 開始的後綴，和整個字串 s 的最長共同前綴長度。Z[0] 就是整串長度 ${n}，通常不用。[l, r] 記住目前「最靠右」的一段匹配區間：s[l..r] 和 s[0..r−l] 完全相同。`, "開始", 0, "info");

  for (let i = 1; i < n; i++) {
    if (i > r) {
      let k = 0;
      while (i + k < n && S[k] === S[i + k]) k++;
      z[i] = k;
      const where = r > 0 ? `在視窗 [${l}, ${r}] 右邊` : "還沒有任何視窗";
      if (k > 0) { l = i; r = i + k - 1; }
      snap(
        `i = ${i} ${where}，沒有可借的資訊，老實逐字元比：s[${i}..] 和 s[0..] 對到 ${k} 個字元${k > 0 ? `，Z[${i}] = ${k}，新視窗 [${l}, ${r}]` : `，Z[${i}] = 0，視窗不變`}。`,
        `Z[${i}]`, i, "naive", { period: per(i, k) },
      );
    } else {
      const mirror = i - l;
      const zm = z[mirror] as number;
      const room = r - i + 1;
      if (zm < room) {
        z[i] = zm;
        snap(
          `i = ${i} 在視窗 [${l}, ${r}] 裡。視窗這段和 s 的開頭一模一樣，所以 s[${i}..] 在視窗內的樣子等於 s[${mirror}..]。Z[${mirror}] = ${zm}，而 i 到 r 還有 ${room} 格，${zm} < ${room} 表示 s[${mirror}..] 的匹配在視窗內就斷了，直接抄：Z[${i}] = ${zm}，零次比較。`,
          `Z[${i}]`, i, "copy", { mirror, room },
        );
      } else {
        let k = room;
        while (i + k < n && S[k] === S[i + k]) k++;
        z[i] = k;
        const prev: [number, number] = [l, r];
        l = i; r = i + k - 1;
        const more = i + room === n ? `視窗已經延伸到字串結尾，沒有字元可以再比` : `從 s[${i + room}] 和 s[${room}] 開始往後比，多對上 ${k - room} 個`;
        snap(
          `i = ${i} 在視窗裡，鏡像 Z[${mirror}] = ${zm} ≥ 剩餘 ${room} 格，只能確定前 ${room} 個字元一定匹配，視窗外的不知道。${more}，Z[${i}] = ${k}，視窗更新為 [${l}, ${r}]。`,
          `Z[${i}]`, i, "extend", { mirror, room, prev, period: per(i, k) },
        );
      }
    }
  }
  const pers = [...Array(n).keys()].slice(1).filter((i) => i + (z[i] as number) === n);
  snap(`Z 陣列完成：[${z.map((v, i) => (i === 0 ? "·" : v)).join(", ")}]。每次比對成功都讓 r 往右推一格，失敗的比較每個 i 最多一次，所以總共 O(n)。位置 ${pers.join("、")} 滿足 i + Z[i] = n，最小的 ${pers[0]} 就是最小週期：s 可以由「${S.slice(0, pers[0])}」重複拼出（最後一塊可以不完整），這就是週期偵測。`, "結束", n, "info", { period: pers[0] });
  return steps;
}

export function ZAlgoDemo() {
  const steps = useMemo(() => buildSteps(), []);
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
          <div className="eyebrow mb-1.5">字串 s（藍色 = i，綠色 = 鏡像 i − l，黃色 = 這一步比出來的匹配，灰色 = 對應的前綴）</div>
          <Cells items={S.split("")} tone={charTone} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">目前視窗 [l, r]（黃色）：s[l..r] 和 s[0..r−l] 相同</div>
          <Cells items={S.split("").map((_, idx) => idx)} tone={winTone} />
          <div className="mt-1.5 flex flex-wrap gap-x-5 font-mono text-[12.5px] tabular-nums text-ink-2">
            <span>l = {active ? s.l : "·"}</span>
            <span>r = {active ? s.r : "·"}</span>
            <span>i = {active ? s.i : "·"}</span>
            {s.prev && <span className="text-ink-3">原視窗 [{s.prev[0]}, {s.prev[1]}]</span>}
            {s.mirror !== undefined && <span className="text-green">鏡像 i − l = {s.mirror}，Z[{s.mirror}] = {s.z[s.mirror]}</span>}
            {s.room !== undefined && <span className="text-ink-3">i 到 r 還剩 {s.room} 格</span>}
          </div>
        </div>
        <div>
          <div className="eyebrow mb-1.5">Z 陣列</div>
          <Cells items={s.z.map((v, idx) => (idx === 0 ? "·" : v === null ? "·" : v))} tone={(idx) => (active && idx === s.i ? (s.kind === "copy" ? CELL.green : CELL.accent) : idx === s.mirror ? CELL.green : s.z[idx] === null || idx === 0 ? CELL.dim : "")} />
        </div>
        {s.period !== undefined && (
          <div className="rounded-md border border-line bg-surface-2 px-3 py-2 text-[13px]">
            <span className="mr-1.5 font-semibold text-ink">週期線索</span>
            i + Z[i] = n 成立，字串可以由「<span className="font-mono text-amber">{S.slice(0, s.period)}</span>」（長度 {s.period}）重複拼出。
          </div>
        )}
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useT } from "../../LocaleProvider";
import { BTN_PLAIN, BTN_PRIMARY } from "./StepBar";

const MIN = 2;
const MAX = 12;
const LIMIT = 999;

/** 解析「5, 2, 9」或「5 2 9」。不合法回傳 null。 */
export function parseArray(raw: string): number[] | null {
  const parts = raw.trim().split(/[,\s，]+/).filter(Boolean);
  if (parts.length < MIN || parts.length > MAX) return null;
  const nums = parts.map((p) => (/^-?\d{1,3}$/.test(p.replace("−", "-")) ? Number(p.replace("−", "-")) : NaN));
  return nums.some((x) => Number.isNaN(x) || Math.abs(x) > LIMIT) ? null : nums;
}

function randomArray(n: number, sorted: boolean): number[] {
  const pool = new Set<number>();
  while (pool.size < n) pool.add(1 + Math.floor(Math.random() * 99));
  const a = [...pool];
  return sorted ? a.sort((x, y) => x - y) : a;
}

/**
 * 示範元件共用的「自訂輸入」列：一個陣列欄位，可選一個目標值欄位。
 *
 * 只在按「套用」或 Enter 時才回呼，打字中不重算步驟。
 * sorted 給搜尋類示範用：輸入的陣列會先排序再套用。
 */
export function DemoInput({
  value,
  defaults,
  onChange,
  sorted,
  target,
}: {
  value: number[];
  defaults: number[];
  onChange: (arr: number[]) => void;
  sorted?: boolean;
  target?: { value: number; defaults: number; onChange: (n: number) => void };
}) {
  const t = useT();
  const [raw, setRaw] = useState(value.join(", "));
  const [rawTarget, setRawTarget] = useState(String(target?.value ?? ""));
  const [err, setErr] = useState<string | null>(null);

  const apply = () => {
    const arr = parseArray(raw);
    if (!arr) return setErr(t.demo.invalid);
    let tv: number | undefined;
    if (target) {
      const s = rawTarget.trim().replace("−", "-");
      if (!/^-?\d{1,3}$/.test(s)) return setErr(t.demo.invalidTarget);
      tv = Number(s);
    }
    setErr(null);
    const next = sorted ? [...arr].sort((a, b) => a - b) : arr;
    setRaw(next.join(", "));
    onChange(next);
    if (target && tv !== undefined) target.onChange(tv);
  };
  const set = (arr: number[], tv?: number) => {
    setErr(null);
    setRaw(arr.join(", "));
    onChange(arr);
    if (target && tv !== undefined) {
      setRawTarget(String(tv));
      target.onChange(tv);
    }
  };
  const inputCls = "h-[30px] rounded-md border border-line bg-surface px-2.5 font-mono text-[12.5px] text-ink focus:border-accent focus:outline-none";

  return (
    <form
      className="border-b border-line bg-surface px-3.5 py-2.5 text-[12.5px]"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow">{t.demo.custom}</span>
        <label className="flex items-center gap-1.5">
          <span className="text-ink-3">{t.demo.arrayField}</span>
          <input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className={`${inputCls} w-[220px] max-w-full`}
            aria-label={t.demo.arrayField}
            spellCheck={false}
          />
        </label>
        {target && (
          <label className="flex items-center gap-1.5">
            <span className="text-ink-3">{t.demo.targetField}</span>
            <input
              value={rawTarget}
              onChange={(e) => setRawTarget(e.target.value)}
              className={`${inputCls} w-[64px]`}
              aria-label={t.demo.targetField}
            />
          </label>
        )}
        <button type="submit" className={BTN_PRIMARY}>{t.demo.apply}</button>
        <button
          type="button"
          className={BTN_PLAIN}
          onClick={() => {
            const arr = randomArray(defaults.length, !!sorted);
            set(arr, target ? arr[Math.floor(Math.random() * arr.length)] : undefined);
          }}
        >
          {t.demo.random}
        </button>
        <button type="button" className={BTN_PLAIN} onClick={() => set(defaults, target?.defaults)}>{t.demo.defaults}</button>
      </div>
      <div className={`mt-1 ${err ? "text-accent" : "text-ink-3"}`}>
        {err ?? `${t.demo.inputHint}${sorted ? ` · ${t.demo.sortedNote}` : ""}`}
      </div>
    </form>
  );
}

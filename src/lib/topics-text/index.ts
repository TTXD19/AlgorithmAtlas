import { TOPICS, type Topic, type Subtopic } from "../topics";
import { TOPIC_IDS, SUB_KEYS } from "./keys";
import type { TopicsText } from "./types";
import { en } from "./en";
import type { Locale } from "../i18n";

const OVERRIDES: Partial<Record<Locale, TopicsText>> = { en };

/**
 * keys.ts 是從 topics.ts 產生的，兩者必須一致。沿用 validateRoadmap 的慣例：
 * 對不上就在建置時炸掉，而不是讓某個語言靜默少一塊。
 */
export function assertKeysMatch() {
  const problems: string[] = [];
  const actualTopics = new Set(TOPICS.map((t) => t.id));
  const actualSubs = new Set(TOPICS.flatMap((t) => t.subs.map((s) => `${t.id}/${s.id}`)));

  for (const id of TOPIC_IDS) if (!actualTopics.has(id)) problems.push(`keys.ts 有多餘的主題：${id}`);
  for (const id of actualTopics) if (!(TOPIC_IDS as readonly string[]).includes(id)) problems.push(`keys.ts 缺少主題：${id}`);
  for (const k of SUB_KEYS) if (!actualSubs.has(k)) problems.push(`keys.ts 有多餘的細項：${k}`);
  for (const k of actualSubs) if (!(SUB_KEYS as readonly string[]).includes(k)) problems.push(`keys.ts 缺少細項：${k}`);
  return problems;
}

/** 依語言取得主題資料。原文語言直接回傳 TOPICS，其他語言套用覆寫。 */
export function getTopics(locale: Locale): Topic[] {
  const o = OVERRIDES[locale];
  if (!o) return TOPICS;
  return TOPICS.map((t) => {
    const tt = o.topics[t.id as keyof typeof o.topics];
    return {
      ...t,
      ...(tt ? { zh: tt.zh, desc: tt.desc, intro: tt.intro ?? t.intro, prereq: tt.prereq ?? t.prereq, applications: tt.applications } : {}),
      subs: t.subs.map((s): Subtopic => {
        const st = o.subs[`${t.id}/${s.id}` as keyof typeof o.subs];
        return st ? { ...s, zh: st.zh, desc: st.desc ?? s.desc, apply: st.apply, time: st.time ?? s.time, space: st.space ?? s.space } : s;
      }),
    };
  });
}

export function getKindLabel(locale: Locale) {
  const o = OVERRIDES[locale];
  return o ? o.kind : { ds: "資料結構", algo: "演算法" };
}

export function getLevelLabel(locale: Locale) {
  const o = OVERRIDES[locale];
  return o ? o.level : { 1: "入門", 2: "進階", 3: "困難" };
}

export type { TopicsText };

export function getTopicBy(locale: Locale, id: string): Topic | undefined {
  return getTopics(locale).find((t) => t.id === id);
}

export function getSubtopicBy(locale: Locale, topicId: string, subId: string) {
  const t = getTopicBy(locale, topicId);
  const s = t?.subs.find((x) => x.id === subId);
  return t && s ? { topic: t, sub: s } : undefined;
}

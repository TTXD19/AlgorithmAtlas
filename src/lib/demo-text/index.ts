import type { Locale } from "../i18n";
import type { DemoText } from "./types";
import { demoZhHant } from "./zh-Hant";
import { demoEn } from "./en";

const ALL: Record<Locale, DemoText> = { "zh-Hant": demoZhHant, en: demoEn };

export function getDemoText(locale: Locale): DemoText {
  return ALL[locale];
}

export type { DemoText, GraphDemoText } from "./types";

import type { Locale } from "../i18n";
import { zhHant, type Messages } from "./zh-Hant";
import { en } from "./en";

const ALL: Record<Locale, Messages> = {
  "zh-Hant": zhHant,
  en,
};

export function getMessages(locale: Locale): Messages {
  return ALL[locale];
}

export type { Messages };

"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { getMessages, type Messages } from "@/lib/messages";

const Ctx = createContext<Locale>(DEFAULT_LOCALE);

/**
 * 把目前語言傳給 client 元件。
 *
 * server 元件直接從 route 的 params 拿 lang，不需要這個；這個只給
 * Header、Search、AuthButton 這類無法拿到 params 的 client 元件。
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export function useLocale(): Locale {
  return useContext(Ctx);
}

/** client 元件取 UI 字串。 */
export function useT(): Messages {
  return getMessages(useContext(Ctx));
}

/** 產生帶語言前綴的連結。 */
export function useHref() {
  const locale = useContext(Ctx);
  return (path: string) => `/${locale}${path === "/" ? "" : path}`;
}

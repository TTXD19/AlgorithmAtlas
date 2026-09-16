import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Search } from "./Search";
import { AuthButton } from "./AuthButton";
import { LocaleSwitcher } from "./LocaleSwitcher";
import type { Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/messages";

export function Header({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const home = `/${locale}`;
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur-md md:gap-4 md:px-6">
      <Link href={home} className="flex shrink-0 items-center gap-2.5">
        <svg viewBox="0 0 26 26" fill="none" className="h-[26px] w-[26px]" aria-hidden="true">
          <circle cx="6" cy="20" r="3.2" className="fill-accent" />
          <circle cx="20" cy="20" r="3.2" className="fill-accent" />
          <circle cx="13" cy="6" r="3.2" className="fill-ink" />
          <path d="M13 9.2 6 17M13 9.2l7 7.8M9.2 20h7.6" className="stroke-ink" strokeWidth="1.8" />
        </svg>
        <span className="font-display text-[17px] font-extrabold tracking-[-0.01em] whitespace-nowrap">{t.site.name}</span>
        <span className="hidden whitespace-nowrap text-[13px] font-medium text-ink-3 sm:inline">{t.site.tagline}</span>
      </Link>

      <div className="flex items-center" role="search">
        <Search />
      </div>

      <nav className="flex shrink-0 items-center gap-1">
        <Link href={home} className="rounded-md px-2 py-1.5 text-[13.5px] font-medium whitespace-nowrap text-ink-2 hover:bg-surface-2 hover:text-ink md:px-2.5">{t.nav.topics}</Link>
        <Link href={`${home}/roadmap`} className="rounded-md px-2 py-1.5 text-[13.5px] font-medium whitespace-nowrap text-ink-2 hover:bg-surface-2 hover:text-ink md:px-2.5">{t.nav.roadmap}</Link>
        <LocaleSwitcher />
        <ThemeToggle />
        <AuthButton />
      </nav>
    </header>
  );
}

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Search } from "./Search";
import { AuthButton } from "./AuthButton";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur-md md:gap-4 md:px-6">
      <Link href="/" className="flex shrink-0 items-center gap-2.5">
        <svg viewBox="0 0 26 26" fill="none" className="h-[26px] w-[26px]" aria-hidden="true">
          <circle cx="6" cy="20" r="3.2" className="fill-accent" />
          <circle cx="20" cy="20" r="3.2" className="fill-accent" />
          <circle cx="13" cy="6" r="3.2" className="fill-ink" />
          <path d="M13 9.2 6 17M13 9.2l7 7.8M9.2 20h7.6" className="stroke-ink" strokeWidth="1.8" />
        </svg>
        <span className="font-display text-[17px] font-extrabold tracking-[-0.01em] whitespace-nowrap">演算法圖鑑</span>
        <span className="hidden whitespace-nowrap text-[13px] font-medium text-ink-3 sm:inline">Algorithm Atlas</span>
      </Link>

      <div className="flex items-center" role="search">
        <Search />
      </div>

      <nav className="flex shrink-0 items-center gap-1">
        <Link href="/" className="rounded-md px-2 py-1.5 text-[13.5px] font-medium whitespace-nowrap text-ink-2 hover:bg-surface-2 hover:text-ink md:px-2.5">主題</Link>
        <Link href="/roadmap" className="rounded-md px-2 py-1.5 text-[13.5px] font-medium whitespace-nowrap text-ink-2 hover:bg-surface-2 hover:text-ink md:px-2.5">學習路線</Link>
        <ThemeToggle />
        <AuthButton />
      </nav>
    </header>
  );
}

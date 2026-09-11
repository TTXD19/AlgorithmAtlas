import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-line bg-bg/90 px-6 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2.5">
        <svg viewBox="0 0 26 26" fill="none" className="h-[26px] w-[26px]" aria-hidden="true">
          <circle cx="6" cy="20" r="3.2" className="fill-accent" />
          <circle cx="20" cy="20" r="3.2" className="fill-accent" />
          <circle cx="13" cy="6" r="3.2" className="fill-ink" />
          <path d="M13 9.2 6 17M13 9.2l7 7.8M9.2 20h7.6" className="stroke-ink" strokeWidth="1.8" />
        </svg>
        <span className="font-display text-[17px] font-extrabold tracking-[-0.01em]">演算法圖鑑</span>
        <span className="text-[13px] font-medium text-ink-3">Algorithm Atlas</span>
      </Link>

      <div className="hidden h-8 min-w-[220px] items-center gap-2 rounded-[7px] border border-line bg-surface px-2.5 text-[13px] text-ink-3 md:flex" role="search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        搜尋演算法⋯
        <kbd className="ml-auto rounded border border-line px-1.5 font-sans text-[11px]">⌘K</kbd>
      </div>

      <nav className="flex items-center gap-1">
        <Link href="/" className="rounded-md px-2.5 py-1.5 text-[13.5px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">主題</Link>
        <Link href="/roadmap" className="rounded-md px-2.5 py-1.5 text-[13.5px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">學習路線</Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}

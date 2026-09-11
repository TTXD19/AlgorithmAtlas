import Link from "next/link";

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav className="mb-3.5 flex items-center gap-2 text-[13px] text-ink-3" aria-label="麵包屑">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="opacity-60">/</span>}
          {it.href ? <Link href={it.href} className="hover:text-ink">{it.label}</Link> : <span>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}
